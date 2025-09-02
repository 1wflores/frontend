// src/components/reservation/EditReservationModal.jsx - UPDATED WITH LOUNGE SUPPORT

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { reservationService } from '../../services/reservationService';
import { amenityService } from '../../services/amenityService';
import { DateUtils } from '../../utils/dateUtils';
import { Localization } from '../../utils/localization';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const EditReservationModal = ({ 
  visible, 
  reservation, 
  onClose, 
  onUpdate 
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [amenity, setAmenity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Lounge-specific states
  const [visitorCount, setVisitorCount] = useState('1');
  const [willUseGrill, setWillUseGrill] = useState(false);
  const [isLounge, setIsLounge] = useState(false);
  
  // NEW: Duration for lounge editing
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [availableDurations, setAvailableDurations] = useState([]);
  const [originalDuration, setOriginalDuration] = useState(60);
  
  // Initialize state when reservation changes
  useEffect(() => {
    if (reservation && visible) {
      initializeEditForm();
    }
  }, [reservation, visible]);
  
  // Load available slots when date or duration changes
  useEffect(() => {
    if (amenity && selectedDate && visible) {
      loadAvailableSlots();
    }
  }, [selectedDate, amenity, selectedDuration, visible]);
  
  const initializeEditForm = async () => {
    try {
      setLoading(true);
      
      // Set initial date and time from reservation
      const startTime = new Date(reservation.startTime);
      const endTime = new Date(reservation.endTime);
      setSelectedDate(startTime);
      
      // Calculate original duration
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      setOriginalDuration(durationMinutes);
      setSelectedDuration(durationMinutes);
      
      setSelectedSlot({
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        label: `${DateUtils.formatTime(new Date(reservation.startTime))} - ${DateUtils.formatTime(new Date(reservation.endTime))}`
      });
      setNotes(reservation.notes || reservation.specialRequests || '');
      
      // Load amenity details
      const amenityData = await amenityService.getAmenityById(reservation.amenityId);
      setAmenity(amenityData);
      
      // Check if it's a lounge amenity
      const loungeCheck = amenityData?.type === 'lounge' || 
                         amenityData?.name?.toLowerCase().includes('lounge');
      setIsLounge(loungeCheck);
      
      // NEW: Set up durations for lounge
      if (loungeCheck) {
        const maxDuration = amenityData.maxDuration || 240;
        const durations = [];
        
        for (let i = 60; i <= maxDuration; i += 30) {
          const hours = Math.floor(i / 60);
          const minutes = i % 60;
          const label = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
          durations.push({ value: i, label });
        }
        
        setAvailableDurations(durations);
        
        // Initialize lounge-specific fields
        setVisitorCount(reservation.visitorCount?.toString() || '1');
        setWillUseGrill(reservation.willUseGrill || false);
      } else {
        setAvailableDurations([{ value: 60, label: '1h' }]);
      }
      
    } catch (error) {
      console.error('Error initializing edit form:', error);
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'Error al cargar datos de la reserva'
          : 'Error loading reservation data'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const loadAvailableSlots = async () => {
    if (!amenity) return;
    
    try {
      setLoadingSlots(true);
      console.log('Loading available slots for edit...', {
        amenityId: reservation.amenityId,
        date: selectedDate,
        duration: selectedDuration
      });
      
      const formattedDate = DateUtils.formatDate(selectedDate, 'YYYY-MM-DD');
      
      // Get available slots with the selected duration
      const slots = await reservationService.getAvailableSlots(
        reservation.amenityId, 
        formattedDate, 
        selectedDuration
      );
      
      // Add current reservation slot if it's not already included
      const currentSlotExists = slots.some(slot => 
        new Date(slot.startTime).getTime() === new Date(reservation.startTime).getTime()
      );
      
      if (!currentSlotExists) {
        const currentSlot = {
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          available: true,
          isCurrent: true
        };
        slots.push(currentSlot);
      }
      
      // Sort slots by start time
      slots.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading slots for edit:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowDatePicker(false);
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  // NEW: Handle duration change
  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
    setSelectedSlot(null); // Clear slot when duration changes
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!selectedSlot) {
        Alert.alert(
          t('error') || 'Error',
          language === 'es' ? 'Seleccione un horario' : 'Please select a time slot'
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

      // Prepare update data
      const updateData = {
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes.trim(),
      };

      // Add lounge-specific fields
      if (isLounge) {
        updateData.visitorCount = parseInt(visitorCount) || 1;
        updateData.willUseGrill = willUseGrill;
      }

      console.log('Updating reservation with data:', updateData);

      // Call update service
      const updatedReservation = await reservationService.updateReservation(
        reservation.id, 
        updateData
      );

      console.log('Reservation updated successfully:', updatedReservation);

      // Call parent callback
      if (onUpdate) {
        onUpdate(updatedReservation);
      }

      // Show success message
      Alert.alert(
        t('success') || 'Success',
        language === 'es' 
          ? 'Reserva actualizada exitosamente'
          : 'Reservation updated successfully'
      );

      onClose();

    } catch (error) {
      console.error('Error updating reservation:', error);
      Alert.alert(
        t('error') || 'Error',
        error.message || (language === 'es' 
          ? 'Error al actualizar la reserva'
          : 'Error updating reservation')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !reservation) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'es' ? 'Editar Reserva' : 'Edit Reservation'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
            <Text style={styles.loadingText}>
              {language === 'es' ? 'Cargando...' : 'Loading...'}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {/* Amenity Info */}
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>
                {language === 'es' ? 'Amenidad' : 'Amenity'}
              </Text>
              <Text style={styles.amenityName}>{amenity?.name}</Text>
            </Card>

            {/* NEW: Duration Selection for Lounge */}
            {isLounge && (
              <Card style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="timer" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>
                    {language === 'es' ? 'Duración' : 'Duration'}
                  </Text>
                </View>
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
              </Card>
            )}

            {/* Date Selection */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="calendar-today" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>
                  {language === 'es' ? 'Fecha' : 'Date'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {DateUtils.formatDate(selectedDate, language === 'es' ? 'DD/MM/YYYY' : 'MM/DD/YYYY')}
                </Text>
                <Icon name="calendar-today" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </Card>

            {/* Time Slots */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="schedule" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>
                  {language === 'es' ? 'Horario' : 'Time Slot'}
                </Text>
              </View>
              
              {loadingSlots ? (
                <LoadingSpinner size="small" />
              ) : availableSlots.length > 0 ? (
                <View style={styles.slotsContainer}>
                  {availableSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.slotButton,
                        selectedSlot?.startTime === slot.startTime && styles.selectedSlot,
                        slot.isCurrent && styles.currentSlot
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text style={[
                        styles.slotTime,
                        selectedSlot?.startTime === slot.startTime && styles.selectedSlotText
                      ]}>
                        {isLounge ? (
                          `${DateUtils.formatTime(new Date(slot.startTime))} - ${DateUtils.formatTime(new Date(slot.endTime))}`
                        ) : (
                          DateUtils.formatTime(new Date(slot.startTime))
                        )}
                      </Text>
                      {slot.isCurrent && (
                        <Text style={styles.currentSlotLabel}>
                          {language === 'es' ? 'Actual' : 'Current'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.noSlotsText}>
                  {language === 'es' 
                    ? 'No hay horarios disponibles para esta fecha'
                    : 'No time slots available for this date'}
                </Text>
              )}
            </Card>

            {/* Lounge-specific: Visitor Count */}
            {isLounge && (
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
                  placeholder="1"
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.fieldNote}>
                  {language === 'es' 
                    ? `Máximo ${amenity?.capacity || 20} personas`
                    : `Maximum ${amenity?.capacity || 20} people`}
                </Text>
              </Card>
            )}

            {/* Lounge-specific: Grill Usage */}
            {isLounge && (
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
            )}

            {/* Notes */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="notes" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>
                  {language === 'es' ? 'Notas' : 'Notes'}
                </Text>
              </View>
              <Input
                value={notes}
                onChangeText={setNotes}
                placeholder={language === 'es' ? 'Notas adicionales...' : 'Additional notes...'}
                multiline
                numberOfLines={3}
                style={styles.notesInput}
              />
            </Card>
          </ScrollView>
        )}

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <Button
            title={language === 'es' ? 'Cancelar' : 'Cancel'}
            onPress={onClose}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title={language === 'es' ? 'Guardar' : 'Save'}
            onPress={handleSave}
            loading={loading}
            disabled={loading || !selectedSlot}
            style={styles.footerButton}
          />
        </View>

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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
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
  closeButton: {
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
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
  section: {
    marginVertical: SPACING.sm,
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.h4,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  amenityName: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  
  // Duration styles
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
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
  },
  slotsContainer: {
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
  currentSlot: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  slotTime: {
    fontSize: FONT_SIZES.body,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedSlotText: {
    color: COLORS.white,
  },
  currentSlotLabel: {
    fontSize: FONT_SIZES.small,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  noSlotsText: {
    textAlign: 'center',
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.body,
    paddingVertical: SPACING.lg,
  },
  fieldNote: {
    fontSize: FONT_SIZES.small,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
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
    marginLeft: SPACING.sm,
    flex: 1,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  footerButton: {
    flex: 1,
  },
});

export default EditReservationModal;