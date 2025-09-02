// src/screens/booking/AmenityBookingScreen.jsx - UPDATED WITH LOUNGE SUPPORT

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Picker,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-icons';
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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Lounge-specific states
  const [visitorCount, setVisitorCount] = useState('1');
  const [willUseGrill, setWillUseGrill] = useState(false);
  const [isLounge, setIsLounge] = useState(false);
  
  // NEW: Duration selection for lounge
  const [selectedDuration, setSelectedDuration] = useState(60); // Default 1 hour
  const [availableDurations, setAvailableDurations] = useState([]);

  // Load amenity details on component mount
  useEffect(() => {
    if (amenityId) {
      loadAmenityDetails();
    }
  }, [amenityId]);

  // Load available slots when date or duration changes
  useEffect(() => {
    if (amenity && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, amenity, selectedDuration]);

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
      
      // NEW: Set up available durations for lounge
      if (loungeCheck) {
        const maxDuration = amenityData.maxDuration || 240; // 4 hours default
        const durations = [];
        
        // Generate duration options (1, 1.5, 2, 2.5, 3, 3.5, 4 hours for lounge)
        for (let i = 60; i <= maxDuration; i += 30) {
          const hours = Math.floor(i / 60);
          const minutes = i % 60;
          const label = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
          durations.push({ value: i, label });
        }
        
        setAvailableDurations(durations);
        setSelectedDuration(120); // Default to 2 hours for lounge
      } else {
        // For non-lounge amenities, use fixed durations
        setAvailableDurations([{ value: 60, label: '1h' }]);
        setSelectedDuration(60);
      }
      
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
  
  // UPDATED: Use dynamic duration instead of hardcoded 60
  const loadAvailableSlots = async () => {
    if (!amenity || !amenityId) {
      console.log('⚠️ Skipping slot loading - missing amenity or amenityId');
      return;
    }

    try {
      setLoadingSlots(true);
      console.log('🕐 Loading available slots...', {
        amenityId,
        selectedDate,
        duration: selectedDuration,
        amenity: amenity?.name
      });
      
      const formattedDate = DateUtils.formatDate(selectedDate, 'YYYY-MM-DD');
      console.log('📅 Formatted date for API:', formattedDate);
      
      // UPDATED: Use selected duration instead of hardcoded 60
      const slots = await reservationService.getAvailableSlots(
        amenityId, 
        formattedDate, 
        selectedDuration // Dynamic duration
      );
      
      console.log('✅ Available slots loaded:', slots);
      setAvailableSlots(slots || []);
    } catch (error) {
      console.error('❌ Error loading available slots:', error);
      setAvailableSlots([]);
      console.log('Slots loading failed, showing empty slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    console.log('📅 Date changed to:', date);
    setSelectedDate(date);
    setSelectedSlot(null); // Clear selected slot when date changes
    setShowDatePicker(false);
  };

  const handleSlotSelection = (slot) => {
    console.log('🕐 Slot selected:', slot);
    setSelectedSlot(slot);
  };

  // NEW: Handle duration change for lounge
  const handleDurationChange = (duration) => {
    console.log('⏱️ Duration changed to:', duration);
    setSelectedDuration(duration);
    setSelectedSlot(null); // Clear selected slot when duration changes
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate date and slot selection
      if (!selectedSlot) {
        Alert.alert(
          t('error') || 'Error',
          language === 'es' 
            ? 'Por favor seleccione una hora'
            : 'Please select a time slot'
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
        selectedSlot,
        visitorCount,
        willUseGrill,
        notes
      });

      // Validate required fields
      if (!selectedSlot) {
        Alert.alert(
          t('error') || 'Error',
          language === 'es' 
            ? 'Por favor seleccione una hora' 
            : 'Please select a time slot'
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
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        durationMinutes: selectedDuration,
        notes: notes.trim(),
      };

      // Add lounge-specific fields if needed
      if (isLounge) {
        reservationData.visitorCount = parseInt(visitorCount) || 1;
        reservationData.willUseGrill = willUseGrill;
      }

      console.log('📤 Final reservation data:', reservationData);

      const result = await createReservation(reservationData);
      console.log('✅ Reservation created:', result);

      // Navigate to confirmation screen
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

      {/* NEW: Duration Selection for Lounge */}
      {isLounge && (
        <Card style={styles.selectionCard}>
          <Text style={styles.sectionTitle}>
            {language === 'es' ? 'Duración' : 'Duration'}
          </Text>
          <View style={styles.durationContainer}>
            {availableDurations.map((duration) => (
              <TouchableOpacity
                key={duration.value}
                style={[
                  styles.durationButton,
                  selectedDuration === duration.value && styles.selectedDuration
                ]}
                onPress={() => handleDurationChange(duration.value)}
              >
                <Text style={[
                  styles.durationText,
                  selectedDuration === duration.value && styles.selectedDurationText
                ]}>
                  {duration.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.durationNote}>
            {language === 'es' 
              ? 'Seleccione cuánto tiempo necesitará el salón comunitario'
              : 'Select how long you\'ll need the community lounge'}
          </Text>
        </Card>
      )}

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

      {/* Time Slots */}
      <Card style={styles.selectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {language === 'es' ? 'Horarios Disponibles' : 'Available Times'}
          </Text>
          {loadingSlots && <LoadingSpinner size="small" />}
        </View>
        
        {/* NEW: Show selected duration info for lounge */}
        {isLounge && selectedDuration > 60 && (
          <Text style={styles.durationInfo}>
            {language === 'es' 
              ? `Mostrando slots de ${Math.floor(selectedDuration/60)}h ${selectedDuration%60 > 0 ? (selectedDuration%60) + 'm' : ''}`
              : `Showing ${Math.floor(selectedDuration/60)}h${selectedDuration%60 > 0 ? ` ${selectedDuration%60}m` : ''} time slots`}
          </Text>
        )}
        
        {loadingSlots ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {language === 'es' ? 'Cargando horarios...' : 'Loading time slots...'}
            </Text>
          </View>
        ) : availableSlots.length > 0 ? (
          <View style={styles.slotsGrid}>
            {availableSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.slotButton,
                  selectedSlot?.startTime === slot.startTime && styles.selectedSlot,
                ]}
                onPress={() => handleSlotSelection(slot)}
              >
                <Text
                  style={[
                    styles.slotText,
                    selectedSlot?.startTime === slot.startTime && styles.selectedSlotText,
                  ]}
                >
                  {/* NEW: Show start and end time for better clarity */}
                  {isLounge ? (
                    `${DateUtils.formatTime(slot.startTime)} - ${DateUtils.formatTime(slot.endTime)}`
                  ) : (
                    DateUtils.formatTime(slot.startTime)
                  )}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noSlotsContainer}>
            <Icon name="schedule" size={48} color={COLORS.text.secondary} />
            <Text style={styles.noSlotsText}>
              {language === 'es' 
                ? 'No hay horarios disponibles para esta fecha'
                : 'No time slots available for this date'}
            </Text>
            <Text style={styles.noSlotsSubtext}>
              {language === 'es' 
                ? 'Intente con otra fecha o duración'
                : 'Try selecting a different date or duration'}
            </Text>
          </View>
        )}
      </Card>

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
            {selectedSlot ? (
              isLounge ? (
                `${DateUtils.formatTime(selectedSlot.startTime)} - ${DateUtils.formatTime(selectedSlot.endTime)}`
              ) : (
                DateUtils.formatTime(selectedSlot.startTime)
              )
            ) : '-'}
          </Text>
        </View>

        {/* NEW: Show duration for lounge */}
        {isLounge && (
          <View style={styles.summaryRow}>
            <Icon name="timer" size={20} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>
              {language === 'es' ? 'Duración' : 'Duration'}
            </Text>
            <Text style={styles.summaryValue}>
              {Math.floor(selectedDuration/60)}h {selectedDuration%60 > 0 ? `${selectedDuration%60}m` : ''}
            </Text>
          </View>
        )}
      </Card>

      {/* UPDATED: Lounge-specific fields */}
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
          disabled={currentStep === 1 && !selectedSlot}
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
  
  // NEW: Duration selection styles
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  durationButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  selectedDuration: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedDurationText: {
    color: COLORS.white,
  },
  durationNote: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  durationInfo: {
    fontSize: FONT_SIZES.small,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: '500',
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
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  slotButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    minWidth: '45%',
    alignItems: 'center',
  },
  selectedSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedSlotText: {
    color: COLORS.white,
  },
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  noSlotsText: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  noSlotsSubtext: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
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