// src/components/reservation/EditReservationModal.jsx - COMPLETE FINAL VERSION

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
  
  // Initialize state when reservation changes
  useEffect(() => {
    if (reservation && visible) {
      initializeEditForm();
    }
  }, [reservation, visible]);
  
  // Load available slots when date changes
  useEffect(() => {
    if (amenity && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate, amenity]);
  
  const initializeEditForm = async () => {
    try {
      // Set initial date and time from reservation
      const startTime = new Date(reservation.startTime);
      setSelectedDate(startTime);
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
      
      // Initialize lounge-specific fields
      if (loungeCheck) {
        setVisitorCount(reservation.visitorCount?.toString() || '1');
        setWillUseGrill(reservation.willUseGrill || false);
      }
    } catch (error) {
      console.error('Error initializing edit form:', error);
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'Error al cargar los detalles de la reserva' 
          : 'Failed to load reservation details'
      );
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
      
      // Add the current reservation's slot back as available
      const currentSlot = {
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        label: `${DateUtils.formatTime(new Date(reservation.startTime))} - ${DateUtils.formatTime(new Date(reservation.endTime))}`
      };
      
      // Check if current slot is on the same day
      const currentDate = DateUtils.formatDate(new Date(reservation.startTime), 'YYYY-MM-DD');
      if (currentDate === dateStr) {
        // Find and mark the current slot
        const updatedSlots = slots.map(slot => ({
          ...slot,
          isCurrent: slot.startTime === reservation.startTime
        }));
        
        // If current slot not in list, add it
        const hasCurrentSlot = updatedSlots.some(s => s.isCurrent);
        if (!hasCurrentSlot) {
          updatedSlots.push({ ...currentSlot, isCurrent: true });
        }
        
        // Sort by start time
        updatedSlots.sort((a, b) => 
          new Date(a.startTime) - new Date(b.startTime)
        );
        
        setAvailableSlots(updatedSlots);
      } else {
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
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
  
  const handleUpdateReservation = async () => {
    // Validation
    if (!selectedSlot) {
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'Por favor selecciona un horario' 
          : 'Please select a time slot'
      );
      return;
    }
    
    // Validate visitor count for lounge
    if (isLounge && !validateVisitorCount()) {
      return;
    }
    
    // Check if anything changed
    const hasChanges = 
      selectedSlot.startTime !== reservation.startTime ||
      selectedSlot.endTime !== reservation.endTime ||
      notes !== (reservation.notes || reservation.specialRequests || '') ||
      (isLounge && (
        parseInt(visitorCount) !== (reservation.visitorCount || 1) ||
        willUseGrill !== (reservation.willUseGrill || false)
      ));
    
    if (!hasChanges) {
      Alert.alert(
        t('info') || 'Info',
        language === 'es' 
          ? 'No se han realizado cambios' 
          : 'No changes have been made'
      );
      return;
    }
    
    // Confirm update
    Alert.alert(
      language === 'es' ? 'Confirmar Cambios' : 'Confirm Changes',
      language === 'es' 
        ? '¿Estás seguro de que deseas actualizar esta reserva?' 
        : 'Are you sure you want to update this reservation?',
      [
        {
          text: language === 'es' ? 'Cancelar' : 'Cancel',
          style: 'cancel'
        },
        {
          text: language === 'es' ? 'Actualizar' : 'Update',
          onPress: performUpdate
        }
      ]
    );
  };
  
  const performUpdate = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: notes.trim(),
        specialRequests: notes.trim(),
        // Keep the same amenity
        amenityId: reservation.amenityId,
      };
      
      // Add lounge-specific data
      if (isLounge) {
        updateData.visitorCount = parseInt(visitorCount);
        updateData.willUseGrill = willUseGrill;
      }
      
      // Call the update API
      const updatedReservation = await reservationService.updateReservation(
        reservation.id,
        updateData
      );
      
      Alert.alert(
        t('success') || 'Success',
        language === 'es'
          ? 'Reserva actualizada exitosamente. El horario anterior está ahora disponible para otros usuarios.'
          : 'Reservation updated successfully. The previous time slot is now available for other users.',
        [
          {
            text: 'OK',
            onPress: () => {
              onUpdate(updatedReservation);
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating reservation:', error);
      Alert.alert(
        t('error') || 'Error',
        language === 'es'
          ? 'Error al actualizar la reserva. Por favor intenta de nuevo.'
          : 'Failed to update reservation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };
  
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
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
  
  if (!reservation || !visible) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {language === 'es' ? 'Editar Reserva' : 'Edit Reservation'}
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amenity Info (Read-only) */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="info" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {language === 'es' ? 'Amenidad' : 'Amenity'}
              </Text>
            </View>
            <Text style={styles.amenityName}>
              {Localization.translateAmenity(
                reservation.amenityName || amenity?.name, 
                language
              )}
            </Text>
            <Text style={styles.amenityNote}>
              {language === 'es' 
                ? 'La amenidad no se puede cambiar. Para reservar una amenidad diferente, cancela esta reserva y crea una nueva.'
                : 'The amenity cannot be changed. To book a different amenity, cancel this reservation and create a new one.'}
            </Text>
          </Card>
          
          {/* Date Selection */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="event" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {language === 'es' ? 'Fecha' : 'Date'}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar-today" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>
                {DateUtils.formatDate(selectedDate, language)}
              </Text>
              <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
            
            {/* Show warning if changing date */}
            {DateUtils.formatDate(selectedDate, 'YYYY-MM-DD') !== 
             DateUtils.formatDate(new Date(reservation.startTime), 'YYYY-MM-DD') && (
              <View style={styles.warning}>
                <Icon name="info" size={16} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  {language === 'es'
                    ? 'Estás cambiando la fecha de tu reserva'
                    : 'You are changing your reservation date'}
                </Text>
              </View>
            )}
          </Card>
          
          {/* Time Slot Selection */}
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
                      {slot.label}
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
              
              <Text style={styles.visitorNote}>
                {language === 'es'
                  ? `Máximo ${amenity?.maxCapacity || 20} visitantes. Incluye a ti mismo en el conteo.`
                  : `Maximum ${amenity?.maxCapacity || 20} visitors. Include yourself in the count.`}
              </Text>
            </Card>
          )}
          
          {/* Lounge-specific: Grill Usage */}
          {isLounge && (
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="outdoor-grill" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>
                  {language === 'es' ? 'Uso de Parrilla' : 'Grill Usage'}
                </Text>
              </View>
              
              <View style={styles.grillContainer}>
                <Text style={styles.grillLabel}>
                  {language === 'es' 
                    ? '¿Usarás la parrilla?' 
                    : 'Will you use the grill?'}
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
                  <Icon name="info" size={16} color={COLORS.warning} />
                  <Text style={styles.grillWarningText}>
                    {language === 'es'
                      ? 'Se puede requerir un depósito adicional para el uso de la parrilla.'
                      : 'Additional deposit may be required for grill usage.'}
                  </Text>
                </View>
              )}
            </Card>
          )}
          
          {/* Notes/Comments */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="note" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {language === 'es' ? 'Notas o Comentarios' : 'Notes or Comments'}
              </Text>
            </View>
            
            <Input
              placeholder={language === 'es' 
                ? 'Agrega cualquier nota o solicitud especial...'
                : 'Add any notes or special requests...'}
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
          
          {/* Summary of Changes */}
          {(selectedSlot?.startTime !== reservation.startTime ||
            notes !== (reservation.notes || '') ||
            (isLounge && (
              parseInt(visitorCount) !== (reservation.visitorCount || 1) ||
              willUseGrill !== (reservation.willUseGrill || false)
            ))) && (
            <Card style={[styles.section, styles.changesSection]}>
              <View style={styles.sectionHeader}>
                <Icon name="track-changes" size={20} color={COLORS.warning} />
                <Text style={styles.sectionTitle}>
                  {language === 'es' ? 'Resumen de Cambios' : 'Summary of Changes'}
                </Text>
              </View>
              
              {selectedSlot?.startTime !== reservation.startTime && (
                <View style={styles.changeItem}>
                  <Text style={styles.changeLabel}>
                    {language === 'es' ? 'Horario:' : 'Time:'}
                  </Text>
                  <Text style={styles.changeOld}>
                    {DateUtils.formatTime(new Date(reservation.startTime))} - 
                    {DateUtils.formatTime(new Date(reservation.endTime))}
                  </Text>
                  <Icon name="arrow-forward" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.changeNew}>
                    {selectedSlot.label}
                  </Text>
                </View>
              )}
              
              {isLounge && parseInt(visitorCount) !== (reservation.visitorCount || 1) && (
                <View style={styles.changeItem}>
                  <Text style={styles.changeLabel}>
                    {language === 'es' ? 'Visitantes:' : 'Visitors:'}
                  </Text>
                  <Text style={styles.changeOld}>
                    {reservation.visitorCount || 1}
                  </Text>
                  <Icon name="arrow-forward" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.changeNew}>
                    {visitorCount}
                  </Text>
                </View>
              )}
              
              {isLounge && willUseGrill !== (reservation.willUseGrill || false) && (
                <View style={styles.changeItem}>
                  <Text style={styles.changeLabel}>
                    {language === 'es' ? 'Parrilla:' : 'Grill:'}
                  </Text>
                  <Text style={styles.changeOld}>
                    {reservation.willUseGrill 
                      ? (language === 'es' ? 'Sí' : 'Yes')
                      : (language === 'es' ? 'No' : 'No')}
                  </Text>
                  <Icon name="arrow-forward" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.changeNew}>
                    {willUseGrill 
                      ? (language === 'es' ? 'Sí' : 'Yes')
                      : (language === 'es' ? 'No' : 'No')}
                  </Text>
                </View>
              )}
              
              {notes !== (reservation.notes || '') && (
                <View style={styles.changeItem}>
                  <Text style={styles.changeLabel}>
                    {language === 'es' ? 'Notas actualizadas' : 'Notes updated'}
                  </Text>
                </View>
              )}
            </Card>
          )}
        </ScrollView>
        
        {/* Action Buttons */}
        <View style={styles.footer}>
          <Button
            title={language === 'es' ? 'Cancelar' : 'Cancel'}
            variant="outline"
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            title={language === 'es' ? 'Actualizar Reserva' : 'Update Reservation'}
            onPress={handleUpdateReservation}
            loading={loading}
            disabled={!selectedSlot || loading}
            style={styles.footerButton}
          />
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
          }}
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  amenityName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  amenityNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  dateButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.sm,
    borderRadius: 6,
    marginTop: SPACING.sm,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  slotButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    minWidth: '45%',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  selectedSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  currentSlot: {
    borderColor: COLORS.warning,
    borderWidth: 2,
  },
  slotTime: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedSlotText: {
    color: COLORS.white,
  },
  currentSlotLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    marginTop: SPACING.xs / 2,
  },
  noSlotsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    padding: SPACING.lg,
  },
  // Lounge-specific styles
  visitorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitorInput: {
    width: 80,
    textAlign: 'center',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  visitorNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  grillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  grillLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    flex: 1,
  },
  grillWarning: {
    flexDirection: 'row',
    alignItems: 'center',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  changesSection: {
    backgroundColor: COLORS.warning + '10',
    borderColor: COLORS.warning,
    borderWidth: 1,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: SPACING.xs,
  },
  changeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: SPACING.xs,
  },
  changeOld: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
  },
  changeNew: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: SPACING.xs,
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

export default EditReservationModal;