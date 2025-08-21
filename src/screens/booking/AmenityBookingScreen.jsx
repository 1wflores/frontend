import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ ADDED: Language support
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator'; // ✅ ADDED: Error translation
import { Localization } from '../../utils/localization'; // ✅ ADDED: Data translation
import { useAuth } from '../../hooks/useAuth';
import { useAmenities } from '../../hooks/useAmenities';
import { useReservations } from '../../hooks/useReservations';
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const AmenityBookingScreen = ({ route, navigation }) => {
  const { amenityId } = route.params;
  const { language, t } = useLanguage(); // ✅ ADDED: Language hook
  const { user } = useAuth();
  const { getAmenityById } = useAmenities();
  const { reservations, createReservation, getAvailableSlots } = useReservations();

  const [amenity, setAmenity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Date, 2: Time, 3: Details, 4: Confirm
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  
  // Form data
  const [visitorCount, setVisitorCount] = useState('');
  const [grillUsage, setGrillUsage] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAmenityDetails();
  }, [amenityId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAmenityDetails = async () => {
    try {
      setLoading(true);
      const amenityData = await getAmenityById(amenityId);

      // ✅ FIXED: Admin validation with translations
      if (user?.role === 'admin') {
        Alert.alert(
          language === 'es' ? 'Acceso Denegado' : 'Access Denied',
          language === 'es' 
            ? 'Las reservas regulares de amenidades están restringidas para usuarios administradores.'
            : 'Regular amenity bookings are restricted for admin users.',
          [
            { text: t('ok'), onPress: () => navigation.goBack() }
          ]
        );
        return;
      }

      setAmenity(amenityData);
    } catch (error) {
      // ✅ FIXED: Error translation
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error'), errorMessage);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const slots = await getAvailableSlots(amenityId, selectedDate);
      
      // Enhanced slots with smart approval logic
      const enhancedSlots = slots.map(slot => {
        const reservationData = {
          amenityId,
          startTime: slot.startTime,
          userId: user?.id
        };
        
        const needsApproval = ValidationUtils.needsApproval(reservationData, reservations);
        
        return {
          ...slot,
          autoApproval: !needsApproval
        };
      });

      setAvailableSlots(enhancedSlots);
    } catch (error) {
      // ✅ FIXED: Error translation
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error'), errorMessage);
      setAvailableSlots([]);
    }
  };

  const handleDateSelect = (day) => {
    const today = DateUtils.getDateString(new Date());
    const selectedDateObj = new Date(day.dateString);
    
    if (day.dateString < today) {
      Alert.alert(t('invalidDate'), t('selectFutureDate'));
      return;
    }
    
    // ✅ FIXED: 24-hour advance booking validation with translations
    if (amenity?.type === 'lounge') {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      if (selectedDateObj < twentyFourHoursFromNow) {
        Alert.alert(
          t('invalidDate'),
          language === 'es' 
            ? 'Las reservas del salón deben hacerse con al menos 24 horas de anticipación. Por favor seleccione una fecha que sea al menos 24 horas desde ahora.'
            : 'Lounge reservations must be made at least 24 hours in advance. Please select a date that is at least 24 hours from now.',
          [{ text: t('ok') }]
        );
        return;
      }
    }
    
    setSelectedDate(day.dateString);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowTimeSlots(false);
    setStep(3);
  };

  const validateForm = () => {
    // Admin validation
    const adminValidation = ValidationUtils.validateAdminReservation(user, amenity?.type);
    if (!adminValidation.isValid) {
      Alert.alert(
        language === 'es' ? 'Acceso Denegado' : 'Access Denied', 
        ApiErrorTranslator.translateError(adminValidation.error, language)
      );
      return false;
    }

    // Reservation time validation with amenity type
    if (selectedSlot) {
      const startTime = new Date(selectedSlot.startTime);
      const endTime = new Date(selectedSlot.endTime);
      
      const timeValidation = ValidationUtils.validateReservationTime(
        startTime, 
        endTime, 
        amenity?.type
      );
      
      if (!timeValidation.isValid) {
        Alert.alert(
          language === 'es' ? 'Hora Inválida' : 'Invalid Time', 
          ApiErrorTranslator.translateError(timeValidation.error, language)
        );
        return false;
      }
    }

    if (amenity?.type === 'lounge' && visitorCount) {
      const count = parseInt(visitorCount);
      const validation = ValidationUtils.validateVisitorCount(count, amenity.capacity);
      if (!validation.isValid) {
        Alert.alert(
          t('invalidInput'), 
          ApiErrorTranslator.translateError(validation.error, language)
        );
        return false;
      }
    }

    return true;
  };

  const handleCreateReservation = async () => {
    if (!selectedSlot || !amenity || !validateForm()) return;

    const reservationData = {
      amenityId: amenity.id,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      specialRequests: {
        ...(visitorCount && { visitorCount: parseInt(visitorCount) }),
        ...(grillUsage && { grillUsage: true }),
        ...(notes && { notes }),
      },
    };

    try {
      setLoading(true);
      const reservation = await createReservation(reservationData);
      
      // ✅ FIXED: Success message with translations
      const isAutoApproved = selectedSlot.autoApproval;
      
      Alert.alert(
        t('success'),
        isAutoApproved 
          ? t('reservationConfirmed')
          : t('reservationSubmitted'),
        [
          {
            text: t('ok'),
            onPress: () => {
              navigation.navigate('BookingConfirmation', {
                reservationId: reservation.id,
              });
            },
          },
        ]
      );
    } catch (error) {
      // ✅ FIXED: Error translation
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Get translated amenity name
  const getTranslatedAmenityName = () => {
    return Localization.translateAmenity(amenity?.name, language);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            step >= stepNumber && styles.activeStep,
            step > stepNumber && styles.completedStep,
          ]}>
            {step > stepNumber ? (
              <Icon name="check" size={16} color={COLORS.white} />
            ) : (
              <Text style={[
                styles.stepNumber,
                step >= stepNumber && styles.activeStepNumber,
              ]}>
                {stepNumber}
              </Text>
            )}
          </View>
          {stepNumber < 4 && (
            <View style={[
              styles.stepLine,
              step > stepNumber && styles.completedStepLine,
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderDateSelection = () => (
    <Card style={styles.stepCard}>
      {/* ✅ FIXED: Step title with translations */}
      <Text style={styles.stepTitle}>{t('selectDate')}</Text>
      <Text style={styles.stepSubtitle}>
        {t('chooseWhenToUse')} {getTranslatedAmenityName()}
      </Text>
      
      {/* ✅ FIXED: Lounge warning with translations */}
      {amenity?.type === 'lounge' && (
        <View style={styles.warningCard}>
          <Icon name="schedule" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            {language === 'es' 
              ? 'El salón requiere reserva con 24 horas de anticipación'
              : 'Lounge requires 24-hour advance booking'
            }
          </Text>
        </View>
      )}

      <Calendar
        onDayPress={handleDateSelect}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: COLORS.primary,
          },
        }}
        minDate={DateUtils.getDateString(new Date())}
        theme={{
          selectedDayBackgroundColor: COLORS.primary,
          todayTextColor: COLORS.primary,
          arrowColor: COLORS.primary,
        }}
      />
    </Card>
  );

  const renderTimeSelection = () => (
    <Card style={styles.stepCard}>
      {/* ✅ FIXED: Step title with translations */}
      <Text style={styles.stepTitle}>{t('selectTime')}</Text>
      <Text style={styles.stepSubtitle}>
        {t('availableSlotsFor')} {DateUtils.formatDate(selectedDate, language)}
      </Text>

      {availableSlots.length === 0 ? (
        <View style={styles.emptySlots}>
          <Icon name="event-busy" size={48} color={COLORS.text.secondary} />
          <Text style={styles.emptySlotsText}>
            {language === 'es' 
              ? 'No hay horarios disponibles para esta fecha'
              : 'No available time slots for this date'
            }
          </Text>
          <Button
            title={t('back')}
            variant="outline"
            onPress={() => setStep(1)}
            style={styles.backButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.slotsContainer}>
            {availableSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.slotButton,
                  selectedSlot?.startTime === slot.startTime && styles.selectedSlot,
                ]}
                onPress={() => handleSlotSelect(slot)}
              >
                <Text style={[
                  styles.slotTime,
                  selectedSlot?.startTime === slot.startTime && styles.selectedSlotTime,
                ]}>
                  {DateUtils.formatTime(slot.startTime)}
                </Text>
                <Text style={[
                  styles.slotDuration,
                  selectedSlot?.startTime === slot.startTime && styles.selectedSlotDuration,
                ]}>
                  {Math.round(slot.duration / 60)} {language === 'es' ? 'min' : 'min'}
                </Text>
                {slot.autoApproval && (
                  <View style={styles.autoApprovalBadge}>
                    <Text style={styles.autoApprovalText}>
                      {language === 'es' ? 'Auto' : 'Auto'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.stepActions}>
            <Button
              title={t('back')}
              variant="outline"
              onPress={() => setStep(1)}
              style={styles.stepButton}
            />
          </View>
        </>
      )}
    </Card>
  );

  const renderDetailsForm = () => (
    <Card style={styles.stepCard}>
      {/* ✅ FIXED: Step title with translations */}
      <Text style={styles.stepTitle}>{t('additionalDetails')}</Text>
      
      {selectedSlot && (
        <View style={styles.selectedTimeContainer}>
          <Icon name="schedule" size={20} color={COLORS.primary} />
          <View style={styles.selectedTimeContent}>
            {/* ✅ FIXED: Selected time with translations */}
            <Text style={styles.selectedTimeLabel}>{t('selectedTime')}</Text>
            <Text style={styles.selectedTimeText}>
              {DateUtils.formatTime(selectedSlot.startTime)} - {DateUtils.formatTime(selectedSlot.endTime)}
            </Text>
            <Text style={styles.selectedDurationText}>
              {DateUtils.formatDate(selectedDate, language)} • {Math.round((new Date(selectedSlot.endTime) - new Date(selectedSlot.startTime)) / (1000 * 60))} {t('minutes')}
            </Text>
          </View>
          <Button
            title={t('changeTime')}
            variant="outline"
            size="small"
            onPress={() => setStep(2)}
            style={styles.changeTimeButton}
          />
        </View>
      )}

      {/* ✅ FIXED: Visitor count input with translations */}
      {amenity?.type === 'lounge' && (
        <View style={styles.formSection}>
          <Input
            label={t('numberOfVisitors')}
            placeholder="0"
            value={visitorCount}
            onChangeText={setVisitorCount}
            keyboardType="numeric"
            leftIcon="people"
          />
          <Text style={styles.helpText}>
            {t('howManyPeople')}
          </Text>
        </View>
      )}

      {/* ✅ FIXED: Grill usage checkbox with translations */}
      {amenity?.type === 'lounge' && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setGrillUsage(!grillUsage)}
        >
          <Icon 
            name={grillUsage ? 'check-box' : 'check-box-outline-blank'} 
            size={24} 
            color={grillUsage ? COLORS.primary : COLORS.text.secondary} 
          />
          <View style={styles.checkboxContent}>
            <Text style={styles.checkboxLabel}>{t('grillUsage')}</Text>
            <Text style={styles.checkboxSubtext}>
              {language === 'es' 
                ? 'Incluye uso de la parrilla comunitaria (depósito requerido)'
                : 'Includes use of community grill (deposit required)'
              }
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ✅ FIXED: Special notes input with translations */}
      <View style={styles.formSection}>
        <Input
          label={t('specialNotes')}
          placeholder={t('anySpecialRequests')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          leftIcon="comment"
        />
      </View>

      <View style={styles.stepActions}>
        <Button
          title={t('back')}
          variant="outline"
          onPress={() => setStep(2)}
          style={styles.stepButton}
        />
        <Button
          title={t('continue')}
          onPress={() => setStep(4)}
          style={styles.stepButton}
        />
      </View>
    </Card>
  );

  const renderConfirmation = () => (
    <Card style={styles.confirmationCard}>
      {/* ✅ FIXED: Confirmation header with translations */}
      <View style={styles.confirmationHeader}>
        <Icon name="event" size={24} color={COLORS.primary} />
        <Text style={styles.amenityTitle}>
          {getTranslatedAmenityName()}
        </Text>
      </View>

      <View style={styles.confirmationDetails}>
        {/* ✅ FIXED: All detail rows with translations */}
        <View style={styles.detailRow}>
          <Icon name="calendar-today" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailLabel}>{t('date')}</Text>
          <Text style={styles.detailValue}>
            {DateUtils.formatDate(selectedDate, language)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="schedule" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailLabel}>{t('time')}</Text>
          <Text style={styles.detailValue}>
            {DateUtils.formatTime(selectedSlot.startTime)} - {DateUtils.formatTime(selectedSlot.endTime)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="timer" size={16} color={COLORS.text.secondary} />
          <Text style={styles.detailLabel}>{t('duration')}</Text>
          <Text style={styles.detailValue}>
            {Math.round((new Date(selectedSlot.endTime) - new Date(selectedSlot.startTime)) / (1000 * 60))} {t('minutes')}
          </Text>
        </View>

        {visitorCount && (
          <View style={styles.detailRow}>
            <Icon name="people" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailLabel}>{t('visitors')}</Text>
            <Text style={styles.detailValue}>
              {visitorCount} {parseInt(visitorCount) === 1 ? 
                Localization.translateCommon('guest', language) : 
                Localization.translateCommon('guests', language)
              }
            </Text>
          </View>
        )}

        {grillUsage && (
          <View style={styles.detailRow}>
            <Icon name="outdoor-grill" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailLabel}>{t('grillUsage')}</Text>
            <Text style={styles.detailValue}>{t('included')}</Text>
          </View>
        )}

        {notes && (
          <View style={styles.detailRow}>
            <Icon name="comment" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailLabel}>{t('specialNotes')}</Text>
            <Text style={styles.detailValue}>{notes}</Text>
          </View>
        )}
      </View>

      {/* ✅ FIXED: Approval status with translations */}
      <View style={[
        styles.approvalStatus,
        selectedSlot?.autoApproval ? styles.autoApprovalStatus : styles.needsApprovalStatus,
      ]}>
        <Icon 
          name={selectedSlot?.autoApproval ? 'check-circle' : 'schedule'} 
          size={20} 
          color={selectedSlot?.autoApproval ? COLORS.success : COLORS.warning} 
        />
        <Text style={[
          styles.approvalText,
          { color: selectedSlot?.autoApproval ? COLORS.success : COLORS.warning }
        ]}>
          {selectedSlot?.autoApproval ? t('autoApproved') : t('needsApproval')}
        </Text>
      </View>

      <View style={styles.stepActions}>
        <Button
          title={t('back')}
          variant="outline"
          onPress={() => setStep(3)}
          style={styles.stepButton}
        />
        <Button
          title={t('confirmBooking')}
          onPress={handleCreateReservation}
          loading={loading}
          style={styles.stepButton}
        />
      </View>
    </Card>
  );

  if (loading && !amenity) {
    return <LoadingSpinner message={t('loading')} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderStepIndicator()}
      
      {step === 1 && renderDateSelection()}
      {step === 2 && renderTimeSelection()}
      {step === 3 && renderDetailsForm()}
      {step === 4 && renderConfirmation()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  completedStep: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
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
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  completedStepLine: {
    backgroundColor: COLORS.success,
  },
  stepCard: {
    margin: SPACING.md,
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
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  slotButton: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    position: 'relative',
  },
  selectedSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotTime: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  selectedSlotTime: {
    color: COLORS.white,
  },
  slotDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
  selectedSlotDuration: {
    color: COLORS.white,
  },
  autoApprovalBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  autoApprovalText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  selectedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  selectedTimeContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  selectedTimeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  selectedTimeText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  selectedDurationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  changeTimeButton: {
    alignSelf: 'flex-start',
  },
  formSection: {
    marginBottom: SPACING.lg,
  },
  helpText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  checkboxContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  checkboxLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  checkboxSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  confirmationCard: {
    margin: SPACING.md,
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  amenityTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  confirmationDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  approvalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  autoApprovalStatus: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  needsApprovalStatus: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  approvalText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  stepButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  backButton: {
    alignSelf: 'center',
    minWidth: 100,
  },
});

export default AmenityBookingScreen;