// src/screens/booking/AmenityBookingScreen.jsx - COMPLETE FILE WITH GRILL SELECTION

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
    loadAmenityDetails();
  }, [amenityId]);
  
  useEffect(() => {
    if (amenity) {
      loadAvailableSlots();
    }
  }, [selectedDate, amenity]);
  
  const loadAmenityDetails = async () => {
    try {
      setLoading(true);
      const data = await amenityService.getAmenityById(amenityId);
      setAmenity(data);
      
      // Check if it's a lounge amenity
      const loungeCheck = data?.type === 'lounge' || 
                         data?.name?.toLowerCase().includes('lounge');
      setIsLounge(loungeCheck);
    } catch (error) {
      console.error('Error loading amenity:', error);
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'No se pudo cargar la información de la amenidad' 
          : 'Failed to load amenity information'
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  const loadAvailableSlots = async () => {
    if (!amenity) return;
    
    try {
      setLoadingSlots(true);
      const dateStr = DateUtils.formatDate(selectedDate, 'YYYY-MM-DD');
      const slots = await reservationService.getAvailableSlots(
        amenity.id,
        dateStr,
        amenity.defaultDuration || 60
      );
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };
  
  const validateVisitorCount = () => {
    const count = parseInt(visitorCount);
    const maxVisitors = amenity?.maxCapacity || 20;
    
    if (isNaN(count) || count < 1) {
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'El número de visitantes debe ser al menos 1' 
          : 'Number of visitors must be at least 1'
      );
      return false;
    }
    
    if (count > maxVisitors) {
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? `Máximo ${maxVisitors} visitantes permitidos` 
          : `Maximum ${maxVisitors} visitors allowed`
      );
      return false;
    }
    
    return true;
  };
  
  const handleNextStep = () => {
    if (currentStep === 1 && !selectedSlot) {
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'Por favor selecciona un horario' 
          : 'Please select a time slot'
      );
      return;
    }
    
    if (currentStep === 2 && isLounge && !validateVisitorCount()) {
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleConfirmBooking = async () => {
    try {
      const reservationData = {
        amenityId: amenity.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes.trim(),
        specialRequests: notes.trim(),
      };
      
      // Add lounge-specific data
      if (isLounge) {
        reservationData.visitorCount = parseInt(visitorCount);
        reservationData.willUseGrill = willUseGrill;
      }
      
      const result = await createReservation(reservationData);
      
      if (result && result.id) {
        navigation.navigate('BookingConfirmation', { 
          reservationId: result.id 
        });
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'No se pudo crear la reserva. Por favor intenta de nuevo.' 
          : 'Failed to create reservation. Please try again.'
      );
    }
  };
  
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };
  
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate;
  };
  
  const incrementVisitors = () => {
    const current = parseInt(visitorCount) || 0;
    const max = amenity?.maxCapacity || 20;
    if (current < max) {
      setVisitorCount((current + 1).toString());
    }
  };
  
  const decrementVisitors = () => {
    const current = parseInt(visitorCount) || 1;
    if (current > 1) {
      setVisitorCount((current - 1).toString());
    }
  };
  
  const renderStepIndicator = () => {
    const totalSteps = isLounge ? 3 : 2;
    
    return (
      <View style={styles.stepIndicator}>
        {[...Array(totalSteps)].map((_, index) => (
          <React.Fragment key={index}>
            <View style={[
              styles.stepCircle,
              currentStep > index + 1 && styles.completedStep,
              currentStep === index + 1 && styles.activeStep
            ]}>
              <Text style={[
                styles.stepNumber,
                (currentStep >= index + 1) && styles.activeStepNumber
              ]}>
                {index + 1}
              </Text>
            </View>
            {index < totalSteps - 1 && (
              <View style={[
                styles.stepLine,
                currentStep > index + 1 && styles.completedStepLine
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };
  
  const renderStep1 = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>
        {language === 'es' ? 'Selecciona fecha y hora' : 'Select date and time'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {Localization.translateAmenity(amenity?.name, language)}
      </Text>
      
      {/* Date Selection */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Icon name="event" size={24} color={COLORS.primary} />
        <Text style={styles.dateButtonText}>
          {DateUtils.formatDate(selectedDate, language)}
        </Text>
        <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
      </TouchableOpacity>
      
      {/* Available Slots */}
      <Text style={styles.slotsTitle}>
        {language === 'es' ? 'Horarios disponibles' : 'Available time slots'}
      </Text>
      
      {loadingSlots ? (
        <LoadingSpinner size="small" />
      ) : availableSlots.length > 0 ? (
        <View style={styles.slotsContainer}>
          {availableSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.slotButton,
                selectedSlot?.startTime === slot.startTime && styles.selectedSlot
              ]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text style={[
                styles.slotTime,
                selectedSlot?.startTime === slot.startTime && styles.selectedSlotText
              ]}>
                {slot.label}
              </Text>
              {slot.available === false && (
                <Text style={styles.slotUnavailable}>
                  {language === 'es' ? 'Ocupado' : 'Booked'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptySlots}>
          <Icon name="event-busy" size={48} color={COLORS.text.secondary} />
          <Text style={styles.emptySlotsText}>
            {language === 'es' 
              ? 'No hay horarios disponibles para esta fecha' 
              : 'No time slots available for this date'}
          </Text>
          <Button
            title={language === 'es' ? 'Seleccionar otra fecha' : 'Select another date'}
            variant="outline"
            onPress={() => setShowDatePicker(true)}
          />
        </View>
      )}
    </Card>
  );
  
  const renderStep2Lounge = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>
        {language === 'es' ? 'Detalles de la reserva' : 'Reservation details'}
      </Text>
      
      {/* Warning for lounge */}
      <View style={styles.warningCard}>
        <Icon name="info" size={20} color={COLORS.warning} />
        <Text style={styles.warningText}>
          {language === 'es' 
            ? 'El Lounge es un espacio compartido. Sé considerado con otros residentes.' 
            : 'The Lounge is a shared space. Please be considerate of other residents.'}
        </Text>
      </View>
      
      {/* Visitor Count */}
      <View style={styles.detailSection}>
        <View style={styles.detailHeader}>
          <Icon name="group" size={20} color={COLORS.primary} />
          <Text style={styles.detailTitle}>
            {language === 'es' ? 'Número de visitantes' : 'Number of visitors'}
          </Text>
        </View>
        
        <View style={styles.visitorContainer}>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={decrementVisitors}
          >
            <Icon name="remove" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          
          <Input
            value={visitorCount}
            onChangeText={setVisitorCount}
            keyboardType="numeric"
            style={styles.visitorInput}
            textAlign="center"
            maxLength={2}
          />
          
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={incrementVisitors}
          >
            <Icon name="add" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.helperText}>
          {language === 'es'
            ? `Máximo ${amenity?.maxCapacity || 20} visitantes. Incluye a ti mismo en el conteo.`
            : `Maximum ${amenity?.maxCapacity || 20} visitors. Include yourself in the count.`}
        </Text>
      </View>
      
      {/* Grill Usage */}
      <View style={styles.detailSection}>
        <View style={styles.detailHeader}>
          <Icon name="outdoor-grill" size={20} color={COLORS.primary} />
          <Text style={styles.detailTitle}>
            {language === 'es' ? 'Uso de parrilla' : 'Grill usage'}
          </Text>
        </View>
        
        <View style={styles.grillContainer}>
          <Text style={styles.grillLabel}>
            {language === 'es' 
              ? '¿Usarás la parrilla durante tu reserva?' 
              : 'Will you use the grill during your reservation?'}
          </Text>
          <Switch
            value={willUseGrill}
            onValueChange={setWillUseGrill}
            trackColor={{ false: COLORS.border.light, true: COLORS.primary }}
            thumbColor={willUseGrill ? COLORS.white : '#f4f3f4'}
          />
        </View>
        
        {willUseGrill && (
          <View style={styles.grillWarning}>
            <Icon name="info" size={14} color={COLORS.warning} />
            <Text style={styles.grillWarningText}>
              {language === 'es'
                ? 'Se puede requerir un depósito adicional. Por favor limpia la parrilla después de usarla.'
                : 'Additional deposit may be required. Please clean the grill after use.'}
            </Text>
          </View>
        )}
      </View>
      
      {/* Special Requests */}
      <View style={styles.detailSection}>
        <View style={styles.detailHeader}>
          <Icon name="note" size={20} color={COLORS.primary} />
          <Text style={styles.detailTitle}>
            {language === 'es' ? 'Solicitudes especiales' : 'Special requests'}
          </Text>
        </View>
        
        <Input
          placeholder={language === 'es' 
            ? '¿Alguna solicitud especial? (Opcional)' 
            : 'Any special requests? (Optional)'}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          maxLength={500}
          style={styles.notesInput}
        />
      </View>
    </Card>
  );
  
  const renderStep2Regular = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>
        {language === 'es' ? 'Notas adicionales' : 'Additional notes'}
      </Text>
      
      <Input
        placeholder={language === 'es' 
          ? '¿Alguna solicitud especial? (Opcional)' 
          : 'Any special requests? (Optional)'}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        maxLength={500}
        style={styles.notesInput}
      />
      
      <Text style={styles.charCount}>
        {notes.length}/500
      </Text>
    </Card>
  );
  
  const renderSummary = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>
        {language === 'es' ? 'Resumen de reserva' : 'Reservation summary'}
      </Text>
      
      <View style={styles.summaryItem}>
        <Icon name="home" size={20} color={COLORS.text.secondary} />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>
            {language === 'es' ? 'Amenidad' : 'Amenity'}
          </Text>
          <Text style={styles.summaryValue}>
            {Localization.translateAmenity(amenity?.name, language)}
          </Text>
        </View>
      </View>
      
      <View style={styles.summaryItem}>
        <Icon name="event" size={20} color={COLORS.text.secondary} />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>
            {language === 'es' ? 'Fecha' : 'Date'}
          </Text>
          <Text style={styles.summaryValue}>
            {DateUtils.formatDate(selectedDate, language)}
          </Text>
        </View>
      </View>
      
      <View style={styles.summaryItem}>
        <Icon name="schedule" size={20} color={COLORS.text.secondary} />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>
            {language === 'es' ? 'Horario' : 'Time'}
          </Text>
          <Text style={styles.summaryValue}>
            {selectedSlot?.label}
          </Text>
        </View>
      </View>
      
      {isLounge && (
        <>
          <View style={styles.summaryItem}>
            <Icon name="group" size={20} color={COLORS.text.secondary} />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>
                {language === 'es' ? 'Visitantes' : 'Visitors'}
              </Text>
              <Text style={styles.summaryValue}>
                {visitorCount}
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryItem}>
            <Icon name="outdoor-grill" size={20} color={COLORS.text.secondary} />
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>
                {language === 'es' ? 'Uso de parrilla' : 'Grill usage'}
              </Text>
              <Text style={styles.summaryValue}>
                {willUseGrill 
                  ? (language === 'es' ? 'Sí' : 'Yes') 
                  : (language === 'es' ? 'No' : 'No')}
              </Text>
            </View>
          </View>
        </>
      )}
      
      {notes && (
        <View style={styles.summaryItem}>
          <Icon name="note" size={20} color={COLORS.text.secondary} />
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>
              {language === 'es' ? 'Notas' : 'Notes'}
            </Text>
            <Text style={styles.summaryValue}>
              {notes}
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.confirmationWarning}>
        <Icon name="info" size={16} color={COLORS.primary} />
        <Text style={styles.confirmationWarningText}>
          {amenity?.requiresApproval 
            ? (language === 'es' 
              ? 'Esta reserva requiere aprobación del administrador.' 
              : 'This reservation requires admin approval.')
            : (language === 'es'
              ? 'Esta reserva será confirmada automáticamente.'
              : 'This reservation will be automatically confirmed.')}
        </Text>
      </View>
    </Card>
  );
  
  if (loading) {
    return <LoadingSpinner message={t('loading')} />;
  }
  
  if (!amenity) {
    return null;
  }
  
  const totalSteps = isLounge ? 3 : 2;
  const isLastStep = currentStep === totalSteps;
  
  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      {renderStepIndicator()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Render current step */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && !isLounge && renderStep2Regular()}
        {currentStep === 2 && isLounge && renderStep2Lounge()}
        {((currentStep === 3 && isLounge) || (currentStep === 2 && !isLounge && isLastStep)) && renderSummary()}
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <Button
            title={language === 'es' ? 'Anterior' : 'Previous'}
            variant="outline"
            onPress={handlePreviousStep}
            style={styles.footerButton}
          />
        )}
        
        {!isLastStep ? (
          <Button
            title={language === 'es' ? 'Siguiente' : 'Next'}
            onPress={handleNextStep}
            disabled={currentStep === 1 && !selectedSlot}
            style={styles.footerButton}
          />
        ) : (
          <Button
            title={language === 'es' ? 'Confirmar Reserva' : 'Confirm Booking'}
            onPress={handleConfirmBooking}
            loading={reservationLoading}
            style={styles.footerButton}
          />
        )}
      </View>
      
      {/* Date Picker Modal */}
      <DatePicker
        modal
        mode="date"
        open={showDatePicker}
        date={selectedDate}
        minimumDate={getMinDate()}
        maximumDate={getMaxDate()}
        onConfirm={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
          setSelectedSlot(null); // Reset selected slot when date changes
        }}
        onCancel={() => setShowDatePicker(false)}
        title={language === 'es' ? 'Seleccionar fecha' : 'Select date'}
        confirmText={language === 'es' ? 'Confirmar' : 'Confirm'}
        cancelText={language === 'es' ? 'Cancelar' : 'Cancel'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  completedStep: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepNumber: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
  },
  activeStepNumber: {
    color: COLORS.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border.light,
    marginHorizontal: SPACING.xs,
  },
  completedStepLine: {
    backgroundColor: COLORS.success,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  stepCard: {
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginBottom: SPACING.lg,
  },
  dateButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  slotsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  slotButton: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  selectedSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotTime: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedSlotText: {
    color: COLORS.white,
  },
  slotUnavailable: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
  emptySlots: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptySlotsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: SPACING.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  visitorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    gap: SPACING.md,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitorInput: {
    width: 80,
    textAlign: 'center',
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
  grillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  grillLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    flex: 1,
    paddingRight: SPACING.md,
  },
  grillWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.sm,
    borderRadius: 6,
    marginTop: SPACING.sm,
  },
  grillWarningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    lineHeight: 18,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  summaryContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  confirmationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  confirmationWarningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  footerButton: {
    flex: 1,
  },
});

export default AmenityBookingScreen;