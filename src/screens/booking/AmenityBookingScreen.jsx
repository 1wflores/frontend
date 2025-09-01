// src/screens/booking/AmenityBookingScreen.jsx - FIXED VERSION

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
  
  useEffect(() => {
    if (amenityId) {
      loadAmenityDetails();
    } else {
      setLoading(false);
      Alert.alert('Error', 'No amenity ID provided');
    }
  }, [amenityId]);
  
  useEffect(() => {
    if (amenity && amenityId) {
      loadAvailableSlots();
    }
  }, [selectedDate, amenity, amenityId]);
  
  const loadAmenityDetails = async () => {
    try {
      setLoading(true);
      console.log('📍 Loading amenity details for:', amenityId);
      
      const data = await amenityService.getAmenityById(amenityId);
      console.log('🏢 Amenity data loaded:', data);
      
      setAmenity(data);
      
      // Check if it's a lounge amenity
      const loungeCheck = data?.type === 'lounge' || 
                         data?.name?.toLowerCase().includes('lounge');
      setIsLounge(loungeCheck);
      
      console.log('🏢 Is lounge:', loungeCheck);
    } catch (error) {
      console.error('❌ Error loading amenity:', error);
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
  
  // ✅ FIXED: Proper date formatting and amenityId inclusion
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
        amenity: amenity?.name
      });
      
      // ✅ FIXED: Format date as YYYY-MM-DD as required by API
      const formattedDate = DateUtils.formatDate(selectedDate, 'YYYY-MM-DD');
      console.log('📅 Formatted date for API:', formattedDate);
      
      // ✅ FIXED: Pass amenityId explicitly
      const slots = await reservationService.getAvailableSlots(
        amenityId, 
        formattedDate, 
        60 // default duration
      );
      
      console.log('✅ Available slots loaded:', slots);
      setAvailableSlots(slots || []);
    } catch (error) {
      console.error('❌ Error loading available slots:', error);
      setAvailableSlots([]);
      
      // Don't show alert for every slot loading error, just log it
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
          language === 'es' ? 'Por favor seleccione una hora' : 'Please select a time slot'
        );
        return;
      }

      // Build reservation data
      const reservationData = {
        amenityId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        durationMinutes: selectedSlot.durationMinutes || 60,
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
                  {DateUtils.formatTime(slot.startTime)}
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
                ? 'Intente con otra fecha'
                : 'Try selecting a different date'}
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
            {language === 'es' ? 'Amenidad:' : 'Amenity:'}
          </Text>
          <Text style={styles.summaryValue}>{amenity?.name}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Icon name="calendar-today" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>
            {language === 'es' ? 'Fecha:' : 'Date:'}
          </Text>
          <Text style={styles.summaryValue}>
            {DateUtils.formatDate(selectedDate, language === 'es' ? 'DD/MM/YYYY' : 'MM/DD/YYYY')}
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Icon name="schedule" size={20} color={COLORS.primary} />
          <Text style={styles.summaryLabel}>
            {language === 'es' ? 'Hora:' : 'Time:'}
          </Text>
          <Text style={styles.summaryValue}>
            {selectedSlot ? DateUtils.formatTime(selectedSlot.startTime) : 'N/A'}
          </Text>
        </View>
      </Card>

      {/* Lounge-specific options */}
      {isLounge && (
        <Card style={styles.optionsCard}>
          <Text style={styles.sectionTitle}>
            {language === 'es' ? 'Opciones Adicionales' : 'Additional Options'}
          </Text>
          
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>
              {language === 'es' ? 'Número de Visitantes:' : 'Number of Visitors:'}
            </Text>
            <Input
              value={visitorCount}
              onChangeText={setVisitorCount}
              keyboardType="numeric"
              style={styles.visitorInput}
              maxLength={2}
            />
          </View>
          
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>
              {language === 'es' ? 'Usar Parrilla:' : 'Use Grill:'}
            </Text>
            <Switch
              value={willUseGrill}
              onValueChange={setWillUseGrill}
              trackColor={{ false: COLORS.border.light, true: COLORS.primary }}
              thumbColor={willUseGrill ? COLORS.white : COLORS.text.secondary}
            />
          </View>
        </Card>
      )}

      {/* Notes */}
      <Card style={styles.notesCard}>
        <Text style={styles.sectionTitle}>
          {language === 'es' ? 'Notas (Opcional)' : 'Notes (Optional)'}
        </Text>
        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder={language === 'es' 
            ? 'Agregar notas adicionales...'
            : 'Add additional notes...'}
          multiline
          numberOfLines={3}
          maxLength={500}
          style={styles.notesInput}
        />
        <Text style={styles.charCount}>
          {notes.length}/500
        </Text>
      </Card>
    </ScrollView>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.step, currentStep >= 1 && styles.activeStep]}>
        <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepNumber]}>1</Text>
      </View>
      <View style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]} />
      <View style={[styles.step, currentStep >= 2 && styles.activeStep]}>
        <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>2</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <LoadingSpinner 
        message={language === 'es' ? 'Cargando amenidad...' : 'Loading amenity...'} 
      />
    );
  }

  if (!amenity) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>
          {language === 'es' ? 'Amenidad no encontrada' : 'Amenity not found'}
        </Text>
        <Button
          title={language === 'es' ? 'Volver' : 'Go Back'}
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{amenity.name}</Text>
        <Text style={styles.subtitle}>
          {language === 'es' ? 'Nueva Reservación' : 'New Reservation'}
        </Text>
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <View style={styles.content}>
        {currentStep === 1 ? renderDateTimeStep() : renderDetailsStep()}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {currentStep > 1 && (
          <Button
            title={language === 'es' ? 'Anterior' : 'Previous'}
            variant="outline"
            onPress={handlePreviousStep}
            style={styles.previousButton}
          />
        )}
        <Button
          title={
            currentStep === 1 
              ? (language === 'es' ? 'Siguiente' : 'Next')
              : (language === 'es' ? 'Confirmar Reservación' : 'Confirm Reservation')
          }
          onPress={handleNextStep}
          loading={reservationLoading}
          disabled={currentStep === 1 && !selectedSlot}
          style={styles.nextButton}
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
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
  },
  activeStepNumber: {
    color: COLORS.white,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.border.light,
    marginHorizontal: SPACING.sm,
  },
  activeStepLine: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  selectionCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  dateButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  slotButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: FONT_SIZES.sm,
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
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  noSlotsSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  summaryValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  optionsCard: {
    marginBottom: SPACING.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  optionLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  visitorInput: {
    width: 80,
    textAlign: 'center',
  },
  notesCard: {
    marginBottom: SPACING.lg,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    gap: SPACING.sm,
  },
  previousButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
});

export default AmenityBookingScreen;