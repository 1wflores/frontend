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
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const UserManagementCard = ({
  user,
  onEdit,
  onActivate,
  onDeactivate,
  onViewReservations,
  disabled = false,
}) => {
  const { language, t } = useLanguage(); // ✅ ADDED: Language hook

  const apartmentNumber = ValidationUtils.extractApartmentNumber(user.username);

  const getRoleIcon = () => {
    return user.role === 'admin' ? 'admin-panel-settings' : 'person';
  };

  const getRoleColor = () => {
    return user.role === 'admin' ? COLORS.primary : COLORS.info;
  };

  // ✅ ADDED: Role text translation
  const getRoleText = () => {
    return user.role === 'admin' 
      ? t('administrator') || (language === 'es' ? 'Administrador' : 'Administrator')
      : t('resident') || (language === 'es' ? 'Residente' : 'Resident');
  };

  const getUserStatusIcon = () => {
    return user.isActive ? 'check-circle' : 'cancel';
  };

  const getUserStatusColor = () => {
    return user.isActive ? COLORS.success : COLORS.error;
  };

  // ✅ ADDED: Status text translation
  const getStatusText = () => {
    return user.isActive 
      ? t('active') || (language === 'es' ? 'Activo' : 'Active')
      : t('inactive') || (language === 'es' ? 'Inactivo' : 'Inactive');
  };

  // ✅ ADDED: Date formatting with language support
  const formatDate = (dateString) => {
    return DateUtils.formatDate(dateString, language);
  };

  const formatDateTime = (dateString) => {
    return DateUtils.formatDateTime(dateString, language);
  };

  const cardStyles = [styles.container];
  if (disabled) {
    cardStyles.push(styles.disabled);
  }

  return (
    <Card style={cardStyles}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={24} color={COLORS.primary} />
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.apartmentNumber}>
              {apartmentNumber}
            </Text>
            <Text style={styles.username}>
              {user.username}
            </Text>
            
            <View style={styles.roleContainer}>
              <Icon 
                name={getRoleIcon()} 
                size={16} 
                color={getRoleColor()} 
              />
              {/* ✅ FIXED: Role text translation */}
              <Text style={[styles.roleText, { color: getRoleColor() }]}>
                {getRoleText()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Icon 
            name={getUserStatusIcon()} 
            size={20} 
            color={getUserStatusColor()} 
          />
          {/* ✅ FIXED: Status text translation */}
          <Text style={[styles.statusText, { color: getUserStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.metadata}>
        <View style={styles.metadataRow}>
          <Icon name="calendar-today" size={16} color={COLORS.text.secondary} />
          {/* ✅ FIXED: Created label translation */}
          <Text style={styles.metadataLabel}>
            {t('createdOn') || (language === 'es' ? 'Creado:' : 'Created:')}
          </Text>
          <Text style={styles.metadataValue}>
            {formatDate(user.createdAt)}
          </Text>
        </View>

        {user.lastLoginAt && (
          <View style={styles.metadataRow}>
            <Icon name="login" size={16} color={COLORS.text.secondary} />
            {/* ✅ FIXED: Last login label translation */}
            <Text style={styles.metadataLabel}>
              {language === 'es' ? 'Último Acceso:' : 'Last Login:'}
            </Text>
            <Text style={styles.metadataValue}>
              {formatDateTime(user.lastLoginAt)}
            </Text>
          </View>
        )}

        <View style={styles.metadataRow}>
          <Icon name="update" size={16} color={COLORS.text.secondary} />
          {/* ✅ FIXED: Updated label translation */}
          <Text style={styles.metadataLabel}>
            {language === 'es' ? 'Actualizado:' : 'Updated:'}
          </Text>
          <Text style={styles.metadataValue}>
            {formatDateTime(user.updatedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onViewReservations && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onViewReservations}
            disabled={disabled}
          >
            <Icon name="event" size={16} color={COLORS.primary} />
            {/* ✅ FIXED: Reservations button translation */}
            <Text style={styles.actionText}>
              {t('reservations') || (language === 'es' ? 'Reservas' : 'Reservations')}
            </Text>
          </TouchableOpacity>
        )}

        {onEdit && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onEdit}
            disabled={disabled}
          >
            <Icon name="edit" size={16} color={COLORS.primary} />
            {/* ✅ FIXED: Edit button translation */}
            <Text style={styles.actionText}>
              {t('edit') || (language === 'es' ? 'Editar' : 'Edit')}
            </Text>
          </TouchableOpacity>
        )}

        {user.isActive && onDeactivate && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerAction]}
            onPress={onDeactivate}
            disabled={disabled}
          >
            <Icon name="block" size={16} color={COLORS.error} />
            {/* ✅ FIXED: Deactivate button translation */}
            <Text style={[styles.actionText, styles.dangerText]}>
              {t('deactivate') || (language === 'es' ? 'Desactivar' : 'Deactivate')}
            </Text>
          </TouchableOpacity>
        )}

        {!user.isActive && onActivate && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.successAction]}
            onPress={onActivate}
            disabled={disabled}
          >
            <Icon name="check-circle" size={16} color={COLORS.success} />
            {/* ✅ FIXED: Activate button translation */}
            <Text style={[styles.actionText, styles.successText]}>
              {t('activate') || (language === 'es' ? 'Activar' : 'Activate')}
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
  userDetails: {
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
    marginBottom: SPACING.xs / 2,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
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
  metadata: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  metadataLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  metadataValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.primary,
    fontWeight: '500',
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
    minWidth: 80,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  dangerAction: {
    backgroundColor: COLORS.error + '10',
  },
  dangerText: {
    color: COLORS.error,
  },
  successAction: {
    backgroundColor: COLORS.success + '10',
  },
  successText: {
    color: COLORS.success,
  },
});