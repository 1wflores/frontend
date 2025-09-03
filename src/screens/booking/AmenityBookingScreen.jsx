// src/screens/booking/AmenityBookingScreen.jsx - ENHANCED with consecutive weekend validation

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
  
  // Time selection
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [availableStartTimes, setAvailableStartTimes] = useState([]);
  const [availableEndTimes, setAvailableEndTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  
  // Lounge-specific states
  const [visitorCount, setVisitorCount] = useState('1');
  const [willUseGrill, setWillUseGrill] = useState(false);
  const [isLounge, setIsLounge] = useState(false);

  // NEW: Validation and warning states
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [consecutiveBookingWarning, setConsecutiveBookingWarning] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);

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
      checkForExistingBookings(); // NEW: Check for existing bookings
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

  // NEW: Validate consecutive booking when date/time changes
  useEffect(() => {
    if (isLounge && selectedDate && selectedStartTime) {
      validateConsecutiveBooking();
    } else {
      setConsecutiveBookingWarning(null);
    }
  }, [selectedDate, selectedStartTime, isLounge, existingBookings]);

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

  // NEW: Check for existing bookings to validate consecutive restrictions
  const checkForExistingBookings = async () => {
    if (!isLounge || !user?.id) return;

    try {
      console.log('🔍 Checking existing bookings for consecutive validation...');
      
      // Get user's existing lounge reservations
      const userReservations = await reservationService.getUserReservations({
        userId: user.id,
        amenityId,
        status: ['pending', 'approved', 'confirmed'],
        includePastReservations: false
      });

      setExistingBookings(userReservations || []);
      console.log(`📋 Found ${userReservations?.length || 0} existing bookings`);
      
    } catch (error) {
      console.error('❌ Error checking existing bookings:', error);
      // Don't block the user, just log the error
    }
  };

  // NEW: Validate consecutive weekend booking restrictions
  const validateConsecutiveBooking = () => {
    if (!isLounge || !selectedDate || existingBookings.length === 0) {
      setConsecutiveBookingWarning(null);
      return;
    }

    const newBookingDate = new Date(selectedDate);
    const isNewBookingWeekend = isWeekendDay(newBookingDate);

    if (!isNewBookingWeekend) {
      setConsecutiveBookingWarning(null);
      return;
    }

    // Check each existing booking for consecutive conflicts
    for (const booking of existingBookings) {
      const existingDate = new Date(booking.startTime);
      
      if (!isWeekendDay(existingDate)) continue;
      
      if (areConsecutiveWeekendDays(newBookingDate, existingDate)) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const existingDayName = dayNames[existingDate.getDay()];
        const newDayName = dayNames[newBookingDate.getDay()];
        
        setConsecutiveBookingWarning({
          message: language === 'es' 
            ? `Ya tienes una reserva el ${existingDayName}. No se permiten reservas consecutivas en días de fin de semana.`
            : `You already have a reservation on ${existingDayName}. Consecutive weekend bookings are not allowed.`,
          details: {
            existingDate: existingDate.toDateString(),
            existingDay: existingDayName,
            newDay: newDayName,
            conflictType: getConsecutiveConflictType(existingDate, newBookingDate)
          }
        });
        return;
      }
    }
    
    setConsecutiveBookingWarning(null);
  };

  // Helper functions for consecutive booking validation
  const isWeekendDay = (date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // Sunday, Friday, Saturday
  };

  const areConsecutiveWeekendDays = (date1, date2) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    
    const dayOfWeek1 = d1.getDay();
    const dayOfWeek2 = d2.getDay();
    
    const timeDiff = Math.abs(d1.getTime() - d2.getTime());
    const daysDiff = timeDiff / (24 * 60 * 60 * 1000);
    
    // Check for consecutive combinations
    if (daysDiff === 1) {
      return (dayOfWeek1 === 5 && dayOfWeek2 === 6) || 
             (dayOfWeek1 === 6 && dayOfWeek2 === 5) ||
             (dayOfWeek1 === 6 && dayOfWeek2 === 0) ||
             (dayOfWeek1 === 0 && dayOfWeek2 === 6);
    } else if (daysDiff === 2) {
      return (dayOfWeek1 === 5 && dayOfWeek2 === 0) || 
             (dayOfWeek1 === 0 && dayOfWeek2 === 5);
    }
    
    return false;
  };

  const getConsecutiveConflictType = (date1, date2) => {
    const day1 = date1.getDay();
    const day2 = date2.getDay();
    
    if ((day1 === 5 && day2 === 6) || (day1 === 6 && day2 === 5)) return 'Friday-Saturday';
    if ((day1 === 6 && day2 === 0) || (day1 === 0 && day2 === 6)) return 'Saturday-Sunday';
    if ((day1 === 5 && day2 === 0) || (day1 === 0 && day2 === 5)) return 'Friday-Sunday';
    return 'Weekend consecutive';
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
      const operatingHours = amenity.operatingHours || { start: '08:00', end: '23:00' };
      const [startHour, startMinute] = operatingHours.start.split(':').map(Number);
      const [endHour, endMinute] = operatingHours.end.split(':').map(Number);
      
      let maxDurationMinutes = amenity.maxDuration || 
                               amenity.maxDurationMinutes || 
                               amenity.autoApprovalRules?.maxDurationMinutes ||
                               (isLounge ? 240 : 60);
      
      maxDurationMinutes = parseInt(maxDurationMinutes);
      const minDurationMinutes = 30;

      // Get existing reservations for the selected date
      const existingReservations = await reservationService.getReservationsForDate(amenityId, date);
      
      const startTimes = [];
      const slotInterval = 30; // 30-minute intervals
      
      // Generate time slots
      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          if (hour === endHour && minute > endMinute) break;
          
          const slotTime = new Date(date);
          slotTime.setHours(hour, minute, 0, 0);
          
          // Skip past times
          if (slotTime <= new Date()) continue;
          
          // Check if there's enough time left in the day for minimum duration
          const endOfDay = new Date(date);
          endOfDay.setHours(endHour, endMinute, 0, 0);
          
          const timeUntilClose = (endOfDay - slotTime) / (1000 * 60);
          if (timeUntilClose < minDurationMinutes) continue;
          
          // Check for conflicts with existing reservations
          const hasConflict = existingReservations.some(reservation => {
            const existingStart = new Date(reservation.startTime);
            const existingEnd = new Date(reservation.endTime);
            
            // Check if this slot would conflict (assuming minimum duration)
            const slotEnd = new Date(slotTime.getTime() + (minDurationMinutes * 60 * 1000));
            
            return (slotTime < existingEnd && slotEnd > existingStart);
          });
          
          if (!hasConflict) {
            startTimes.push({
              time: slotTime.toISOString(),
              label: DateUtils.formatTime(slotTime)
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
      
      const operatingEndTime = new Date(startTime);
      operatingEndTime.setHours(endHour, endMinute, 0, 0);
      
      const endTimes = [];
      
      let maxDurationMinutes = amenity.maxDuration || 
                               amenity.maxDurationMinutes || 
                               amenity.autoApprovalRules?.maxDurationMinutes ||
                               (isLounge ? 240 : 60);
      
      maxDurationMinutes = parseInt(maxDurationMinutes);
      const minDurationMinutes = 30;
      
      console.log(`📊 Using maxDuration: ${maxDurationMinutes} minutes (${maxDurationMinutes/60} hours)`);
      
      const maxEndTimeByDuration = new Date(startTime.getTime() + (maxDurationMinutes * 60 * 1000));
      const actualMaxEndTime = maxEndTimeByDuration < operatingEndTime ? maxEndTimeByDuration : operatingEndTime;
      
      // Generate end time options in 30-minute intervals
      for (let i = minDurationMinutes; i <= maxDurationMinutes; i += 30) {
        const endTime = new Date(startTime.getTime() + (i * 60 * 1000));
        
        if (endTime > actualMaxEndTime) break;
        
        const hours = Math.floor(i / 60);
        const minutes = i % 60;
        const durationLabel = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        
        endTimes.push({
          time: endTime.toISOString(),
          duration: i,
          label: DateUtils.formatTime(endTime),
          durationLabel
        });
      }
      
      console.log(`✅ Generated ${endTimes.length} end time options`);
      setAvailableEndTimes(endTimes);
      
    } catch (error) {
      console.error('Error loading end times:', error);
      setAvailableEndTimes([]);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedStartTime || !selectedEndTime) {
      Alert.alert(
        t('error') || 'Error',
        language === 'es' ? 'Por favor selecciona fecha y hora' : 'Please select date and time'
      );
      return;
    }

    // Check for consecutive booking warning
    if (consecutiveBookingWarning) {
      Alert.alert(
        language === 'es' ? 'Reserva No Permitida' : 'Booking Not Allowed',
        consecutiveBookingWarning.message,
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate lounge requirements
    if (isLounge) {
      const visitorCountNum = parseInt(visitorCount);
      const maxCapacity = amenity.specialRequirements?.maxVisitors || amenity.capacity || 20;
      
      if (isNaN(visitorCountNum) || visitorCountNum < 1 || visitorCountNum > maxCapacity) {
        Alert.alert(
          t('error') || 'Error',
          language === 'es' 
            ? `El número de visitantes debe estar entre 1 y ${maxCapacity}`
            : `Visitor count must be between 1 and ${maxCapacity}`
        );
        return;
      }

      // Check advance booking requirement for lounge
      const bookingTime = new Date(selectedStartTime.time);
      const now = new Date();
      const hoursInAdvance = (bookingTime - now) / (1000 * 60 * 60);
      
      if (hoursInAdvance < 24) {
        Alert.alert(
          language === 'es' ? 'Reserva Anticipada Requerida' : 'Advance Booking Required',
          language === 'es' 
            ? 'El Salón Comunitario requiere reserva con 24 horas de anticipación.'
            : 'The Community Lounge requires 24-hour advance booking.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      const reservationData = {
        amenityId,
        startTime: selectedStartTime.time,
        endTime: selectedEndTime.time,
        notes: notes.trim(),
        visitorCount: isLounge ? parseInt(visitorCount) : undefined,
        willUseGrill: isLounge ? willUseGrill : undefined,
      };

      console.log('📝 Submitting reservation:', reservationData);

      const result = await createReservation(reservationData);

      // Show different messages based on approval status
      const isLoungeBooking = isLounge;
      const title = language === 'es' ? 'Reserva Enviada' : 'Booking Submitted';
      
      let message;
      if (isLoungeBooking) {
        message = language === 'es' 
          ? 'Tu reserva del Salón Comunitario ha sido enviada para aprobación del administrador. Recibirás una notificación cuando sea procesada.'
          : 'Your Community Lounge booking has been submitted for administrator approval. You will be notified when it is processed.';
      } else {
        message = result?.status === 'approved'
          ? (language === 'es' ? 'Tu reserva ha sido confirmada automáticamente.' : 'Your booking has been automatically confirmed.')
          : (language === 'es' ? 'Tu reserva ha sido enviada para aprobación.' : 'Your booking has been submitted for approval.');
      }

      Alert.alert(
        title,
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('BookingConfirmation', {
                reservation: result,
                amenity: amenity
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error submitting booking:', error);
      
      let errorMessage = language === 'es' 
        ? 'Error al crear la reserva'
        : 'Error creating reservation';
        
      if (error.message?.includes('consecutive')) {
        errorMessage = language === 'es' 
          ? 'No se permiten reservas consecutivas en días de fin de semana para el Salón Comunitario.'
          : 'Consecutive weekend bookings are not allowed for the Community Lounge.';
      }
      
      Alert.alert(
        t('error') || 'Error',
        errorMessage
      );
    }
  };

  const renderDateTimeStep = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>
        {t('selectDateTime') || (language === 'es' ? 'Seleccionar Fecha y Hora' : 'Select Date & Time')}
      </Text>
      
      {/* Date Selection */}
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon name="event" size={20} color={COLORS.primary} />
        <Text style={styles.dateButtonText}>
          {DateUtils.formatDate(selectedDate, language)}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={showDatePicker}
        date={selectedDate}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setSelectedDate(date);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Consecutive Booking Warning */}
      {consecutiveBookingWarning && (
        <View style={styles.warningCard}>
          <Icon name="warning" size={20} color={COLORS.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>
              {language === 'es' ? 'Reserva No Permitida' : 'Booking Not Allowed'}
            </Text>
            <Text style={styles.warningMessage}>
              {consecutiveBookingWarning.message}
            </Text>
          </View>
        </View>
      )}

      {/* Time Selection */}
      {!loadingTimes && availableStartTimes.length > 0 && !consecutiveBookingWarning && (
        <>
          <Text style={styles.sectionTitle}>
            {t('startTime') || (language === 'es' ? 'Hora de Inicio' : 'Start Time')}
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.timeScrollView}
          >
            {availableStartTimes.map((timeSlot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedStartTime?.time === timeSlot.time && styles.selectedTimeSlot
                ]}
                onPress={() => setSelectedStartTime(timeSlot)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedStartTime?.time === timeSlot.time && styles.selectedTimeSlotText
                ]}>
                  {timeSlot.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* End Time Selection */}
      {selectedStartTime && availableEndTimes.length > 0 && !consecutiveBookingWarning && (
        <>
          <Text style={styles.sectionTitle}>
            {t('endTime') || (language === 'es' ? 'Hora de Fin' : 'End Time')}
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.timeScrollView}
          >
            {availableEndTimes.map((timeSlot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedEndTime?.time === timeSlot.time && styles.selectedTimeSlot
                ]}
                onPress={() => setSelectedEndTime(timeSlot)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedEndTime?.time === timeSlot.time && styles.selectedTimeSlotText
                ]}>
                  {timeSlot.label}
                </Text>
                <Text style={[
                  styles.durationText,
                  selectedEndTime?.time === timeSlot.time && styles.selectedDurationText
                ]}>
                  {timeSlot.durationLabel}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {loadingTimes && (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="small" />
          <Text style={styles.loadingText}>
            {language === 'es' ? 'Cargando horarios...' : 'Loading times...'}
          </Text>
        </View>
      )}

      {!loadingTimes && availableStartTimes.length === 0 && !consecutiveBookingWarning && (
        <View style={styles.noTimesContainer}>
          <Icon name="schedule" size={48} color={COLORS.text.secondary} />
          <Text style={styles.noTimesText}>
            {language === 'es' 
              ? 'No hay horarios disponibles para esta fecha'
              : 'No available times for this date'
            }
          </Text>
        </View>
      )}
    </Card>
  );

  const renderDetailsStep = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>
        {t('additionalDetails') || (language === 'es' ? 'Detalles Adicionales' : 'Additional Details')}
      </Text>

      {/* Lounge-specific fields */}
      {isLounge && (
        <>
          {/* Visitor Count */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t('numberOfVisitors') || (language === 'es' ? 'Número de Visitantes' : 'Number of Visitors')}
            </Text>
            <Input
              value={visitorCount}
              onChangeText={setVisitorCount}
              placeholder="1"
              keyboardType="numeric"
              style={styles.input}
            />
            <Text style={styles.inputHelper}>
              {language === 'es' 
                ? `Máximo ${amenity?.specialRequirements?.maxVisitors || amenity?.capacity || 20} personas`
                : `Maximum ${amenity?.specialRequirements?.maxVisitors || amenity?.capacity || 20} people`
              }
            </Text>
          </View>

          {/* Grill Usage */}
          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text style={styles.inputLabel}>
                  {t('willUseGrill') || (language === 'es' ? 'Usará Parrilla' : 'Will Use Grill')}
                </Text>
                <Text style={styles.inputHelper}>
                  {t('additionalFeesApply') || (language === 'es' ? 'Se aplican tarifas adicionales' : 'Additional fees apply')}
                </Text>
              </View>
              <Switch
                value={willUseGrill}
                onValueChange={setWillUseGrill}
                trackColor={{ false: COLORS.text.secondary, true: COLORS.primary }}
              />
            </View>
          </View>

          {/* Lounge Requirements Notice */}
          <View style={styles.requirementsNotice}>
            <Icon name="info" size={20} color={COLORS.primary} />
            <View style={styles.requirementsContent}>
              <Text style={styles.requirementsTitle}>
                {language === 'es' ? 'Requisitos del Salón Comunitario' : 'Community Lounge Requirements'}
              </Text>
              <Text style={styles.requirementsText}>
                • {language === 'es' ? 'Reserva con 24 horas de anticipación' : '24-hour advance booking required'}{'\n'}
                • {language === 'es' ? 'Requiere aprobación del administrador' : 'Requires administrator approval'}{'\n'}
                • {language === 'es' ? 'No se permiten reservas consecutivas en fin de semana' : 'No consecutive weekend bookings allowed'}
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Notes */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {t('notes') || (language === 'es' ? 'Notas (Opcional)' : 'Notes (Optional)')}
        </Text>
        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder={language === 'es' 
            ? 'Agregar cualquier información adicional...'
            : 'Add any additional information...'
          }
          multiline
          numberOfLines={3}
          style={[styles.input, styles.notesInput]}
        />
      </View>
    </Card>
  );

  const renderConfirmStep = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>
        {t('confirmReservation') || (language === 'es' ? 'Confirmar Reserva' : 'Confirm Reservation')}
      </Text>

      <View style={styles.confirmationDetails}>
        <View style={styles.confirmRow}>
          <Icon name="place" size={20} color={COLORS.primary} />
          <Text style={styles.confirmLabel}>
            {t('amenity') || (language === 'es' ? 'Amenidad:' : 'Amenity:')}
          </Text>
          <Text style={styles.confirmValue}>{amenity?.name}</Text>
        </View>

        <View style={styles.confirmRow}>
          <Icon name="event" size={20} color={COLORS.primary} />
          <Text style={styles.confirmLabel}>
            {t('date') || (language === 'es' ? 'Fecha:' : 'Date:')}
          </Text>
          <Text style={styles.confirmValue}>
            {DateUtils.formatDate(selectedDate, language)}
          </Text>
        </View>

        <View style={styles.confirmRow}>
          <Icon name="schedule" size={20} color={COLORS.primary} />
          <Text style={styles.confirmLabel}>
            {t('time') || (language === 'es' ? 'Hora:' : 'Time:')}
          </Text>
          <Text style={styles.confirmValue}>
            {selectedStartTime?.label} - {selectedEndTime?.label}
          </Text>
        </View>

        {isLounge && (
          <>
            <View style={styles.confirmRow}>
              <Icon name="people" size={20} color={COLORS.primary} />
              <Text style={styles.confirmLabel}>
                {t('visitors') || (language === 'es' ? 'Visitantes:' : 'Visitors:')}
              </Text>
              <Text style={styles.confirmValue}>
                {visitorCount} {visitorCount === '1' 
                  ? (language === 'es' ? 'persona' : 'person')
                  : (language === 'es' ? 'personas' : 'people')
                }
              </Text>
            </View>

            {willUseGrill && (
              <View style={styles.confirmRow}>
                <Icon name="outdoor_grill" size={20} color={COLORS.warning} />
                <Text style={styles.confirmLabel}>
                  {t('grillUsage') || (language === 'es' ? 'Uso de Parrilla:' : 'Grill Usage:')}
                </Text>
                <Text style={[styles.confirmValue, { color: COLORS.warning }]}>
                  {language === 'es' ? 'Sí (tarifas adicionales)' : 'Yes (additional fees)'}
                </Text>
              </View>
            )}
          </>
        )}

        {notes.trim() && (
          <View style={styles.confirmRow}>
            <Icon name="note" size={20} color={COLORS.primary} />
            <Text style={styles.confirmLabel}>
              {t('notes') || (language === 'es' ? 'Notas:' : 'Notes:')}
            </Text>
            <Text style={styles.confirmValue}>{notes.trim()}</Text>
          </View>
        )}
      </View>

      {/* Approval Notice */}
      <View style={[
        styles.approvalNotice,
        isLounge ? styles.loungeApprovalNotice : styles.autoApprovalNotice
      ]}>
        <Icon 
          name={isLounge ? "admin_panel_settings" : "check_circle"} 
          size={20} 
          color={isLounge ? COLORS.warning : COLORS.success} 
        />
        <Text style={[
          styles.approvalNoticeText,
          isLounge ? styles.loungeApprovalText : styles.autoApprovalText
        ]}>
          {isLounge
            ? (language === 'es' 
                ? 'Esta reserva requiere aprobación del administrador'
                : 'This booking requires administrator approval'
              )
            : (language === 'es' 
                ? 'Esta reserva será aprobada automáticamente'
                : 'This booking will be approved automatically'
              )
          }
        </Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>
          {language === 'es' ? 'Cargando amenidad...' : 'Loading amenity...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.amenityHeader}>
            <Icon 
              name={isLounge ? 'weekend' : 'place'} 
              size={32} 
              color={COLORS.primary} 
            />
            <View style={styles.amenityInfo}>
              <Text style={styles.amenityName}>{amenity?.name}</Text>
              <Text style={styles.amenityDescription}>{amenity?.description}</Text>
              {isLounge && (
                <View style={styles.loungeTag}>
                  <Text style={styles.loungeTagText}>
                    {language === 'es' ? 'REQUIERE APROBACIÓN' : 'REQUIRES APPROVAL'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((step) => (
            <View key={step} style={styles.stepIndicatorContainer}>
              <View style={[
                styles.stepDot,
                currentStep >= step && styles.activeStepDot
              ]}>
                <Text style={[
                  styles.stepDotText,
                  currentStep >= step && styles.activeStepDotText
                ]}>
                  {step}
                </Text>
              </View>
              {step < 3 && <View style={[
                styles.stepLine,
                currentStep > step && styles.activeStepLine
              ]} />}
            </View>
          ))}
        </View>

        {/* Step Content */}
        {currentStep === 1 && renderDateTimeStep()}
        {currentStep === 2 && renderDetailsStep()}
        {currentStep === 3 && renderConfirmStep()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {currentStep > 1 && (
          <Button
            title={t('back') || (language === 'es' ? 'Atrás' : 'Back')}
            onPress={() => setCurrentStep(currentStep - 1)}
            variant="secondary"
            style={styles.backButton}
          />
        )}
        
        <Button
          title={
            currentStep === 3
              ? (t('confirmBooking') || (language === 'es' ? 'Confirmar Reserva' : 'Confirm Booking'))
              : (t('continue') || (language === 'es' ? 'Continuar' : 'Continue'))
          }
          onPress={() => {
            if (currentStep === 3) {
              handleSubmitBooking();
            } else if (currentStep === 1 && (!selectedStartTime || !selectedEndTime || consecutiveBookingWarning)) {
              // Don't allow progression if times not selected or consecutive warning
              return;
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          style={styles.continueButton}
          loading={reservationLoading}
          disabled={
            reservationLoading ||
            (currentStep === 1 && (!selectedStartTime || !selectedEndTime || consecutiveBookingWarning)) ||
            (currentStep === 3 && consecutiveBookingWarning)
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  headerCard: {
    marginBottom: SPACING.md,
  },
  amenityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  amenityName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  amenityDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  loungeTag: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  loungeTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.text.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepDot: {
    backgroundColor: COLORS.primary,
  },
  stepDotText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  activeStepDotText: {
    color: COLORS.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.text.secondary,
  },
  activeStepLine: {
    backgroundColor: COLORS.primary,
  },
  stepCard: {
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border?.light || '#E0E0E0',
    marginBottom: SPACING.md,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.background?.error || '#FFEBEE',
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  warningContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  warningTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  warningMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  timeScrollView: {
    marginBottom: SPACING.md,
  },
  timeSlot: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border?.light || '#E0E0E0',
    alignItems: 'center',
    minWidth: 80,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedTimeSlotText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: FONT_SIZES.xs,
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
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  input: {
    marginBottom: SPACING.xs,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHelper: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flex: 1,
  },
  requirementsNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginTop: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  requirementsContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  requirementsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  requirementsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  confirmationDetails: {
    marginBottom: SPACING.lg,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  confirmLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
    minWidth: 80,
  },
  confirmValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  approvalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
  },
  loungeApprovalNotice: {
    backgroundColor: COLORS.background?.error || '#FFEBEE',
  },
  autoApprovalNotice: {
    backgroundColor: '#E8F5E8',
  },
  approvalNoticeText: {
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  loungeApprovalText: {
    color: COLORS.warning,
  },
  autoApprovalText: {
    color: COLORS.success,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border?.light || '#E0E0E0',
  },
  backButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  continueButton: {
    flex: 2,
  },
});

export default AmenityBookingScreen;