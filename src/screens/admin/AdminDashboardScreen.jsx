import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { Localization } from '../../utils/localization';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const AdminDashboardScreen = ({ navigation }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingReservations: 0,
    activeReservations: 0,
    availableAmenities: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate loading stats - replace with actual API calls
      setStats({
        totalUsers: 24,
        pendingReservations: 3,
        activeReservations: 8,
        availableAmenities: 4,
      });

      // ✅ FIXED: Recent activity with proper translations
      setRecentActivity([
        {
          id: 1,
          type: 'user_created',
          message: language === 'es' 
            ? 'Usuario creado para Apartamento 205'
            : 'User created for Apartment 205',
          time: language === 'es' ? 'hace 2h' : '2h ago',
          icon: 'person_add',
          color: COLORS.primary,
        },
        {
          id: 2,
          type: 'reservation_approved',
          // ✅ FIXED: Use data translation for amenity names
          message: language === 'es' 
            ? `Reserva aprobada para ${Localization.translateAmenity('Jacuzzi', language)}`
            : 'Reservation approved for Jacuzzi',
          time: language === 'es' ? 'hace 4h' : '4h ago',
          icon: 'event',
          color: COLORS.success,
        },
        {
          id: 3,
          type: 'maintenance_scheduled',
          message: language === 'es' 
            ? `Mantenimiento de ${Localization.translateAmenity('Yoga Deck', language)} programado`
            : 'Yoga Deck maintenance scheduled',
          time: language === 'es' ? 'hace 1d' : '1d ago',
          icon: 'build',
          color: COLORS.warning,
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // ✅ FIXED: Navigation handlers with proper functionality
  const handleNavigateToUsers = () => {
    navigation.navigate('Users');
  };

  const handleNavigateToReservations = () => {
    navigation.navigate('Reservations');
  };

  const handleNavigateToAmenities = () => {
    navigation.navigate('Amenities');
  };

  const handleCreateUser = () => {
    navigation.navigate('Users');
  };

  const handleViewPending = () => {
    navigation.navigate('Reservations');
  };

  const handleMaintenanceMode = () => {
    navigation.navigate('Amenities');
  };

  // ✅ FIXED: Admin actions with proper translations
  const adminActions = [
    {
      id: 'users',
      title: t('userManagement'),
      subtitle: language === 'es' 
        ? 'Crear y gestionar usuarios de apartamentos'
        : 'Create and manage apartment users',
      icon: 'people',
      color: COLORS.primary,
      onPress: handleNavigateToUsers,
    },
    {
      id: 'reservations',
      title: t('reservationManagement'),
      subtitle: language === 'es' 
        ? 'Revisar y aprobar reservas'
        : 'Review and approve bookings',
      icon: 'event',
      color: COLORS.success,
      onPress: handleNavigateToReservations,
    },
    {
      id: 'amenities',
      title: t('amenityManagement'),
      subtitle: language === 'es' 
        ? 'Configurar y mantener amenidades'
        : 'Configure and maintain amenities',
      icon: 'place',
      color: COLORS.warning,
      onPress: handleNavigateToAmenities,
    },
  ];

  // ✅ FIXED: Get proper greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <View style={styles.welcomeHeader}>
          <Icon name="admin_panel_settings" size={32} color={COLORS.primary} />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>
              {getGreeting()}, {user?.name || 'Admin'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {t('manageBuilding')}
            </Text>
          </View>
        </View>
      </Card>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="people" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>{t('totalUsers')}</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="schedule" size={24} color={COLORS.warning} />
          <Text style={styles.statValue}>{stats.pendingReservations}</Text>
          <Text style={styles.statLabel}>{t('pendingApprovals')}</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="event" size={24} color={COLORS.success} />
          <Text style={styles.statValue}>{stats.activeReservations}</Text>
          <Text style={styles.statLabel}>{t('activeBookings')}</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="place" size={24} color={COLORS.info} />
          <Text style={styles.statValue}>{stats.availableAmenities}</Text>
          <Text style={styles.statLabel}>{t('availableAmenities')}</Text>
        </View>
      </View>

      {/* Pending Approvals Alert */}
      {stats.pendingReservations > 0 && (
        <TouchableOpacity onPress={handleViewPending}>
          <Card style={styles.alertCard}>
            <View style={styles.alertContent}>
              <Icon name="notification_important" size={24} color={COLORS.warning} />
              <View style={styles.alertText}>
                {/* ✅ FIXED: Proper pluralization and translation */}
                <Text style={styles.alertTitle}>
                  {stats.pendingReservations} {stats.pendingReservations === 1 
                    ? (language === 'es' ? 'Reserva Necesita' : 'Reservation Needs')
                    : (language === 'es' ? 'Reservas Necesitan' : 'Reservations Need')
                  } {t('pendingApproval').replace('Aprobación Pendiente', 'Aprobación').replace('Pending Approval', 'Approval')}
                </Text>
                <Text style={styles.alertSubtitle}>
                  {language === 'es' ? 'Toque para revisar solicitudes pendientes' : 'Tap to review pending requests'}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
            </View>
          </Card>
        </TouchableOpacity>
      )}

      {/* Admin Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>
          {language === 'es' ? 'Herramientas de Administrador' : 'Admin Tools'}
        </Text>
        
        {adminActions.map((action) => (
          <TouchableOpacity key={action.id} onPress={action.onPress}>
            <Card style={styles.actionCard}>
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Icon name={action.icon} size={24} color={action.color} />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.text.secondary} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
        
        <Card style={styles.activityCard}>
          {recentActivity.map((activity, index) => (
            <View key={activity.id} style={[
              styles.activityItem,
              index !== recentActivity.length - 1 && styles.activityItemBorder
            ]}>
              <Icon name={activity.icon} size={20} color={activity.color} />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityText}>{activity.message}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        
        <View style={styles.quickActions}>
          <Button
            title={t('createUser')}
            variant="outline"
            size="small"
            onPress={handleCreateUser}
            style={styles.quickActionButton}
          />
          
          <Button
            title={t('viewPending')}
            variant="outline"
            size="small"
            onPress={handleViewPending}
            style={styles.quickActionButton}
          />
          
          <Button
            title={t('maintenance')}
            variant="outline"
            size="small"
            onPress={handleMaintenanceMode}
            style={styles.quickActionButton}
          />
        </View>
      </View>

      {/* Admin Restrictions Notice */}
      <Card style={styles.noticeCard}>
        <View style={styles.noticeHeader}>
          <Icon name="info" size={20} color={COLORS.primary} />
          <Text style={styles.noticeTitle}>
            {t('adminRestrictions')}
          </Text>
        </View>
        <Text style={styles.noticeText}>
          {t('adminRestrictionsNote')}
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeCard: {
    margin: SPACING.md,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: SPACING.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginHorizontal: '1%',
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
    textAlign: 'center',
  },
  alertCard: {
    margin: SPACING.md,
    backgroundColor: `${COLORS.warning}10`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  alertTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  alertSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
  actionsContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  actionCard: {
    marginBottom: SPACING.sm,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
  activityContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  activityCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  activityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
  quickActionsContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
  },
  noticeCard: {
    margin: SPACING.md,
    backgroundColor: `${COLORS.primary}10`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  noticeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  noticeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});