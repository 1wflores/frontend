import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ValidationUtils } from '../../utils/validationUtils';
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  const apartmentNumber = ValidationUtils.extractApartmentNumber(user.username);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="home" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.apartmentNumber}>Apartment {apartmentNumber}</Text>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.role}>
              {user.role === 'admin' ? '👑 Administrator' : '🏠 Resident'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Account Information */}
      <Card style={styles.infoCard}>
        <Text style={styles.cardTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <Icon name="person" size={20} color={COLORS.text.secondary} />
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user.username}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="security" size={20} color={COLORS.text.secondary} />
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>
            {user.role === 'admin' ? 'Administrator' : 'Resident'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="calendar-today" size={20} color={COLORS.text.secondary} />
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>
            {DateUtils.formatDate(user.createdAt)}
          </Text>
        </View>
        
        {user.lastLogin && (
          <View style={styles.infoRow}>
            <Icon name="access-time" size={20} color={COLORS.text.secondary} />
            <Text style={styles.infoLabel}>Last Login</Text>
            <Text style={styles.infoValue}>
              {DateUtils.formatDateTime(user.lastLogin)}
            </Text>
          </View>
        )}
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionRow}>
          <Icon name="event" size={24} color={COLORS.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Reservations</Text>
            <Text style={styles.actionSubtitle}>View and manage your bookings</Text>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionRow}>
          <Icon name="pool" size={24} color={COLORS.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Book Amenities</Text>
            <Text style={styles.actionSubtitle}>Reserve jacuzzi, lounge, and more</Text>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionRow}>
          <Icon name="help" size={24} color={COLORS.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Help & Support</Text>
            <Text style={styles.actionSubtitle}>Contact building administrator</Text>
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </Card>

      {/* App Information */}
      <Card style={styles.appInfoCard}>
        <Text style={styles.cardTitle}>App Information</Text>
        
        <View style={styles.appInfoRow}>
          <Text style={styles.appInfoLabel}>Version</Text>
          <Text style={styles.appInfoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.appInfoRow}>
          <Text style={styles.appInfoLabel}>Build</Text>
          <Text style={styles.appInfoValue}>100</Text>
        </View>
      </Card>

      {/* Security Notice */}
      <Card style={styles.noticeCard}>
        <View style={styles.noticeHeader}>
          <Icon name="info" size={20} color={COLORS.warning} />
          <Text style={styles.noticeTitle}>Password Changes</Text>
        </View>
        <Text style={styles.noticeText}>
          Password changes can only be made by your building administrator. 
          Please contact them if you need to update your password.
        </Text>
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Sign Out"
          variant="danger"
          onPress={handleLogout}
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileCard: {
    margin: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  apartmentNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  username: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  role: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  infoLabel: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  actionsCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  actionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  appInfoCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  appInfoLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  appInfoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  noticeCard: {
    margin: SPACING.md,
    marginTop: 0,
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  noticeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: SPACING.xs,
  },
  noticeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  logoutContainer: {
    margin: SPACING.md,
    marginTop: 0,
    marginBottom: SPACING.xl,
  },
});

export default ProfileScreen;