import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator'; // ✅ ADDED: Error translation
import { Localization } from '../../utils/localization'; // ✅ ADDED: Data translation
import { useAuth } from '../../hooks/useAuth';
import { useReservations } from '../../hooks/useReservations';
import { useAmenities } from '../../hooks/useAmenities';
import { ReservationCard } from '../../components/reservation/ReservationCard';
import { AmenityCard } from '../../components/reservation/AmenityCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const DashboardScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { 
    reservations, 
    loading: reservationsLoading, 
    fetchUserReservations,
    cancelReservation 
  } = useReservations();
  const { 
    amenities, 
    loading: amenitiesLoading, 
    fetchAmenities 
  } = useAmenities();

  const [refreshing, setRefreshing] = useState(false);

  // ✅ ENHANCED: Extract apartment number with error handling
  const getApartmentNumber = (userData) => {
    console.log('🏠 Dashboard: Getting apartment number for user:', userData);
    
    if (!userData) {
      console.warn('⚠️ Dashboard: No user data provided');
      return language === 'es' ? 'Desconocido' : 'Unknown';
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
    const todayReservations = reservations.filter(r => DateUtils.isToday(r.startTime) && ['approved', 'pending'].includes(r.status));
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
    // ✅ FIXED: Cancellation confirmation with translations
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
              await cancelReservation(reservationId);
              await fetchUserReservations();
              // ✅ FIXED: Success message translation
              Alert.alert(
                t('success'), 
                language === 'es' ? 'Reserva cancelada exitosamente' : 'Reservation cancelled successfully'
              );
            } catch (error) {
              // ✅ FIXED: Error translation
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error'), errorMessage);
            }
          },
        },
      ]
    );
  };

  if (reservationsLoading && amenitiesLoading) {
    return <LoadingSpinner message={t('loading')} />;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeContent}>
            <Text style={styles.greeting}>
              {getGreeting()}, {getApartmentNumber(user)}! 👋
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
          <Icon name="date_range" size={24} color={COLORS.success} />
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
          <Icon name="flash_on" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{t('quickBook')}</Text>
          <TouchableOpacity onPress={handleNavigateToAmenities}>
            <Text style={styles.viewAllText}>{t('viewAll')}</Text>
          </TouchableOpacity>
        </View>
        
        {amenities.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.amenitiesScroll}
          >
            {amenities.filter(a => a.isActive).slice(0, 5).map((amenity) => (
              <View key={amenity.id} style={styles.amenityCardContainer}>
                <AmenityCard
                  amenity={amenity}
                  onPress={() => handleBookAmenity(amenity.id)}
                  compact
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyAmenities}>
            <Icon name="pool" size={48} color={COLORS.text.secondary} />
            <Text style={styles.emptyText}>
              {language === 'es' 
                ? 'No hay amenidades disponibles en este momento'
                : 'No amenities available at the moment'
              }
            </Text>
          </View>
        )}
      </View>

      {/* Upcoming Reservations */}
      {upcomingReservations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="event" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>{t('upcomingReservations')}</Text>
            <TouchableOpacity onPress={handleNavigateToReservations}>
              <Text style={styles.viewAllText}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={() => handleCancelReservation(reservation.id)}
              onViewDetails={() => {/* Navigate to details */}}
            />
          ))}
        </View>
      )}

      {/* Recent Activity - Only show if no upcoming reservations */}
      {upcomingReservations.length === 0 && recentReservations.length > 0 && (
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

      {/* Empty State - No reservations at all */}
      {upcomingReservations.length === 0 && todayReservations.length === 0 && recentReservations.length === 0 && (
        <View style={styles.section}>
          <View style={styles.emptyState}>
            <Icon name="event_note" size={64} color={COLORS.text.secondary} />
            <Text style={styles.emptyTitle}>
              {t('noUpcomingReservations')}
            </Text>
            <Text style={styles.emptyText}>
              {t('bookAmenityToSee')}
            </Text>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => handleBookAmenity()}
            >
              <Icon name="add" size={20} color={COLORS.white} />
              <Text style={styles.bookButtonText}>{t('bookAmenity')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="flash_on" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        </View>
        
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => handleBookAmenity()}
          >
            <Icon name="pool" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>{t('bookAmenity')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={handleNavigateToReservations}
          >
            <Icon name="event" size={24} color={COLORS.primary} />
            <Text style={styles.quickActionText}>{t('myBookings')}</Text>
          </TouchableOpacity>
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
  welcomeContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  welcomeContent: {
    flex: 1,
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: 12,
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
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
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
  amenitiesScroll: {
    paddingHorizontal: SPACING.md,
  },
  amenityCardContainer: {
    width: 200,
    marginRight: SPACING.md,
  },
  emptyAmenities: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  bookButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default DashboardScreen;