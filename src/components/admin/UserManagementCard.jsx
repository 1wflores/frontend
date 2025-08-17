import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const UserManagementCard = ({
  user,
  onEdit,
  onDeactivate,
  onActivate,
  onViewReservations,
  disabled = false,
}) => {
  const apartmentNumber = ValidationUtils.extractApartmentNumber(user.username);
  
  const getUserStatusColor = () => {
    return user.isActive ? COLORS.success : COLORS.error;
  };

  const getUserStatusIcon = () => {
    return user.isActive ? 'check-circle' : 'cancel';
  };

  const getRoleIcon = () => {
    return user.role === 'admin' ? 'admin-panel-settings' : 'home';
  };

  const getRoleColor = () => {
    return user.role === 'admin' ? COLORS.primary : COLORS.secondary;
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
            <Icon 
              name={getRoleIcon()} 
              size={24} 
              color={getRoleColor()} 
            />
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.apartmentNumber}>
              {user.role === 'admin' ? 'Administrator' : `Apartment ${apartmentNumber}`}
            </Text>
            <Text style={styles.username}>{user.username}</Text>
            <View style={styles.roleContainer}>
              <Icon 
                name={user.role === 'admin' ? 'star' : 'person'} 
                size={14} 
                color={getRoleColor()} 
              />
              <Text style={[styles.roleText, { color: getRoleColor() }]}>
                {user.role === 'admin' ? 'Administrator' : 'Resident'}
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
          <Text style={[styles.statusText, { color: getUserStatusColor() }]}>
            {user.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.metadata}>
        <View style={styles.metadataRow}>
          <Icon name="calendar-today" size={16} color={COLORS.text.secondary} />
          <Text style={styles.metadataLabel}>Created:</Text>
          <Text style={styles.metadataValue}>
            {DateUtils.formatDate(user.createdAt)}
          </Text>
        </View>

        {user.lastLogin && (
          <View style={styles.metadataRow}>
            <Icon name="login" size={16} color={COLORS.text.secondary} />
            <Text style={styles.metadataLabel}>Last Login:</Text>
            <Text style={styles.metadataValue}>
              {DateUtils.formatDateTime(user.lastLogin)}
            </Text>
          </View>
        )}

        <View style={styles.metadataRow}>
          <Icon name="update" size={16} color={COLORS.text.secondary} />
          <Text style={styles.metadataLabel}>Updated:</Text>
          <Text style={styles.metadataValue}>
            {DateUtils.formatDateTime(user.updatedAt)}
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
            <Text style={styles.actionText}>Reservations</Text>
          </TouchableOpacity>
        )}

        {onEdit && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onEdit}
            disabled={disabled}
          >
            <Icon name="edit" size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        )}

        {user.isActive && onDeactivate && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerAction]}
            onPress={onDeactivate}
            disabled={disabled}
          >
            <Icon name="block" size={16} color={COLORS.error} />
            <Text style={[styles.actionText, styles.dangerText]}>Deactivate</Text>
          </TouchableOpacity>
        )}

        {!user.isActive && onActivate && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.successAction]}
            onPress={onActivate}
            disabled={disabled}
          >
            <Icon name="check-circle" size={16} color={COLORS.success} />
            <Text style={[styles.actionText, styles.successText]}>Activate</Text>
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
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  dangerAction: {
    backgroundColor: '#FFF5F5',
  },
  dangerText: {
    color: COLORS.error,
  },
  successAction: {
    backgroundColor: '#F0FFF4',
  },
  successText: {
    color: COLORS.success,
  },
});