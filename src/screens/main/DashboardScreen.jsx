import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useReservations } from '../../hooks/useReservations';
import { useAmenities } from '../../hooks/useAmenities';
import { ReservationCard } from '../../components/reservation/ReservationCard';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ValidationUtils } from '../../utils/validationUtils';
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { reservations, loading: reservationsLoading, fetchUserReservations } = useReservations();
  const { amenities, loading: amenitiesLoading, fetchAmenities } = useAmenities();
  const [refreshing, setRefreshing] = useState(false);

  // ✅ FIXED: Better apartment number extraction with debug logging
  const getApartmentNumber = (userData) => {
    console.log('🏠 Dashboard getApartmentNumber called with user:', userData);
    
    if (!userData) {
      console.warn('⚠️ Dashboard: No user data provided');
      return 'Unknown';
    }

    const result = ValidationUtils.extractApartmentNumber(userData.username);
    console.log('🏠 Dashboard: Apartment number result:', result);
    return result;
  };

  // Filter reservations for different sections
  const upcomingReservations = reservations
    .filter(r => DateUtils.isFuture(r.startTime) && ['approved', 'pending'].includes(r.status))
    .slice(0, 3);

  const todayReservations = reservations
    .filter(r => DateUtils.isToday(r.startTime) && ['approved', 'pending'].includes(r.status));

  const recentReservations = reservations
    .filter(r => !DateUtils.isFuture(r.startTime) && r.status === 'completed')
    .slice(0, 2);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserReservations();
      fetchAmenities();
    });

    return unsubscribe;
  }, [navigation, fetchUserReservations, fetchAmenities]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUserReservations(),
        fetchAmenities(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const getQuickStats = () => {
    const pendingReservations = reservations.filter(r => r.status === 'pending');
    const activeAmenities = amenities.filter(a => a.isActive);
    const thisWeekReservations = reservations.filter(r => {
      const startTime = new Date(r.startTime);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return startTime >= now && startTime <= weekFromNow && ['approved', 'pending'].includes(r.status);
    });

    return {
      todayCount: todayReservations.length,
      pendingCount: pendingReservations.length,
      weekCount: thisWeekReservations.length,
      availableAmenities: activeAmenities.length,
    };
  };

  const stats = getQuickStats();

  const handleBookAmenity = (amenityId) => {
    if (amenityId) {
      navigation.navigate('AmenityBooking', { amenityId });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Amenities' } }],
      });
    }
  };

  const handleNavigateToReservations = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Reservations' } }],
    });
  };

  const handleNavigateToAmenities = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Amenities' } }],
    });
  };

  const handleNavigateToProfile = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Profile' } }],
    });
  };

  const handleCancelReservation = async (reservationId) => {
    Alert.alert(
      t('cancel'),
      language === 'es' ? '¿Está seguro de que desea cancelar esta reserva?' : 'Are you sure you want to cancel this reservation?',
      [
        { text: language === 'es' ? 'No' : 'No', style: 'cancel' },
        {
          text: language === 'es' ? 'Sí, Cancelar' : 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetchUserReservations();
              Alert.alert(t('success'), language === 'es' ? 'Reserva cancelada exitosamente' : 'Reservation cancelled successfully');
            } catch (error) {
              Alert.alert(t('error'), language === 'es' ? 'Error al cancelar la reserva' : 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  if (reservationsLoading && reservations.length === 0) {
    return <LoadingSpinner message={t('loading')} />;
  }

  // ✅ FIXED: Better apartment number display with debug info
  const apartmentNumber = getApartmentNumber(user);
  console.log('🏠 Dashboard final apartment number:', apartmentNumber);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {t('apartment')} {apartmentNumber}!
            </Text>
            <Text style={styles.welcomeText}>
              {t('readyToBook')}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={handleNavigateToProfile}
          >
            <Icon name="person" size={24} color={COLORS.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={handleNavigateToReservations}
        >
          <Icon name="today" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats.todayCount}</Text>
          <Text style={styles.statLabel}>{t('today')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={handleNavigateToReservations}
        >
          <Icon name="schedule" size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>{stats.pendingCount}</Text>
          <Text style={styles.statLabel}>{t('pending')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={handleNavigateToReservations}
        >
          <Icon name="date-range" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{stats.weekCount}</Text>
          <Text style={styles.statLabel}>{t('thisWeek')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={handleNavigateToAmenities}
        >
          <Icon name="pool" size={24} color={COLORS.secondary} />
          <Text style={styles.statNumber}>{stats.availableAmenities}</Text>
          <Text style={styles.statLabel}>{t('available')}</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Reservations */}
      {todayReservations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="today" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t('todaysReservations')}</Text>
          </View>
          {todayReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              showActions={false}
            />
          ))}
        </View>
      )}

      {/* Quick Book Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="flash-on" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{t('quickBook')}</Text>
          <TouchableOpacity onPress={handleNavigateToAmenities}>
            <Text style={styles.viewAllText}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>
        
        {amenities.length > 0 ? (
          <View style={styles.amenitiesGrid}>
            {amenities.slice(0, 4).map((amenity) => (
              <View key={amenity.id} style={styles.amenityGridItem}>
                <TouchableOpacity
                  style={styles.quickBookCard}
                  onPress={() => handleBookAmenity(amenity.id)}
                  disabled={!amenity.isActive}
                >
                  <Icon 
                    name={getAmenityIcon(amenity.type)} 
                    size={32} 
                    color={amenity.isActive ? COLORS.primary : COLORS.text.secondary} 
                  />
                  <Text style={[
                    styles.quickBookTitle,
                    !amenity.isActive && styles.disabledText
                  ]}>
                    {amenity.name}
                  </Text>
                  {!amenity.isActive && (
                    <Text style={styles.maintenanceText}>{t('maintenance')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyQuickBook}>
            <Icon name="pool" size={48} color={COLORS.text.secondary} />
            <Text style={styles.emptyText}>
              {language === 'es' ? 'No hay amenidades disponibles' : 'No amenities available'}
            </Text>
          </Card>
        )}
      </View>

      {/* Upcoming Reservations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="upcoming" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{t('upcomingReservations')}</Text>
          <TouchableOpacity onPress={handleNavigateToReservations}>
            <Text style={styles.viewAllText}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {upcomingReservations.length > 0 ? (
          upcomingReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={() => handleCancelReservation(reservation.id)}
              onViewDetails={() => {/* Navigate to details if implemented */}}
            />
          ))
        ) : (
          <Card style={styles.emptyState}>
            <Icon name="event-available" size={48} color={COLORS.text.secondary} />
            <Text style={styles.emptyText}>{t('noUpcomingReservations')}</Text>
            <Text style={styles.emptySubtext}>
              {t('bookAmenityToSee')}
            </Text>
            <Button
              title={t('bookAmenity')}
              variant="outline"
              onPress={() => handleBookAmenity()}
              style={styles.emptyButton}
            />
          </Card>
        )}
      </View>

      {/* Recent Activity */}
      {recentReservations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="history" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t('recentActivity')}</Text>
          </View>
          {recentReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              showActions={false}
            />
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={handleNavigateToAmenities}
          >
            <View style={styles.quickActionIcon}>
              <Icon name="pool" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('bookAmenity')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={handleNavigateToReservations}
          >
            <View style={styles.quickActionIcon}>
              <Icon name="event" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('myBookings')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={handleNavigateToProfile}
          >
            <View style={styles.quickActionIcon}>
              <Icon name="person" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>{t('profile')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tips Section */}
      <Card style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Icon name="lightbulb" size={20} color={COLORS.warning} />
          <Text style={styles.tipsTitle}>
            {language === 'es' ? '💡 ¿Sabía que?' : '💡 Did you know?'}
          </Text>
        </View>
        <Text style={styles.tipsText}>
          {language === 'es' 
            ? 'Puede reservar amenidades hasta con 7 días de anticipación. Algunas reservas se aprueban automáticamente mientras que otras pueden requerir revisión administrativa para garantizar equidad.'
            : 'You can book amenities up to 7 days in advance. Some reservations are auto-approved while others may require admin review for fairness.'
          }
        </Text>
      </Card>
    </ScrollView>
  );
};

// Helper function to get amenity icons
const getAmenityIcon = (type) => {
  switch (type) {
    case 'jacuzzi':
      return 'hot-tub';
    case 'cold-tub':
      return 'ac-unit';
    case 'yoga-deck':
      return 'self-improvement';
    case 'lounge':
      return 'weekend';
    default:
      return 'place';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeSection: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
    marginBottom: SPACING.xs,
  },
  welcomeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginTop: -SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
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
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  amenityGridItem: {
    width: '50%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  quickBookCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
    justifyContent: 'center',
  },
  quickBookTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  disabledText: {
    color: COLORS.text.secondary,
  },
  maintenanceText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs / 2,
  },
  emptyQuickBook: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    minWidth: 150,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    minWidth: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: SPACING.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  quickActionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  tipsCard: {
    margin: SPACING.md,
    marginBottom: SPACING.xl,
    backgroundColor: '#F8F9FF',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tipsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  tipsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default DashboardScreen;