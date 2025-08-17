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
  const apartmentNumber = ValidationUtils.extractApartmentNumber(reservation.apartmentId);
  
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
          <Text style={styles.amenityName}>{reservation.amenityId}</Text>
          <Text style={styles.reservationId}>ID: {reservation.id.slice(0, 8).toUpperCase()}</Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
            <Icon name={getStatusIcon()} size={16} color={COLORS.text.inverse} />
          </View>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {reservation.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.timeInfo}>
        <View style={styles.timeRow}>
          <Icon name="calendar-today" size={16} color={COLORS.text.secondary} />
          <Text style={styles.timeLabel}>Date:</Text>
          <Text style={styles.timeValue}>
            {DateUtils.formatDate(reservation.startTime)}
          </Text>
        </View>

        <View style={styles.timeRow}>
          <Icon name="access-time" size={16} color={COLORS.text.secondary} />
          <Text style={styles.timeLabel}>Time:</Text>
          <Text style={styles.timeValue}>
            {DateUtils.formatTime(reservation.startTime)} - {DateUtils.formatTime(reservation.endTime)}
          </Text>
        </View>

        <View style={styles.timeRow}>
          <Icon name="timer" size={16} color={COLORS.text.secondary} />
          <Text style={styles.timeLabel}>Duration:</Text>
          <Text style={styles.timeValue}>
            {DateUtils.getDurationText(reservation.startTime, reservation.endTime)}
          </Text>
        </View>
      </View>

      {(reservation.specialRequests?.visitorCount || 
        reservation.specialRequests?.grillUsage || 
        reservation.specialRequests?.notes) && (
        <View style={styles.specialRequests}>
          <Text style={styles.sectionTitle}>Special Requests:</Text>
          
          {reservation.specialRequests.visitorCount && (
            <View style={styles.requestRow}>
              <Icon name="group" size={14} color={COLORS.text.secondary} />
              <Text style={styles.requestText}>
                {reservation.specialRequests.visitorCount} visitors
              </Text>
            </View>
          )}

          {reservation.specialRequests.grillUsage && (
            <View style={styles.requestRow}>
              <Icon name="outdoor-grill" size={14} color={COLORS.text.secondary} />
              <Text style={styles.requestText}>Grill usage requested</Text>
            </View>
          )}

          {reservation.specialRequests.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{reservation.specialRequests.notes}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.metadata}>
        <View style={styles.metadataRow}>
          <Icon name="schedule" size={14} color={COLORS.text.secondary} />
          <Text style={styles.metadataText}>
            Submitted: {DateUtils.formatDateTime(reservation.submittedAt)}
          </Text>
        </View>

        {reservation.status === 'pending' && DateUtils.isFuture(reservation.startTime) && (
          <View style={styles.metadataRow}>
            <Icon name="priority-high" size={14} color={getPriorityColor()} />
            <Text style={[styles.metadataText, { color: getPriorityColor() }]}>
              Priority: {getPriorityLevel().toUpperCase()}
            </Text>
          </View>
        )}

        {reservation.depositRequired && (
          <View style={styles.metadataRow}>
            <Icon name="account-balance-wallet" size={14} color={COLORS.warning} />
            <Text style={[styles.metadataText, { color: COLORS.warning }]}>
              ${reservation.depositAmount} deposit required
            </Text>
          </View>
        )}
      </View>

      {reservation.denialReason && (
        <View style={styles.denialContainer}>
          <Text style={styles.denialLabel}>Denial Reason:</Text>
          <Text style={styles.denialReason}>{reservation.denialReason}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {onViewDetails && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onViewDetails}
            disabled={disabled}
          >
            <Icon name="visibility" size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>Details</Text>
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
    width: 60,
  },
  timeValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  specialRequests: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  requestText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  notesContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.xs,
    borderRadius: 6,
    marginTop: SPACING.xs / 2,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontStyle: 'italic',
  },
  metadata: {
    marginBottom: SPACING.sm,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  metadataText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  denialContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  denialLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: SPACING.xs / 2,
  },
  denialReason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    borderRadius: 6,
    backgroundColor: 'transparent',
    minWidth: 70,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  approveButton: {
    backgroundColor: '#F0FFF4',
  },
  approveText: {
    color: COLORS.success,
  },
  denyButton: {
    backgroundColor: '#FFF5F5',
  },
  denyText: {
    color: COLORS.error,
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
  },
  cancelText: {
    color: COLORS.error,
  },
});