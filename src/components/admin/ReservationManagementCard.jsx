import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../common/Card';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ ADDED: Language support
import { Localization } from '../../utils/localization'; // ✅ ADDED: Data translation
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
  const { language, t } = useLanguage(); // ✅ ADDED: Language hook

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

  // ✅ ADDED: Status translation
  const getStatusText = () => {
    const statusMap = {
      pending: 'waitingForApproval',
      approved: 'confirmed',
      denied: 'notApproved',
      cancelled: 'cancelled',
      completed: 'completed',
    };
    
    return t(statusMap[reservation.status]) || Localization.translateStatus(reservation.status, language);
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

  // ✅ ADDED: Translate amenity name
  const getTranslatedAmenityName = () => {
    return Localization.translateAmenity(reservation.amenityName || reservation.amenity?.name, language);
  };

  const showActionButtons = reservation.status === 'pending' && (onApprove || onDeny);

  const cardStyles = [styles.container];
  if (disabled) {
    cardStyles.push(styles.disabled);
  }

  return (
    <Card style={cardStyles}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Icon name="home" size={24} color={COLORS.primary} />
          </View>
          
          <View style={styles.details}>
            <Text style={styles.apartmentNumber}>
              {apartmentNumber}
            </Text>
            <Text style={styles.username}>
              {reservation.username}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Icon 
            name={getStatusIcon()} 
            size={16} 
            color={getStatusColor()} 
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.reservationInfo}>
        {/* ✅ FIXED: Translate amenity name */}
        <Text style={styles.amenityName}>
          {getTranslatedAmenityName()}
        </Text>
        
        <View style={styles.timeInfo}>
          <View style={styles.timeRow}>
            <Icon name="event" size={16} color={COLORS.text.secondary} />
            {/* ✅ FIXED: Date formatting with language */}
            <Text style={styles.timeLabel}>{t('date')}:</Text>
            <Text style={styles.timeValue}>
              {DateUtils.formatDate(reservation.date || reservation.startTime, language)}
            </Text>
          </View>
          
          <View style={styles.timeRow}>
            <Icon name="schedule" size={16} color={COLORS.text.secondary} />
            {/* ✅ FIXED: Time label translation */}
            <Text style={styles.timeLabel}>{t('time')}:</Text>
            <Text style={styles.timeValue}>
              {DateUtils.formatTime(reservation.startTime)} - {DateUtils.formatTime(reservation.endTime)}
            </Text>
          </View>
        </View>

        {/* Special requests */}
        {(reservation.specialRequests?.visitorCount > 0 || 
          reservation.specialRequests?.notes ||
          reservation.specialRequirements?.grillUsage) && (
          <View style={styles.specialRequests}>
            {/* ✅ FIXED: Special requests title translation */}
            <Text style={styles.specialRequestsTitle}>
              {t('specialRequests')}:
            </Text>
            
            {reservation.specialRequests?.visitorCount > 0 && (
              <Text style={styles.specialRequestItem}>
                • {reservation.specialRequests.visitorCount} {
                  reservation.specialRequests.visitorCount === 1 ? t('visitor') : t('visitors')
                }
              </Text>
            )}
            
            {reservation.specialRequirements?.grillUsage && (
              <Text style={styles.specialRequestItem}>
                • {t('grillUsage')}
              </Text>
            )}
            
            {reservation.specialRequests?.notes && (
              <Text style={styles.specialRequestItem}>
                • {reservation.specialRequests.notes}
              </Text>
            )}
          </View>
        )}

        {/* ✅ FIXED: Submitted info translation */}
        <Text style={styles.submittedInfo}>
          {t('submittedOn')} {DateUtils.formatDateTime(reservation.createdAt, language)}
        </Text>
      </View>

      <View style={styles.actions}>
        {onViewDetails && (
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => onViewDetails(reservation)}
            disabled={disabled}
          >
            {/* ✅ FIXED: Details button translation */}
            <Text style={styles.detailsText}>{t('viewDetails')}</Text>
          </TouchableOpacity>
        )}

        {showActionButtons && (
          <>
            {onApprove && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => onApprove(reservation)}
                disabled={disabled}
              >
                <Icon name="check" size={16} color={COLORS.success} />
                {/* ✅ FIXED: Approve button translation */}
                <Text style={[styles.actionText, styles.approveText]}>
                  {t('approve')}
                </Text>
              </TouchableOpacity>
            )}

            {onDeny && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.denyButton]}
                onPress={() => onDeny(reservation)}
                disabled={disabled}
              >
                <Icon name="close" size={16} color={COLORS.error} />
                {/* ✅ FIXED: Deny button translation */}
                <Text style={[styles.actionText, styles.denyText]}>
                  {t('deny')}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {reservation.status === 'approved' && onCancel && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancel(reservation)}
            disabled={disabled}
          >
            <Icon name="cancel" size={16} color={COLORS.error} />
            {/* ✅ FIXED: Cancel button translation */}
            <Text style={[styles.actionText, styles.cancelText]}>
              {t('cancel')}
            </Text>
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
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  details: {
    flex: 1,
  },
  apartmentNumber: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  username: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  reservationInfo: {
    marginBottom: SPACING.md,
  },
  amenityName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
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