import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../common/Card';
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES, STATUS_COLORS } from '../../utils/constants';

export const ReservationManagementCard = ({
  reservation,
  onApprove,
  onDeny,
  onViewDetails,
  onCancel,
  disabled = false,
}) => {
  // FIX: Use the correct field 'username' that comes from backend enrichment
  const apartmentNumber = ValidationUtils.extractApartmentNumber(reservation.username);
  
  const getStatusColor = () => {
    return STATUS_COLORS[reservation.status] || COLORS.text.secondary;
  };

  const getStatusIcon = () => {
    switch (reservation.status) {
      case 'approved':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'denied':
        return 'cancel';
      case 'cancelled':
        return 'block';
      case 'completed':
        return 'done-all';
      default:
        return 'help';
    }
  };

  const getPriorityLevel = () => {
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    const hoursUntil = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil < 24) return 'high';
    if (hoursUntil < 72) return 'medium';
    return 'low';
  };

  const getPriorityColor = () => {
    const priority = getPriorityLevel();
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      default: return COLORS.text.secondary;
    }
  };

  const showActionButtons = reservation.status === 'pending' && (onApprove || onDeny);

  const cardStyles = [styles.container];
  if (disabled) {
    cardStyles.push(styles.disabled);
  }

  return (
    <Card style={cardStyles}>
      <View style={styles.header}>
        <View style={styles.reservationInfo}>
          <Text style={styles.apartmentNumber}>Apartment {apartmentNumber}</Text>
          {/* FIX: Use amenityName field that already exists from backend */}
          <Text style={styles.amenityName}>{reservation.amenityName}</Text>
          <Text style={styles.reservationId}>ID: {reservation.id.slice(0, 8).toUpperCase()}</Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
            <Icon name={getStatusIcon()} size={16} color="#fff" />
          </View>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {reservation.status.toUpperCase()}
          </Text>
          {reservation.status === 'pending' && (
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
          )}
        </View>
      </View>

      <View style={styles.timeInfo}>
        <View style={styles.timeRow}>
          <Icon name="calendar-today" size={14} color={COLORS.text.secondary} />
          <Text style={styles.timeLabel}>Date:</Text>
          <Text style={styles.timeValue}>
            {DateUtils.formatDate(reservation.startTime)}
          </Text>
        </View>

        <View style={styles.timeRow}>
          <Icon name="access-time" size={14} color={COLORS.text.secondary} />
          <Text style={styles.timeLabel}>Time:</Text>
          <Text style={styles.timeValue}>
            {DateUtils.formatTime(reservation.startTime)} - {DateUtils.formatTime(reservation.endTime)}
          </Text>
        </View>

        <View style={styles.timeRow}>
          <Icon name="timer" size={14} color={COLORS.text.secondary} />
          <Text style={styles.timeLabel}>Duration:</Text>
          <Text style={styles.timeValue}>
            {DateUtils.getDurationText(reservation.startTime, reservation.endTime)}
          </Text>
        </View>
      </View>

      {reservation.specialRequests && Object.keys(reservation.specialRequests).length > 0 && (
        <View style={styles.specialRequests}>
          <Text style={styles.specialRequestsTitle}>Special Requests:</Text>
          {reservation.specialRequests.visitorCount && (
            <Text style={styles.specialRequestItem}>
              <Icon name="group" size={12} color={COLORS.text.secondary} /> {reservation.specialRequests.visitorCount} visitors
            </Text>
          )}
          {reservation.specialRequests.grillUsage && (
            <Text style={styles.specialRequestItem}>
              <Icon name="outdoor-grill" size={12} color={COLORS.text.secondary} /> Grill usage requested
            </Text>
          )}
          {reservation.submittedAt && (
            <Text style={styles.submittedInfo}>
              Submitted: {DateUtils.formatRelativeTime(reservation.submittedAt)}
            </Text>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {onViewDetails && (
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={onViewDetails}
            disabled={disabled}
          >
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>
        )}

        {showActionButtons && (
          <>
            {onApprove && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={onApprove}
                disabled={disabled}
              >
                <Icon name="check" size={16} color={COLORS.success} />
                <Text style={[styles.actionText, styles.approveText]}>Approve</Text>
              </TouchableOpacity>
            )}

            {onDeny && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.denyButton]}
                onPress={onDeny}
                disabled={disabled}
              >
                <Icon name="close" size={16} color={COLORS.error} />
                <Text style={[styles.actionText, styles.denyText]}>Deny</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {reservation.status === 'approved' && DateUtils.isFuture(reservation.startTime) && onCancel && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={onCancel}
            disabled={disabled}
          >
            <Icon name="cancel" size={16} color={COLORS.error} />
            <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  reservationInfo: {
    flex: 1,
  },
  apartmentNumber: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  amenityName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  reservationId: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
  statusBadge: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: SPACING.xs / 2,
  },
  timeInfo: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  timeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
  },
  timeValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  specialRequests: {
    backgroundColor: COLORS.warning + '10',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  specialRequestsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  specialRequestItem: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  submittedInfo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.xs,
  },
  detailsButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  detailsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
    borderWidth: 1,
    gap: SPACING.xs / 2,
  },
  approveButton: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  denyButton: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  cancelButton: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  approveText: {
    color: COLORS.success,
  },
  denyText: {
    color: COLORS.error,
  },
  cancelText: {
    color: COLORS.error,
  },
});