import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../common/Card';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ NEW: Import language hook
import { Localization } from '../../utils/localization'; // ✅ NEW: Import localization
import { COLORS, SPACING, FONT_SIZES, AMENITY_ICONS } from '../../utils/constants';

export const AmenityCard = ({
  amenity,
  onPress,
  disabled = false,
}) => {
  const { language } = useLanguage(); // ✅ NEW: Get current language

  const getOperatingHoursText = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const operatingDaysEnglish = amenity.operatingHours.days.map(day => days[day]);
    
    // ✅ NEW: Translate day names to Spanish if needed
    const operatingDaysTranslated = operatingDaysEnglish.map(day => 
      Localization.translateData('days', day, language)
    );
    
    const operatingDaysText = operatingDaysTranslated.join(', ');
    return `${operatingDaysText} • ${amenity.operatingHours.start} - ${amenity.operatingHours.end}`;
  };

  // ✅ NEW: Translate amenity name
  const getTranslatedName = () => {
    return Localization.translateAmenity(amenity.name, language);
  };

  // ✅ NEW: Translate status text
  const getMaintenanceText = () => {
    return language === 'es' ? 'En Mantenimiento' : 'Under Maintenance';
  };

  const cardStyles = [styles.container];
  if (!amenity.isActive || disabled) {
    cardStyles.push(styles.disabled);
  }

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || !amenity.isActive}
      activeOpacity={0.7}
    >
      <Card style={cardStyles}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon 
              name={AMENITY_ICONS[amenity.type] || 'place'} 
              size={32} 
              color={amenity.isActive ? COLORS.primary : COLORS.text.secondary} 
            />
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.name}>{getTranslatedName()}</Text>
            <Text style={styles.capacity}>
              {language === 'es' ? 'Capacidad: ' : 'Capacity: '}
              {amenity.capacity} 
              {language === 'es' ? ' personas' : ' people'}
            </Text>
          </View>
          
          <View style={[
            styles.statusDot,
            { backgroundColor: amenity.isActive ? COLORS.success : COLORS.error }
          ]} />
        </View>

        {amenity.description && (
          <Text style={styles.description}>
            {/* ✅ NEW: Smart translate description (if it contains translatable terms) */}
            {Localization.smartTranslate(amenity.description, language)}
          </Text>
        )}

        <View style={styles.info}>
          <View style={styles.infoRow}>
            <Icon name="schedule" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>{getOperatingHoursText()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="timer" size={16} color={COLORS.text.secondary} />
            <Text style={styles.infoText}>
              {language === 'es' ? 'Máx ' : 'Max '}
              {amenity.autoApprovalRules.maxDurationMinutes}
              {language === 'es' ? ' min auto-aprobación' : ' min auto-approval'}
            </Text>
          </View>
          
          {amenity.specialRequirements?.requiresDeposit && (
            <View style={styles.infoRow}>
              <Icon name="account-balance-wallet" size={16} color={COLORS.warning} />
              <Text style={[styles.infoText, { color: COLORS.warning }]}>
                ${amenity.specialRequirements.depositAmount} 
                {language === 'es' ? ' depósito para parrilla' : ' deposit for grill'}
              </Text>
            </View>
          )}
        </View>

        {!amenity.isActive && (
          <View style={styles.maintenanceNotice}>
            <Icon name="build" size={16} color={COLORS.error} />
            <Text style={styles.maintenanceText}>{getMaintenanceText()}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  capacity: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  info: {
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  maintenanceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  maintenanceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});