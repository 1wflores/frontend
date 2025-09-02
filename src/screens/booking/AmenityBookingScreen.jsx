// src/screens/booking/AmenityBookingScreen.jsx - IMPROVED LOUNGE BOOKING

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { useReservations } from '../../hooks/useReservations';
import { amenityService } from '../../services/amenityService';
import { reservationService } from '../../services/reservationService';
import { DateUtils } from '../../utils/dateUtils';
import { Localization } from '../../utils/localization';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const AmenityBookingScreen = ({ route, navigation }) => {
  const { amenityId } = route.params || {};
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { createReservation, loading: reservationLoading } = useReservations();
  
  // State management
  const [amenity, setAmenity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  
  // NEW: Improved time selection for lounge
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [availableStartTimes, setAvailableStartTimes] = useState([]);
  const [availableEndTimes, setAvailableEndTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  
  // Lounge-specific states
  const [visitorCount, setVisitorCount] = useState('1');
  const [willUseGrill, setWillUseGrill] = useState(false);
  const [isLounge, setIsLounge] = useState(false);

  // Load amenity details on component mount
  useEffect(() => {
    if (amenityId) {
      loadAmenityDetails();
    }
  }, [amenityId]);

  // Load available start times when date changes
  useEffect(() => {
    if (amenity && selectedDate) {
      loadAvailableStartTimes();
    }
  }, [selectedDate, amenity]);

  // Load available end times when start time changes
  useEffect(() => {
    if (selectedStartTime && amenity) {
      loadAvailableEndTimes();
    } else {
      setAvailableEndTimes([]);
      setSelectedEndTime(null);
    }
  }, [selectedStartTime, amenity]);

  const loadAmenityDetails = async () => {
    try {
      setLoading(true);
      console.log('🏢 Loading amenity details for:', amenityId);
      
      const amenityData = await amenityService.getAmenityById(amenityId);
      
      if (!amenityData) {
        throw new Error('Amenity not found');
      }
      
      console.log('✅ Amenity loaded:', amenityData);
      setAmenity(amenityData);
      
      // Check if it's a lounge amenity
      const loungeCheck = amenityData.type === 'lounge' || 
                         amenityData.name?.toLowerCase().includes('lounge');
      setIsLounge(loungeCheck);
      
      console.log('🏛️ Is lounge:', loungeCheck);
      
    } catch (error) {
      console.error('❌ Error loading amenity details:', error);
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'Error al cargar detalles de la amenidad'
          : 'Error loading amenity details'
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  const loadAvailableStartTimes = async () => {
    if (!amenity || !amenityId) {
      console.log('⚠️ Skipping time loading - missing amenity or amenityId');
      return;
    }

    try {
      setLoadingTimes(true);
      console.log('🕐 Loading available start times...');
      
      const formattedDate = DateUtils.formatDate(selectedDate, 'YYYY-MM-DD');
      
      // For lounge, we need to get all possible start times
      // We'll generate 30-minute intervals and check availability
      const startTimes = await generateAvailableStartTimes(formattedDate);
      
      console.log('✅ Available start times:', startTimes);
      setAvailableStartTimes(startTimes);
      
      // Clear selections when start times change
      setSelectedStartTime(null);
      setSelectedEndTime(null);
      
    } catch (error) {
      console.error('❌ Error loading start times:', error);
      setAvailableStartTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const generateAvailableStartTimes = async (date) => {
    try {
      // Get operating hours for the amenity
      const operatingHours = amenity.operatingHours || { start: '08:00', end: '23:00' };
      const [startHour, startMinute] = operatingHours.start.split(':').map(Number);
      const [endHour, endMinute] = operatingHours.end.split(':').map(Number);
      
      // FIXED: Get actual max duration from amenity data with proper fallback
      let maxDurationMinutes = amenity.maxDuration || 
                               amenity.maxDurationMinutes || 
                               amenity.autoApprovalRules?.maxDurationMinutes ||
                               (isLounge ? 900 : 60); // FIXED: Changed fallback from 240 to 900
      
      maxDurationMinutes = parseInt(maxDurationMinutes);
      const maxDurationHours = maxDurationMinutes / 60;
      
      console.log(`📊 Using max duration: ${maxDurationMinutes} minutes (${maxDurationHours} hours)`);
      
      // Get existing reservations for this date
      const existingReservations = await getExistingReservations(date);
      
      const startTimes = [];
      const dateObj = new Date(date);
      
      // Calculate the latest possible start time
      // We need to ensure there's enough time before operating hours end
      const latestStartHour = endHour - Math.ceil(maxDurationHours);
      const actualLatestStartHour = Math.max(startHour, latestStartHour);
      
      console.log(`🏢 Operating hours: ${startHour}:${startMinute.toString().padStart(2, '0')} - ${endHour}:${endMinute.toString().padStart(2, '0')}`);
      console.log(`⏰ Latest start time: ${actualLatestStartHour}:00 (to allow ${maxDurationHours}h duration)`);
      
      // Generate 30-minute intervals from opening to latest start time
      for (let hour = startHour; hour <= actualLatestStartHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Skip if we're past the latest start time
          if (hour === actualLatestStartHour && minute > endMinute) break;
          
          const timeSlot = new Date(dateObj);
          timeSlot.setHours(hour, minute, 0, 0);
          
          // Make sure this start time allows for at least 30 minutes before closing
          const minimumEndTime = new Date(timeSlot.getTime() + (30 * 60 * 1000));
          const operatingEndTime = new Date(dateObj);
          operatingEndTime.setHours(endHour, endMinute, 0, 0);
          
          if (minimumEndTime > operatingEndTime) {
            continue; // Skip this start time if it doesn't allow minimum duration
          }
          
          // Check if this time slot conflicts with existing reservations
          const hasConflict = existingReservations.some(reservation => {
            const resStart = new Date(reservation.startTime);
            const resEnd = new Date(reservation.endTime);
            return timeSlot >= resStart && timeSlot < resEnd;
          });
          
          if (!hasConflict) {
            startTimes.push({
              time: timeSlot,
              label: DateUtils.formatTime(timeSlot),
              value: timeSlot.toISOString()
            });
          }
        }
      }
      
      console.log(`✅ Generated ${startTimes.length} available start times`);
      return startTimes;
    } catch (error) {
      console.error('Error generating start times:', error);
      return [];
    }
  };

  const loadAvailableEndTimes = () => {
    if (!selectedStartTime || !amenity) return;
    
    try {
      console.log('🕐 Loading available end times for start:', selectedStartTime.label);
      
      const startTime = new Date(selectedStartTime.time);
      const operatingHours = amenity.operatingHours || { start: '08:00', end: '23:00' };
      const [endHour, endMinute] = operatingHours.end.split(':').map(Number);
      
      // Create the operating end time for this date
      const operatingEndTime = new Date(startTime);
      operatingEndTime.setHours(endHour, endMinute, 0, 0);
      
      const endTimes = [];
      
      // FIXED: Use proper maxDuration with fallback to 900 for lounge
      let maxDurationMinutes = amenity.maxDuration || 
                               amenity.maxDurationMinutes || 
                               amenity.autoApprovalRules?.maxDurationMinutes ||
                               (isLounge ? 900 : 60); // FIXED: Changed fallback from 240 to 900 for lounge
      
      // Ensure it's a number
      maxDurationMinutes = parseInt(maxDurationMinutes);
      
      const minDurationMinutes = 30; // Minimum 30 minutes
      
      console.log(`📊 Using maxDuration: ${maxDurationMinutes} minutes (${maxDurationMinutes/60} hours)`);
      console.log(`🏢 Operating end time: ${DateUtils.formatTime(operatingEndTime)}`);
      
      // Calculate the latest possible end time based on max duration
      const maxEndTimeByDuration = new Date(startTime.getTime() + (maxDurationMinutes * 60 * 1000));
      
      // Use whichever is earlier: operating hours end time or max duration end time
      const actualMaxEndTime = maxEndTimeByDuration < operatingEndTime ? maxEndTimeByDuration : operatingEndTime;
      
      console.log(`⏰ Actual max end time: ${DateUtils.formatTime(actualMaxEndTime)} (limited by ${maxEndTimeByDuration < operatingEndTime ? 'max duration' : 'operating hours'})`);
      
      // Generate end times in 30-minute intervals
      let currentEndTime = new Date(startTime.getTime() + (minDurationMinutes * 60 * 1000));
      
      while (currentEndTime <= actualMaxEndTime) {
        const duration = (currentEndTime - startTime) / (1000 * 60); // Duration in minutes
        const durationText = formatDuration(duration);
        
        endTimes.push({
          time: new Date(currentEndTime),
          label: DateUtils.formatTime(currentEndTime),
          value: currentEndTime.toISOString(),
          duration: duration,
          durationText: durationText
        });
        
        // Move to next 30-minute slot
        currentEndTime = new Date(currentEndTime.getTime() + (30 * 60 * 1000));
        
        // Safety check to prevent infinite loop
        if (endTimes.length > 100) {
          console.warn('⚠️ Breaking loop after 100 end times to prevent infinite loop');
          break;
        }
      }
      
      console.log(`✅ Generated ${endTimes.length} available end times`);
      setAvailableEndTimes(endTimes);
      
    } catch (error) {
      console.error('❌ Error loading end times:', error);
      setAvailableEndTimes([]);
    }
  };

  const getExistingReservations = async (date) => {
    try {
      // This would need to be implemented in your reservation service
      // For now, we'll return empty array
      // TODO: Implement API call to get existing reservations for the date
      return [];
    } catch (error) {
      console.error('Error getting existing reservations:', error);
      return [];
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const handleDateChange = (date) => {
    console.log('📅 Date changed to:', date);
    setSelectedDate(date);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setShowDatePicker(false);
  };

  const handleStartTimeSelection = (startTime) => {
    console.log('🕐 Start time selected:', startTime);
    setSelectedStartTime(startTime);
    setSelectedEndTime(null); // Clear end time when start changes
  };

  const handleEndTimeSelection = (endTime) => {
    console.log('🕐 End time selected:', endTime);
    setSelectedEndTime(endTime);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate time selection
      if (!selectedStartTime) {
        Alert.alert(
          t('error') || 'Error',
          language === 'es' 
            ? 'Por favor seleccione una hora de inicio'
            : 'Please select a start time'
        );
        return;
      }

      if (!selectedEndTime) {
        Alert.alert(
          t('error') || 'Error',
          language === 'es' 
            ? 'Por favor seleccione una hora de fin'
            : 'Please select an end time'
        );
        return;
      }

      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleSubmitReservation();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitReservation = async () => {
    try {
      console.log('📝 Submitting reservation...', {
        amenityId,
        selectedDate,
        selectedStartTime,
        selectedEndTime,
        visitorCount,
        willUseGrill,
        notes,
        isLounge
      });

      if (!selectedStartTime || !selectedEndTime) {
        Alert.alert(
          t('error') || 'Error',
          language === 'es' 
            ? 'Por favor seleccione hora de inicio y fin'
            : 'Please select start and end times'
        );
        return;
      }

      // Validate lounge-specific fields
      if (isLounge) {
        const visitorNum = parseInt(visitorCount);
        const maxCapacity = amenity?.capacity || 20;
        
        if (visitorNum < 1 || visitorNum > maxCapacity) {
          Alert.alert(
            t('error') || 'Error',
            language === 'es' 
              ? `Número de visitantes debe estar entre 1 y ${maxCapacity}`
              : `Number of visitors must be between 1 and ${maxCapacity}`
          );
          return;
        }
      }

      // Build reservation data
      const reservationData = {
        amenityId,
        startTime: selectedStartTime.value,
        endTime: selectedEndTime.value,
        notes: notes.trim(),
      };

      // Add lounge-specific fields
      if (isLounge) {
        reservationData.visitorCount = parseInt(visitorCount) || 1;
        reservationData.willUseGrill = willUseGrill;
      }

      console.log('📤 Final reservation data:', reservationData);

      const result = await createReservation(reservationData);
      console.log('✅ Reservation created:', result);

      navigation.replace('BookingConfirmation', {
        reservationId: result.id || result.reservationId,
        amenityId,
        amenityName: amenity?.name
      });

    } catch (error) {
      console.error('❌ Error creating reservation:', error);
      Alert.alert(
        t('error') || 'Error',
        error.message || (language === 'es' 
          ? 'Error al crear la reservación'
          : 'Error creating reservation')
      );
    }
  };

  const renderDateTimeStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {language === 'es' ? 'Seleccione Fecha y Hora' : 'Select Date & Time'}
      </Text>

      {/* Date Selection */}
      <Card style={styles.selectionCard}>
        <Text style={styles.sectionTitle}>
          {language === 'es' ? 'Fecha' : 'Date'}
        </Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar-today" size={24} color={COLORS.primary} />
          <Text style={styles.dateButtonText}>
            {DateUtils.formatDate(selectedDate, language === 'es' ? 'DD/MM/YYYY' : 'MM/DD/YYYY')}
          </Text>
          <Icon name="chevron-right" size={24} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </Card>

      {/* Start Time Selection */}
      <Card style={styles.selectionCard}>
        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>
            {language === 'es' ? 'Hora de Inicio' : 'Start Time'}
          </Text>
          {loadingTimes && <LoadingSpinner size="small" />}
        </View>
        
        {selectedStartTime && (
          <View style={styles.selectedTimeContainer}>
            <Text style={styles.selectedTimeLabel}>
              {language === 'es' ? 'Seleccionado:' : 'Selected:'}
            </Text>
            <Text style={styles.selectedTimeValue}>
              {selectedStartTime.label}
            </Text>
          </View>
        )}
        
        {loadingTimes ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {language === 'es' ? 'Cargando horarios...' : 'Loading times...'}
            </Text>
          </View>
        ) : availableStartTimes.length > 0 ? (
          <View style={styles.timesGrid}>
            {availableStartTimes.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeButton,
                  selectedStartTime?.value === time.value && styles.selectedTime,
                ]}
                onPress={() => handleStartTimeSelection(time)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedStartTime?.value === time.value && styles.selectedTimeText,
                  ]}
                >
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noTimesContainer}>
            <Icon name="schedule" size={48} color={COLORS.text.secondary} />
            <Text style={styles.noTimesText}>
              {language === 'es' 
                ? 'No hay horarios de inicio disponibles'
                : 'No start times available for this date'}
            </Text>
          </View>
        )}
      </Card>

      {/* DEBUG: Show maxDuration info */}
      {selectedStartTime && (
        <Card style={[styles.selectionCard, { backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }]}>
          <Text style={styles.debugTitle}>🐛 DEBUG INFO</Text>
          <Text style={styles.debugText}>Amenity: {amenity?.name}</Text>
          <Text style={styles.debugText}>Type: {amenity?.type}</Text>
          <Text style={styles.debugText}>maxDuration: {amenity?.maxDuration} minutes</Text>
          <Text style={styles.debugText}>isLounge: {isLounge.toString()}</Text>
          <Text style={styles.debugText}>Available end times: {availableEndTimes.length}</Text>
          {availableEndTimes.length > 0 && (
            <Text style={styles.debugText}>
              Last end time: {availableEndTimes[availableEndTimes.length - 1]?.label} 
              ({availableEndTimes[availableEndTimes.length - 1]?.durationText})
            </Text>
          )}
        </Card>
      )}

      {/* End Time Selection (only show if start time is selected) */}
      {selectedStartTime && (
        <Card style={styles.selectionCard}>
          <View style={styles.sectionHeader}>
            <Icon name="schedule" size={20} color={COLORS.success} />
            <Text style={styles.sectionTitle}>
              {language === 'es' ? 'Hora de Fin' : 'End Time'}
            </Text>
          </View>
          
          {selectedEndTime && (
            <View style={styles.selectedTimeContainer}>
              <Text style={styles.selectedTimeLabel}>
                {language === 'es' ? 'Seleccionado:' : 'Selected:'}
              </Text>
              <Text style={styles.selectedTimeValue}>
                {selectedEndTime.label} ({selectedEndTime.durationText})
              </Text>
            </View>
          )}
          
          {availableEndTimes.length > 0 ? (
            <View style={styles.timesGrid}>
              {availableEndTimes.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeButton,
                    styles.endTimeButton,
                    selectedEndTime?.value === time.value && styles.selectedEndTime,
                  ]}
                  onPress={() => handleEndTimeSelection(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedEndTime?.value === time.value && styles.selectedEndTimeText,
                    ]}
                  >
                    {time.label}
                  </Text>
                  <Text
                    style={[
                      styles.durationText,
                      selectedEndTime?.value === time.value && styles.selectedDurationText,
                    ]}
                  >
                    {time.durationText}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noTimesContainer}>
              <Text style={styles.noTimesText}>
                {language === 'es' 
                  ? 'Seleccione una hora de inicio primero'
                  : 'Please select a start time first'}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Time Summary (show when both times selected) */}
      {selectedStartTime && selectedEndTime && (
        <Card style={[styles.selectionCard, styles.summaryCard]}>
          <View style={styles.summaryHeader}>
            <Icon name="event" size={24} color={COLORS.primary} />
            <Text style={styles.summaryTitle}>
              {language === 'es' ? 'Resumen de Reserva' : 'Booking Summary'}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {language === 'es' ? 'Horario:' : 'Time:'}
            </Text>
            <Text style={styles.summaryValue}>
              {selectedStartTime.label} - {selectedEndTime.label}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {language === 'es' ? 'Duración:' : 'Duration:'}
            </Text>
            <Text style={styles.summaryValue}>
              {selectedEndTime.durationText}
            </Text>
          </View>
        </Card>
      )}

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={showDatePicker}
        date={selectedDate}
        mode="date"
        minimumDate={new Date()}
        onConfirm={handleDateChange}
        onCancel={() => setShowDatePicker(false)}
        title={language === 'es' ? 'Seleccionar Fecha' : 'Select Date'}
        confirmText={language === 'es' ? 'Confirmar' : 'Confirm'}
        cancelText={language === 'es' ? 'Cancelar' : 'Cancel'}
      />
    </ScrollView>
  );

  const renderDetailsStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {language === 'es' ? 'Detalles de la Reservación' : 'Reservation Details'}
      </Text>

      {/* Reservation Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Icon name="place" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>
            {language === 'es' ? 'Amenidad' : 'Amenity'}
          </Text>
          <Text style={styles.summaryValue}>{amenity?.name}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Icon name="calendar-today" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>
            {language === 'es' ? 'Fecha' : 'Date'}
          </Text>
          <Text style={styles.summaryValue}>
            {DateUtils.formatDate(selectedDate, language === 'es' ? 'DD/MM/YYYY' : 'MM/DD/YYYY')}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Icon name="schedule" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>
            {language === 'es' ? 'Hora' : 'Time'}
          </Text>
          <Text style={styles.summaryValue}>
            {selectedStartTime && selectedEndTime ? 
              `${selectedStartTime.label} - ${selectedEndTime.label}` : '-'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Icon name="timer" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>
            {language === 'es' ? 'Duración' : 'Duration'}
          </Text>
          <Text style={styles.summaryValue}>
            {selectedEndTime?.durationText || '-'}
          </Text>
        </View>
      </Card>

      {/* Lounge-specific fields */}
      {isLounge && (
        <>
          {/* Visitor Count */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="group" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {language === 'es' ? 'Número de Visitantes' : 'Number of Visitors'}
              </Text>
            </View>
            <Input
              value={visitorCount}
              onChangeText={setVisitorCount}
              placeholder={language === 'es' ? 'Ej: 5' : 'e.g. 5'}
              keyboardType="numeric"
              maxLength={2}
              style={styles.visitorInput}
            />
            <Text style={styles.fieldNote}>
              {language === 'es' 
                ? `Máximo ${amenity?.capacity || 20} personas`
                : `Maximum ${amenity?.capacity || 20} people`}
            </Text>
          </Card>

          {/* Grill Usage */}
          <Card style={styles.section}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Icon name="outdoor-grill" size={20} color={COLORS.primary} />
                <View style={styles.switchTextContainer}>
                  <Text style={styles.sectionTitle}>
                    {language === 'es' ? 'Uso de Parrilla' : 'Grill Usage'}
                  </Text>
                  <Text style={styles.fieldNote}>
                    {language === 'es' 
                      ? 'Se aplican cargos adicionales'
                      : 'Additional fees apply'}
                  </Text>
                </View>
              </View>
              <Switch
                value={willUseGrill}
                onValueChange={setWillUseGrill}
                trackColor={{ false: COLORS.background.secondary, true: COLORS.primary }}
                thumbColor={willUseGrill ? COLORS.white : COLORS.text.secondary}
              />
            </View>
          </Card>
        </>
      )}

      {/* Notes */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="notes" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>
            {language === 'es' ? 'Notas Adicionales' : 'Additional Notes'}
          </Text>
        </View>
        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder={language === 'es' 
            ? 'Cualquier información adicional...'
            : 'Any additional information...'}
          multiline
          numberOfLines={3}
          style={styles.notesInput}
          maxLength={500}
        />
      </Card>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>
          {language === 'es' ? 'Cargando amenidad...' : 'Loading amenity...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{amenity?.name}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicators */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, currentStep >= 1 && styles.activeStep]}>
          <Text style={[styles.progressNumber, currentStep >= 1 && styles.activeStepText]}>1</Text>
        </View>
        <View style={[styles.progressLine, currentStep > 1 && styles.activeProgressLine]} />
        <View style={[styles.progressStep, currentStep >= 2 && styles.activeStep]}>
          <Text style={[styles.progressNumber, currentStep >= 2 && styles.activeStepText]}>2</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {currentStep === 1 ? renderDateTimeStep() : renderDetailsStep()}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <Button
            title={language === 'es' ? 'Anterior' : 'Back'}
            onPress={handlePreviousStep}
            variant="outline"
            style={styles.navButton}
          />
        )}
        <Button
          title={currentStep === 1 
            ? (language === 'es' ? 'Continuar' : 'Continue')
            : (language === 'es' ? 'Confirmar Reservación' : 'Confirm Booking')
          }
          onPress={handleNextStep}
          loading={reservationLoading}
          disabled={currentStep === 1 && (!selectedStartTime || !selectedEndTime)}
          style={[styles.navButton, currentStep === 1 && styles.singleButton]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressNumber: {
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
  },
  activeStepText: {
    color: COLORS.white,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  activeProgressLine: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  selectionCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    flex: 1,
    marginLeft: SPACING.md,
  },
  selectedTimeContainer: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTimeLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  selectedTimeValue: {
    fontSize: FONT_SIZES.body,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedTime: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  endTimeButton: {
    borderColor: COLORS.success,
  },
  selectedEndTime: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  timeText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedTimeText: {
    color: COLORS.white,
  },
  selectedEndTimeText: {
    color: COLORS.white,
  },
  durationText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  selectedDurationText: {
    color: COLORS.white,
  },
  noTimesContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  noTimesText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.success,
    marginLeft: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
    marginLeft: SPACING.md,
    flex: 1,
  },
  summaryValue: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  visitorInput: {
    marginBottom: SPACING.sm,
  },
  fieldNote: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text.secondary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  navButton: {
    flex: 1,
  },
  singleButton: {
    marginLeft: 0,
  },
});

export default AmenityBookingScreen;