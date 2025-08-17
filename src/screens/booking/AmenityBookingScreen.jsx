import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../hooks/useAuth';
import { useAmenities } from '../../hooks/useAmenities';
import { useReservations } from '../../hooks/useReservations';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { TimeSlotPicker } from '../../components/reservation/TimeSlotPicker';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const AmenityBookingScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { amenityId } = route.params;
  const { user } = useAuth();
  
  const { getAmenityById } = useAmenities();
  const { createReservation, getAvailableSlots, reservations } = useReservations();
  
  const [amenity, setAmenity] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [visitorCount, setVisitorCount] = useState('');
  const [grillUsage, setGrillUsage] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  useEffect(() => {
    loadAmenity();
  }, [amenityId]);

  useEffect(() => {
    if (selectedDate && amenity) {
      loadAvailableSlots();
    }
  }, [selectedDate, amenity]);

  const loadAmenity = async () => {
    try {
      setLoading(true);
      const amenityData = await getAmenityById(amenityId);
      if (!amenityData) {
        Alert.alert('Error', 'Amenity not found');
        navigation.goBack();
        return;
      }

      // Check if admin can book this amenity
      if (user?.role === 'admin' && amenityData.type !== 'maintenance') {
        Alert.alert(
          'Access Restricted',
          'Administrators can only make maintenance reservations. Regular amenity bookings are restricted for admin users.',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
        return;
      }

      setAmenity(amenityData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load amenity details');
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
      Alert.alert('Error', error.message);
      setAvailableSlots([]);
    }
  };

  const handleDateSelect = (day) => {
    const today = DateUtils.getDateString(new Date());
    const selectedDateObj = new Date(day.dateString);
    
    if (day.dateString < today) {
      Alert.alert('Invalid Date', 'Please select a future date');
      return;
    }
    
    // Check 24-hour advance booking for lounge
    if (amenity?.type === 'lounge') {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      if (selectedDateObj < twentyFourHoursFromNow) {
        Alert.alert(
          'Invalid Date', 
          'Lounge reservations must be made at least 24 hours in advance. Please select a date that is at least 24 hours from now.',
          [{ text: 'OK' }]
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
      Alert.alert('Access Denied', adminValidation.error);
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
        Alert.alert('Invalid Time', timeValidation.error);
        return false;
      }
    }

    if (amenity?.type === 'lounge' && visitorCount) {
      const count = parseInt(visitorCount);
      const validation = ValidationUtils.validateVisitorCount(count, amenity.capacity);
      if (!validation.isValid) {
        Alert.alert('Invalid Input', validation.error);
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
      
      // More accurate success message
      const isAutoApproved = selectedSlot.autoApproval;
      
      Alert.alert(
        'Success!',
        isAutoApproved 
          ? 'Your reservation has been confirmed!'
          : 'Your reservation has been submitted for admin approval. This is because you have another reservation for this amenity on the same date.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('BookingConfirmation', { 
                reservationId: reservation.id 
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepIndicatorContainer}>
          <View style={[
            styles.stepDot,
            step >= stepNumber && styles.activeStepDot,
            step > stepNumber && styles.completedStepDot,
          ]}>
            {step > stepNumber ? (
              <Icon name="check" size={16} color={COLORS.text.inverse} />
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
              step > stepNumber && styles.activeStepLine,
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderDateSelection = () => (
    <Card style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Date</Text>
      <Text style={styles.stepSubtitle}>
        Choose when you'd like to use {amenity?.name}
        {amenity?.type === 'lounge' && (
          <Text style={styles.loungeWarning}>
            {'\n'}⚠️ Lounge requires 24-hour advance booking
          </Text>
        )}
      </Text>
      
      <Calendar
        onDayPress={handleDateSelect}
        minDate={DateUtils.getDateString(new Date())}
        markedDates={{
          ...(selectedDate && {
            [selectedDate]: { selected: true, selectedColor: COLORS.primary }
          })
        }}
        theme={{
          backgroundColor: COLORS.surface,
          calendarBackground: COLORS.surface,
          textSectionTitleColor: COLORS.primary,
          selectedDayBackgroundColor: COLORS.primary,
          selectedDayTextColor: COLORS.text.inverse,
          todayTextColor: COLORS.primary,
          dayTextColor: COLORS.text.primary,
          textDisabledColor: COLORS.text.secondary,
          monthTextColor: COLORS.text.primary,
          textDayFontSize: FONT_SIZES.md,
          textMonthFontSize: FONT_SIZES.lg,
          textDayHeaderFontSize: FONT_SIZES.sm,
        }}
      />
    </Card>
  );

  const renderTimeSelection = () => (
    <Card style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Time</Text>
      <Text style={styles.stepSubtitle}>
        Available slots for {DateUtils.formatDate(selectedDate)}
      </Text>
      
      {selectedSlot ? (
        <View style={styles.selectedTimeContainer}>
          <View style={styles.selectedTimeHeader}>
            <Icon name="access-time" size={24} color={COLORS.success} />
            <Text style={styles.selectedTimeTitle}>Selected Time</Text>
          </View>
          
          <Text style={styles.selectedTimeText}>
            {DateUtils.formatTime(selectedSlot.startTime)} - {DateUtils.formatTime(selectedSlot.endTime)}
          </Text>
          <Text style={styles.selectedDurationText}>
            {selectedSlot.duration} minutes • {selectedSlot.autoApproval ? 'Auto-approved' : 'Requires approval'}
          </Text>
          
          <Button
            title="Change Time"
            variant="outline"
            size="small"
            onPress={() => setShowTimeSlots(true)}
            style={styles.changeTimeButton}
          />
        </View>
      ) : (
        <Button
          title="Choose Time Slot"
          onPress={() => setShowTimeSlots(true)}
          fullWidth
        />
      )}
      
      <View style={styles.stepActions}>
        <Button
          title="Back"
          variant="outline"
          onPress={() => setStep(1)}
          style={styles.backButton}
        />
        
        {selectedSlot && (
          <Button
            title="Continue"
            onPress={() => setStep(3)}
            style={styles.nextButton}
          />
        )}
      </View>
      
      <TimeSlotPicker
        visible={showTimeSlots}
        slots={availableSlots}
        onSelect={handleSlotSelect}
        onClose={() => setShowTimeSlots(false)}
        amenityName={amenity?.name}
        date={selectedDate}
      />
    </Card>
  );

  const renderDetailsForm = () => (
    <Card style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Additional Details</Text>
      <Text style={styles.stepSubtitle}>Add any special requirements</Text>
      
      {amenity?.type === 'lounge' && (
        <>
          <Input
            label="Number of Visitors"
            placeholder="How many people will attend?"
            value={visitorCount}
            onChangeText={setVisitorCount}
            keyboardType="numeric"
            leftIcon="group"
          />
          
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setGrillUsage(!grillUsage)}
          >
            <Icon
              name={grillUsage ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={COLORS.primary}
            />
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxLabel}>Grill Usage</Text>
              <Text style={styles.checkboxSubtext}>
                Additional ${amenity?.specialRequirements?.depositAmount || 50} deposit required
              </Text>
            </View>
          </TouchableOpacity>
        </>
      )}
      
      <Input
        label="Special Notes (Optional)"
        placeholder="Any special requests or notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        leftIcon="note-add"
      />
      
      <View style={styles.stepActions}>
        <Button
          title="Back"
          variant="outline"
          onPress={() => setStep(2)}
          style={styles.backButton}
        />
        <Button
          title="Review"
          onPress={() => setStep(4)}
          style={styles.nextButton}
        />
      </View>
    </Card>
  );

  const renderConfirmation = () => {
    if (!selectedSlot || !amenity) return null;

    const depositRequired = amenity.specialRequirements?.requiresDeposit && grillUsage;

    return (
      <Card style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Confirm Reservation</Text>
        <Text style={styles.stepSubtitle}>Please review your booking details</Text>
        
        <Card style={styles.confirmationCard}>
          <View style={styles.confirmationHeader}>
            <Icon name="place" size={24} color={COLORS.primary} />
            <Text style={styles.amenityTitle}>{amenity.name}</Text>
          </View>
          
          <View style={styles.confirmationDetails}>
            <View style={styles.detailRow}>
              <Icon name="calendar-today" size={20} color={COLORS.text.secondary} />
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {DateUtils.formatDate(selectedSlot.startTime)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="access-time" size={20} color={COLORS.text.secondary} />
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {DateUtils.formatTime(selectedSlot.startTime)} - {DateUtils.formatTime(selectedSlot.endTime)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="timer" size={20} color={COLORS.text.secondary} />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {selectedSlot.duration} minutes
              </Text>
            </View>
            
            {visitorCount && (
              <View style={styles.detailRow}>
                <Icon name="group" size={20} color={COLORS.text.secondary} />
                <Text style={styles.detailLabel}>Visitors</Text>
                <Text style={styles.detailValue}>{visitorCount}</Text>
              </View>
            )}
            
            {grillUsage && (
              <View style={styles.detailRow}>
                <Icon name="outdoor-grill" size={20} color={COLORS.text.secondary} />
                <Text style={styles.detailLabel}>Grill Usage</Text>
                <Text style={styles.detailValue}>Yes</Text>
              </View>
            )}
            
            {notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{notes}</Text>
              </View>
            )}
          </View>
          
          {depositRequired && (
            <View style={styles.depositNotice}>
              <Icon name="account-balance-wallet" size={20} color={COLORS.warning} />
              <Text style={styles.depositText}>
                ${amenity.specialRequirements?.depositAmount} deposit required for grill usage
              </Text>
            </View>
          )}
          
          {!selectedSlot.autoApproval && (
            <View style={styles.approvalNotice}>
              <Icon name="info" size={20} color={COLORS.primary} />
              <Text style={styles.approvalNoticeText}>
                This reservation requires admin approval because you have another booking for this amenity on the same date.
              </Text>
            </View>
          )}
        </Card>
        
        <View style={styles.stepActions}>
          <Button
            title="Back"
            variant="outline"
            onPress={() => setStep(3)}
            style={styles.backButton}
          />
          <Button
            title="Confirm Booking"
            onPress={handleCreateReservation}
            loading={loading}
            style={styles.confirmButton}
          />
        </View>
      </Card>
    );
  };

  if (loading && !amenity) {
    return <LoadingSpinner message="Loading amenity details..." />;
  }

  if (!amenity) {
    return null;
  }

  return (
    <View style={styles.container}>
      {renderStepIndicator()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderDateSelection()}
        {step === 2 && renderTimeSelection()}
        {step === 3 && renderDetailsForm()}
        {step === 4 && renderConfirmation()}
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.text.secondary,
  },
  activeStepDot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  completedStepDot: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  activeStepNumber: {
    color: COLORS.text.inverse,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.text.secondary,
    marginHorizontal: SPACING.xs,
  },
  activeStepLine: {
    backgroundColor: COLORS.success,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
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
  loungeWarning: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '600',
  },
  selectedTimeContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  selectedTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  selectedTimeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: SPACING.xs,
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
    marginBottom: SPACING.sm,
  },
  changeTimeButton: {
    alignSelf: 'flex-start',
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
    marginBottom: SPACING.lg,
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
    marginLeft: SPACING.sm,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  notesContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
  },
  depositNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  depositText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    flex: 1,
  },
  approvalNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FF',
    padding: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  approvalNoticeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    flex: 1,
    lineHeight: 20,
  },
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  backButton: {
    flex: 0.4,
  },
  nextButton: {
    flex: 0.4,
  },
  confirmButton: {
    flex: 0.4,
  },
});

export default AmenityBookingScreen;