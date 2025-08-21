import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ ADDED: Language support
import { Localization } from '../../utils/localization'; // ✅ ADDED: Data translation
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const TimeSlotPicker = ({
  visible,
  slots,
  onSelect,
  onClose,
  amenityName,
  date,
}) => {
  const { language, t } = useLanguage(); // ✅ ADDED: Language hook

  // ✅ ADDED: Translate amenity name
  const getTranslatedAmenityName = () => {
    return amenityName ? Localization.translateAmenity(amenityName, language) : amenityName;
  };

  // ✅ ADDED: Duration text translation
  const getDurationText = (minutes) => {
    return language === 'es' ? `${minutes} minutos` : `${minutes} minutes`;
  };

  const renderSlot = (slot, index) => (
    <TouchableOpacity
      key={index}
      style={componentStyles.slotButton}
      onPress={() => onSelect(slot)}
    >
      <View style={componentStyles.slotContent}>
        <Text style={componentStyles.slotTime}>
          {DateUtils.formatTime(slot.startTime)} - {DateUtils.formatTime(slot.endTime)}
        </Text>
        <Text style={componentStyles.slotDuration}>
          {getDurationText(slot.duration)}
        </Text>
      </View>
      
      {slot.autoApproval ? (
        <View style={componentStyles.approvalBadge}>
          <Icon name="check-circle" size={16} color={COLORS.success} />
          {/* ✅ FIXED: Auto-approved text translation */}
          <Text style={componentStyles.approvalText}>
            {t('autoApproved') || (language === 'es' ? 'Auto-aprobado' : 'Auto-approved')}
          </Text>
        </View>
      ) : (
        <View style={componentStyles.pendingBadge}>
          <Icon name="schedule" size={16} color={COLORS.warning} />
          {/* ✅ FIXED: Needs approval text translation */}
          <Text style={componentStyles.pendingText}>
            {t('needsApproval') || (language === 'es' ? 'Requiere aprobación' : 'Needs approval')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={componentStyles.overlay}>
        <View style={componentStyles.container}>
          <View style={componentStyles.header}>
            <View>
              {/* ✅ FIXED: Title translation */}
              <Text style={componentStyles.title}>
                {t('selectTimeSlot') || (language === 'es' ? 'Seleccionar Horario' : 'Select Time Slot')}
              </Text>
              {amenityName && (
                <Text style={componentStyles.subtitle}>
                  {getTranslatedAmenityName()}
                </Text>
              )}
              {date && (
                <Text style={componentStyles.subtitle}>
                  {DateUtils.formatDate(date, language)}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={componentStyles.closeButton}>
              <Icon name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={componentStyles.slotsContainer} showsVerticalScrollIndicator={false}>
            {slots.length > 0 ? (
              slots.map(renderSlot)
            ) : (
              <View style={componentStyles.emptyState}>
                <Icon name="event-busy" size={48} color={COLORS.text.secondary} />
                {/* ✅ FIXED: Empty state text translation */}
                <Text style={componentStyles.emptyText}>
                  {t('noAvailableSlots') || (language === 'es' ? 'No hay horarios disponibles' : 'No available time slots')}
                </Text>
                <Text style={componentStyles.emptySubtext}>
                  {t('tryDifferentDate') || (language === 'es' ? 'Intenta con una fecha diferente' : 'Please try a different date')}
                </Text>
              </View>
            )}
          </ScrollView>
          
          <View style={componentStyles.footer}>
            <Button
              title={t('cancel') || (language === 'es' ? 'Cancelar' : 'Cancel')}
              variant="outline"
              onPress={onClose}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const componentStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  slotsContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  slotButton: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotContent: {
    flex: 1,
  },
  slotTime: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  slotDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 16,
  },
  approvalText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF0',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 16,
  },
  pendingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
});