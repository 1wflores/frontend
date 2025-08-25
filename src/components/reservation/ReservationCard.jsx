// src/components/reservation/ReservationCard.jsx - ENHANCED WITH PROPER CANCELLATION

import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useReservations } from '../../hooks/useReservations';
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const ReservationCard = ({ 
  reservation, 
  onPress, 
  showActions = true, 
  isAdmin = false 
}) => {
  const { t, language } = useLanguage();
  const { cancelReservation, loading } = useReservations();

  // ✅ ENHANCED: Better cancellation logic with proper deletion confirmation
  const handleCancelReservation = () => {
    // Check if reservation can be cancelled
    const cancellableStatuses = ['pending', 'approved', 'confirmed'];
    if (!cancellableStatuses.includes(reservation.status)) {
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? `No se puede cancelar una reserva con estado: ${reservation.status}`
          : `Cannot cancel reservation with status: ${reservation.status}`
      );
      return;
    }

    // Enhanced confirmation dialog
    Alert.alert(
      language === 'es' ? 'Confirmar Cancelación' : 'Confirm Cancellation',
      language === 'es' 
        ? '¿Está seguro de que desea cancelar esta reserva? Esta acción eliminará permanentemente la reserva y liberará el horario para otros usuarios.'
        : 'Are you sure you want to cancel this reservation? This action will permanently delete the reservation and free up the time slot for other users.',
      [
        { 
          text: language === 'es' ? 'No' : 'No', 
          style: 'cancel' 
        },
        {
          text: language === 'es' ? 'Sí, Cancelar' : 'Yes, Cancel',
          style: 'destructive',
          onPress: performCancellation,
        },
      ]
    );
  };

  const performCancellation = async () => {
    try {
      console.log(`🚫 Cancelling reservation ${reservation.id}`);
      
      const result = await cancelReservation(reservation.id);
      
      console.log('✅ Cancellation result:', result);

      // ✅ ENHANCED: Success message with slot availability confirmation
      Alert.alert(
        t('success') || 'Success',
        language === 'es'
          ? 'Reserva cancelada exitosamente. El horario ya está disponible para otros usuarios.'
          : 'Reservation cancelled successfully. The time slot is now available for other users.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('❌ Cancellation error:', error);
      
      // ✅ ENHANCED: Better error handling with specific messages
      let errorMessage = language === 'es' 
        ? 'Error al cancelar la reserva' 
        : 'Failed to cancel reservation';

      if (error.message.includes('Access denied')) {
        errorMessage = language === 'es'
          ? 'Solo puedes cancelar tus propias reservas'
          : 'You can only cancel your own reservations';
      } else if (error.message.includes('Cannot cancel')) {
        errorMessage = language === 'es'
          ? 'No se puede cancelar esta reserva'
          : 'This reservation cannot be cancelled';
      } else if (error.message.includes('not found')) {
        errorMessage = language === 'es'
          ? 'Reserva no encontrada'
          : 'Reservation not found';
      }

      Alert.alert(
        t('error') || 'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'approved':
        return COLORS.success;
      case 'denied':
        return COLORS.error;
      case 'cancelled':
        return COLORS.text.secondary;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return language === 'es' ? 'Pendiente' : 'Pending';
      case 'approved':
        return language === 'es' ? 'Aprobada' : 'Approved';
      case 'denied':
        return language === 'es' ? 'Denegada' : 'Denied';
      case 'cancelled':
        return language === 'es' ? 'Cancelada' : 'Cancelled';
      default:
        return status;
    }
  };

  const canCancel = () => {
    const cancellableStatuses = ['pending', 'approved', 'confirmed'];
    const isPastReservation = DateUtils.isPast(reservation.startTime);
    
    // Admins can cancel any cancellable reservation, users can only cancel future ones
    if (isAdmin) {
      return cancellableStatuses.includes(reservation.status);
    } else {
      return cancellableStatuses.includes(reservation.status) && !isPastReservation;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
        <Text style={styles.statusText}>{getStatusText(reservation.status)}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.amenityName}>
            {reservation.amenityName || reservation.amenity?.name || 'Unknown Amenity'}
          </Text>
          <Text style={styles.apartmentNumber}>
            {ValidationUtils.getApartmentFromReservation(reservation)}
          </Text>
        </View>

        <View style={styles.timeInfo}>
          <Icon name="access-time" size={16} color={COLORS.text.secondary} />
          <Text style={styles.timeText}>
            {DateUtils.formatDateTime(reservation.startTime, language)} - 
            {DateUtils.formatTime(reservation.endTime, language)}
          </Text>
        </View>

        {reservation.rejectionReason && (
          <View style={styles.rejectionReason}>
            <Icon name="info" size={16} color={COLORS.error} />
            <Text style={styles.rejectionText}>
              {reservation.rejectionReason}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {showActions && canCancel() && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelReservation}
          disabled={loading}
        >
          <Icon 
            name="cancel" 
            size={20} 
            color={COLORS.error} 
          />
          <Text style={styles.cancelText}>
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.text.inverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  content: {
    paddingRight: SPACING.xl * 2, // Space for status badge
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  amenityName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  apartmentNumber: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  rejectionReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background.error,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  rejectionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background.error,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export { ReservationCard };