import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { Localization } from '../../utils/localization';
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES, STATUS_COLORS } from '../../utils/constants';

export const ReservationCard = ({
  reservation,
  onViewDetails,
  onCancel,
  showActions = true,
}) => {
  const { language, t } = useLanguage();

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || COLORS.text.secondary;
  };

  const getStatusIcon = (status) => {
    switch (status) {
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

  // ✅ FIXED: Using proper translation function
  const getStatusMessage = (status) => {
    const statusMap = {
      pending: 'waitingForApproval',
      approved: 'confirmed',
      denied: 'notApproved',
      cancelled: 'cancelled',
      completed: 'completed',
    };
    
    return t(statusMap[status]) || Localization.translateStatus(status, language);
  };

  const canCancel = ['pending', 'approved'].includes(reservation.status) && 
    DateUtils.isFuture(reservation.startTime);

  // ✅ FIXED: Translate amenity name properly
  const getTranslatedAmenityName = () => {
    return Localization.translateAmenity(reservation.amenityName || reservation.amenity?.name, language);
  };

  // ✅ FIXED: Format visitor count with proper translation
  const getVisitorText = () => {
    const count = reservation.specialRequests?.visitorCount || 0;
    if (count === 0) return null;
    
    const visitorWord = count === 1 ? t('visitor') : t('visitors');
    return `${count} ${visitorWord}`;
  };

  // ✅ FIXED: Format special requirements with translations
  const getSpecialRequirementsText = () => {
    const requirements = [];
    
    if (reservation.specialRequirements?.grillUsage) {
      requirements.push(t('grillUsage'));
    }
    
    if (reservation.specialRequirements?.requiresDeposit) {
      requirements.push(t('depositRequired'));
    }
    
    return requirements.length > 0 ? requirements.join(' • ') : null;
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Icon 
            name={getStatusIcon(reservation.status)} 
            size={20} 
            color={getStatusColor(reservation.status)} 
          />
          <Text style={[styles.status, { color: getStatusColor(reservation.status) }]}>
            {getStatusMessage(reservation.status)}
          </Text>
        </View>
        
        {reservation.specialRequirements?.requiresDeposit && (
          <View style={styles.depositBadge}>
            {/* ✅ FIXED: Using proper translation */}
            <Text style={styles.depositText}>
              {t('depositRequired').toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* ✅ FIXED: Translate amenity name */}
        <Text style={styles.amenityName}>
          {getTranslatedAmenityName()}
        </Text>
        
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeRow}>
            <Icon name="event" size={16} color={COLORS.text.secondary} />
            <Text style={styles.dateTime}>
              {DateUtils.formatDate(reservation.date || reservation.startTime, language)}
            </Text>
          </View>
          
          <View style={styles.dateTimeRow}>
            <Icon name="schedule" size={16} color={COLORS.text.secondary} />
            <Text style={styles.dateTime}>
              {DateUtils.formatTime(reservation.startTime)} - {DateUtils.formatTime(reservation.endTime)}
            </Text>
          </View>
        </View>

        {/* ✅ FIXED: Visitor count with proper translation */}
        {getVisitorText() && (
          <View style={styles.detailRow}>
            <Icon name="people" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>{getVisitorText()}</Text>
          </View>
        )}

        {/* ✅ FIXED: Special requirements with translations */}
        {getSpecialRequirementsText() && (
          <View style={styles.detailRow}>
            <Icon name="info" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>{getSpecialRequirementsText()}</Text>
          </View>
        )}

        {/* Notes */}
        {reservation.specialRequests?.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>{t('specialNotes')}:</Text>
            <Text style={styles.notesText}>{reservation.specialRequests.notes}</Text>
          </View>
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          {onViewDetails && (
            <Button
              title={t('viewDetails')}
              variant="outline"
              size="small"
              onPress={() => onViewDetails(reservation)}
              style={styles.actionButton}
            />
          )}
          
          {canCancel && onCancel && (
            <Button
              title={t('cancel')}
              variant="outline"
              size="small"
              onPress={() => onCancel(reservation)}
              style={[styles.actionButton, styles.cancelButton]}
            />
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  depositBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 4,
  },
  depositText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    marginBottom: SPACING.sm,
  },
  amenityName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  dateTimeContainer: {
    marginBottom: SPACING.sm,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  dateTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  notesContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
  },
  notesLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: COLORS.error,
  },
});