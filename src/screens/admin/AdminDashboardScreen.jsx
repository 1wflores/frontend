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
import { useAuth } from '../../hooks/useAuth';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const AdminDashboardScreen = ({ navigation }) => {
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

      setRecentActivity([
        {
          id: 1,
          type: 'user_created',
          message: language === 'es' 
            ? 'Usuario creado para Apartamento 205'
            : 'User created for Apartment 205',
          time: language === 'es' ? 'hace 2h' : '2h ago',
          icon: 'person-add',
          color: COLORS.primary,
        },
        {
          id: 2,
          type: 'reservation_approved',
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
          time: language === 'es' ? 'hace 6h' : '6h ago',
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

  const handleNavigateToUsers = () => {
    navigation.navigate('Users');
  };

  const handleNavigateToReservations = () => {
    navigation.navigate('Reservations');
  };

  const handleNavigateToAmenities = () => {
    navigation.navigate('Amenities');
  };

  const handleViewPending = () => {
    navigation.navigate('Reservations', { filter: 'pending' });
  };

  const adminActions = [
    {
      id: 'users',
      title: language === 'es' ? 'Gestión de Usuarios' : 'User Management',
      subtitle: language === 'es' 
        ? 'Crear y gestionar usuarios de apartamentos'
        : 'Create and manage apartment users',
      icon: 'people',
      color: COLORS.primary,
      onPress: handleNavigateToUsers,
    },
    {
      id: 'reservations',
      title: language === 'es' ? 'Gestión de Reservas' : 'Reservation Management',
      subtitle: language === 'es' 
        ? 'Revisar y aprobar reservas'
        : 'Review and approve bookings',
      icon: 'event',
      color: COLORS.success,
      onPress: handleNavigateToReservations,
    },
    {
      id: 'amenities',
      title: language === 'es' ? 'Gestión de Amenidades' : 'Amenity Management',
      subtitle: language === 'es' 
        ? 'Configurar y mantener amenidades'
        : 'Configure and maintain amenities',
      icon: 'apartment',
      color: COLORS.warning,
      onPress: handleNavigateToAmenities,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'es' ? 'Buenos días' : 'Good morning';
    if (hour < 18) return language === 'es' ? 'Buenas tardes' : 'Good afternoon';
    return language === 'es' ? 'Buenas noches' : 'Good evening';
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
          <Icon name="admin-panel-settings" size={32} color={COLORS.primary} />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>
              {getGreeting()}, Admin
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {user?.username || 'apartment000'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Stats Overview - FIXED: 2x2 Grid Layout with Proper Translations */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="people" size={24} color={COLORS.primary} />
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Total Usuarios' : 'Total Users'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="pending" size={24} color={COLORS.warning} />
          <Text style={styles.statValue}>{stats.pendingReservations}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Aprobaciones Pendientes' : 'Pending Approvals'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="event" size={24} color={COLORS.success} />
          <Text style={styles.statValue}>{stats.activeReservations}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Reservas Activas' : 'Active Bookings'}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="apartment" size={24} color={COLORS.info} />
          <Text style={styles.statValue}>{stats.availableAmenities}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Amenidades Disponibles' : 'Available Amenities'}
          </Text>
        </View>
      </View>

      {/* Pending Approvals Alert */}
      {stats.pendingReservations > 0 && (
        <TouchableOpacity onPress={handleViewPending}>
          <Card style={styles.alertCard}>
            <View style={styles.alertContent}>
              <Icon name="notification-important" size={24} color={COLORS.warning} />
              <View style={styles.alertText}>
                <Text style={styles.alertTitle}>
                  {stats.pendingReservations} {stats.pendingReservations === 1 
                    ? (language === 'es' ? 'Reserva Necesita' : 'Reservation Needs')
                    : (language === 'es' ? 'Reservas Necesitan' : 'Reservations Need')
                  } {language === 'es' ? 'Aprobación' : 'Approval'}
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
        <Text style={styles.sectionTitle}>
          {language === 'es' ? 'Actividad Reciente' : 'Recent Activity'}
        </Text>
        
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
        <Text style={styles.sectionTitle}>
          {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
        </Text>
        <View style={styles.quickActions}>
          <Button
            title={language === 'es' ? 'Crear Usuario' : 'Create User'}
            leftIcon="person-add"
            onPress={handleNavigateToUsers}
            style={styles.quickActionButton}
          />
          <Button
            title={language === 'es' ? 'Ver Reservas' : 'View Bookings'}
            leftIcon="event"
            variant="outline"
            onPress={handleNavigateToReservations}
            style={styles.quickActionButton}
          />
        </View>
      </View>
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
    backgroundColor: `${COLORS.primary}10`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
  // FIXED: 2x2 Grid Layout for Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%', // FIXED: Changed from flex: 1 to fixed width for 2x2 grid
    alignItems: 'center',
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
});

export default AdminDashboardScreen;