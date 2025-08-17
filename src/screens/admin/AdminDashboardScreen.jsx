import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { reservationService } from '../../services/reservationService';
import { useAmenities } from '../../hooks/useAmenities';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const { t, language } = useLanguage();
  const { amenities } = useAmenities();
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
      // Load reservations data
      const reservationsData = await reservationService.getAllReservations();
      const reservations = reservationsData.reservations || [];
      
      // Calculate stats
      const pendingCount = reservations.filter(r => r.status === 'pending').length;
      const activeCount = reservations.filter(r => 
        r.status === 'approved' && new Date(r.startTime) > new Date()
      ).length;
      const availableAmenities = amenities.filter(a => a.isActive).length;

      setStats({
        totalUsers: 40, // Mock data - would come from user service
        pendingReservations: pendingCount,
        activeReservations: activeCount,
        availableAmenities,
      });

      // Set recent activity (mock data for now)
      setRecentActivity([
        {
          id: 1,
          type: 'user_created',
          message: language === 'es' 
            ? 'Nuevo usuario apartment205 creado'
            : 'New user apartment205 created',
          time: language === 'es' ? 'hace 2h' : '2h ago',
          icon: 'person-add',
          color: COLORS.primary,
        },
        {
          id: 2,
          type: 'reservation_approved',
          message: language === 'es' 
            ? 'Reserva aprobada para Jacuzzi'
            : 'Reservation approved for Jacuzzi',
          time: language === 'es' ? 'hace 4h' : '4h ago',
          icon: 'event',
          color: COLORS.success,
        },
        {
          id: 3,
          type: 'maintenance_scheduled',
          message: language === 'es' 
            ? 'Mantenimiento de Yoga Deck programado'
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

  // Functional navigation handlers
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
        ? 'Gestionar instalaciones y mantenimiento'
        : 'Manage facilities and maintenance',
      icon: 'pool',
      color: COLORS.warning,
      onPress: handleNavigateToAmenities,
    },
  ];

  const quickStats = [
    { 
      label: t('totalUsers'), 
      value: stats.totalUsers.toString(), 
      icon: 'people', 
      color: COLORS.primary,
      onPress: handleNavigateToUsers,
    },
    { 
      label: t('pendingApprovals'), 
      value: stats.pendingReservations.toString(), 
      icon: 'schedule', 
      color: COLORS.warning,
      onPress: handleViewPending,
    },
    { 
      label: t('activeBookings'), 
      value: stats.activeReservations.toString(), 
      icon: 'event', 
      color: COLORS.success,
      onPress: handleNavigateToReservations,
    },
    { 
      label: t('availableAmenities'), 
      value: stats.availableAmenities.toString(), 
      icon: 'pool', 
      color: COLORS.secondary,
      onPress: handleNavigateToAmenities,
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Welcome Header */}
      <Card style={styles.welcomeCard}>
        <View style={styles.welcomeHeader}>
          <Icon name="admin-panel-settings" size={32} color={COLORS.primary} />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>{t('adminDashboard')}</Text>
            <Text style={styles.welcomeSubtitle}>{t('manageBuilding')}</Text>
          </View>
        </View>
      </Card>

      {/* Quick Stats - Now clickable */}
      <View style={styles.statsContainer}>
        {quickStats.map((stat, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.statCard}
            onPress={stat.onPress}
          >
            <Icon name={stat.icon} size={24} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Priority Alerts */}
      {stats.pendingReservations > 0 && (
        <TouchableOpacity onPress={handleViewPending}>
          <Card style={styles.alertCard}>
            <View style={styles.alertContent}>
              <Icon name="priority-high" size={24} color={COLORS.warning} />
              <View style={styles.alertText}>
                <Text style={styles.alertTitle}>
                  {stats.pendingReservations} {language === 'es' ? 'Reserva' : 'Reservation'}{stats.pendingReservations > 1 ? (language === 'es' ? 's' : 's') : ''} {language === 'es' ? 'Necesita' : 'Need'}{stats.pendingReservations === 1 ? (language === 'es' ? '' : 's') : ''} {language === 'es' ? 'Aprobación' : 'Approval'}
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

      {/* Admin Actions - Now functional */}
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
            <View key={activity.id} style={styles.activityItem}>
              <Icon name={activity.icon} size={20} color={activity.color} />
              <Text style={styles.activityText}>{activity.message}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          ))}
        </Card>
      </View>

      {/* Quick Actions - Now functional */}
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
            {language === 'es' ? 'Restricciones de Cuenta de Administrador' : 'Admin Account Restrictions'}
          </Text>
        </View>
        <Text style={styles.noticeText}>
          {language === 'es' 
            ? 'Como administrador, solo puede hacer reservas de mantenimiento para amenidades. Las reservas regulares de amenidades están restringidas para garantizar acceso justo para los residentes.'
            : 'As an administrator, you can only make maintenance reservations for amenities. Regular amenity bookings are restricted to ensure fair access for residents.'
          }
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
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  alertTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: SPACING.xs / 2,
  },
  alertSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  actionsContainer: {
    padding: SPACING.md,
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
    marginRight: SPACING.md,
  },
  actionText: {
    flex: 1,
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
  activityContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  activityCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  activityText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  activityTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  quickActionsContainer: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  noticeCard: {
    margin: SPACING.md,
    marginTop: 0,
    marginBottom: SPACING.xl,
    backgroundColor: '#F8F9FF',
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
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  noticeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
});

export default AdminDashboardScreen;