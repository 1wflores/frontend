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
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ NEW: Import language hook
import { Localization } from '../../utils/localization'; // ✅ NEW: Import localization
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES, STATUS_COLORS } from '../../utils/constants';

export const ReservationCard = ({
  reservation,
  onViewDetails,
  onCancel,
  showActions = true,
}) => {
  const { language } = useLanguage(); // ✅ NEW: Get current language

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

  // ✅ NEW: Get translated status messages
  const getStatusMessage = (status) => {
    const statusMessages = {
      en: {
        pending: 'Waiting for approval',
        approved: 'Confirmed',
        denied: 'Not approved',
        cancelled: 'Cancelled',
        completed: 'Completed',
      },
      es: {
        pending: 'Esperando aprobación',
        approved: 'Confirmado',
        denied: 'No aprobado',
        cancelled: 'Cancelado',
        completed: 'Completado',
      }
    };

    return statusMessages[language]?.[status] || statusMessages.en[status] || status;
  };

  const canCancel = ['pending', 'approved'].includes(reservation.status) && 
    DateUtils.isFuture(reservation.startTime);

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
            <Text style={styles.depositText}>
              {language === 'es' ? 'DEPÓSITO REQUERIDO' : 'DEPOSIT REQUIRED'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* ✅ ENHANCED: Translate amenity name and use fallback */}
        <Text style={styles.amenityName}>
          {language === 'es' ? 'Amenidad: ' : 'Amenity: '}
          {Localization.translateAmenity(reservation.amenityName || reservation.amenityId, language)}
        </Text>
        
        <View style={styles.timeContainer}>
          <Icon name="schedule" size={16} color={COLORS.text.secondary} />
          <Text style={styles.timeText}>
            {DateUtils.formatDate(reservation.startTime)}
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Icon name="access-time" size={16} color={COLORS.text.secondary} />
          <Text style={styles.timeText}>
            {DateUtils.formatTime(reservation.startTime)} - {DateUtils.formatTime(reservation.endTime)}
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Icon name="timer" size={16} color={COLORS.text.secondary} />
          <Text style={styles.timeText}>
            {DateUtils.getDurationText(reservation.startTime, reservation.endTime)}
          </Text>
        </View>

        {reservation.specialRequests?.visitorCount && (
          <View style={styles.detailRow}>
            <Icon name="group" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {reservation.specialRequests.visitorCount} 
              {language === 'es' ? ' visitantes' : ' visitors'}
            </Text>
          </View>
        )}

        {reservation.specialRequests?.grillUsage && (
          <View style={styles.detailRow}>
            <Icon name="outdoor-grill" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {language === 'es' ? 'Uso de parrilla solicitado' : 'Grill usage requested'}
            </Text>
          </View>
        )}

        {reservation.specialRequests?.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>
              {language === 'es' ? 'Notas:' : 'Notes:'}
            </Text>
            <Text style={styles.notesText}>{reservation.specialRequests.notes}</Text>
          </View>
        )}

        {reservation.denialReason && (
          <View style={styles.denialContainer}>
            <Text style={styles.denialLabel}>
              {language === 'es' ? 'Razón de denegación:' : 'Reason for denial:'}
            </Text>
            <Text style={styles.denialReason}>{reservation.denialReason}</Text>
          </View>
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          {onViewDetails && (
            <Button
              title={language === 'es' ? 'Detalles' : 'Details'}
              variant="outline"
              size="small"
              onPress={onViewDetails}
              style={styles.actionButton}
            />
          )}
          
          {canCancel && onCancel && (
            <Button
              title={language === 'es' ? 'Cancelar' : 'Cancel'}
              variant="danger"
              size="small"
              onPress={onCancel}
              style={styles.actionButton}
            />
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
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
    fontSize: FONT_SIZES.xs,
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
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text.inverse,
  },
  content: {
    marginBottom: SPACING.md,
  },
  amenityName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  notesContainer: {
    marginTop: SPACING.xs,
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
  denialContainer: {
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
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
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: SPACING.xs,
    minWidth: 80,
  },
});