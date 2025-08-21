import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { useReservations } from '../../hooks/useReservations';
import { ReservationCard } from '../../components/reservation/ReservationCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator'; // ✅ ADDED: Error translation
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const ReservationsScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const {
    reservations,
    loading,
    error,
    fetchUserReservations,
    cancelReservation,
  } = useReservations();
  
  const [selectedFilter, setSelectedFilter] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  // ✅ ENHANCED: Filter out old reservations for regular users
  const getFilteredReservationsForUser = () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    return reservations.filter(r => {
      const startTime = new Date(r.startTime);
      
      // For regular users: hide old completed/cancelled/denied reservations
      if (user?.role !== 'admin') {
        // Hide reservations older than 3 days unless they're still pending/approved
        if (startTime < threeDaysAgo && !['pending', 'approved'].includes(r.status)) {
          return false;
        }
      }
      
      return true;
    });
  };

  const filteredUserReservations = getFilteredReservationsForUser();

  // ✅ ENHANCED: Filters based on user role with proper translations
  const getFilters = () => {
    if (user?.role === 'admin') {
      // Admin sees all filters including past
      return [
        { key: 'upcoming', label: t('upcoming'), count: 0 },
        { key: 'pending', label: language === 'es' ? 'Pendientes' : 'Pending', count: 0 },
        { key: 'past', label: language === 'es' ? 'Pasadas' : 'Past', count: 0 },
        { key: 'all', label: t('all'), count: 0 },
      ];
    } else {
      // Regular users don't see past filter
      return [
        { key: 'upcoming', label: t('upcoming'), count: 0 },
        { key: 'pending', label: language === 'es' ? 'Pendientes' : 'Pending', count: 0 },
        { key: 'current', label: language === 'es' ? 'Actuales' : 'Current', count: 0 },
      ];
    }
  };

  const filters = getFilters();

  // Calculate filter counts using filtered reservations
  const now = new Date();
  filters.forEach(filter => {
    switch (filter.key) {
      case 'upcoming':
        filter.count = filteredUserReservations.filter(r => 
          DateUtils.isFuture(r.startTime) && ['approved', 'pending'].includes(r.status)
        ).length;
        break;
      case 'pending':
        filter.count = filteredUserReservations.filter(r => r.status === 'pending').length;
        break;
      case 'current':
        // Current = today's reservations or very recent ones
        filter.count = filteredUserReservations.filter(r => 
          DateUtils.isToday(r.startTime) || 
          (DateUtils.isFuture(r.startTime) && ['approved'].includes(r.status))
        ).length;
        break;
      case 'past':
        // Only for admin
        filter.count = filteredUserReservations.filter(r => 
          !DateUtils.isFuture(r.startTime) || ['completed', 'cancelled', 'denied'].includes(r.status)
        ).length;
        break;
      case 'all':
        filter.count = filteredUserReservations.length;
        break;
    }
  });

  const getFilteredReservations = () => {
    switch (selectedFilter) {
      case 'upcoming':
        return filteredUserReservations.filter(r => 
          DateUtils.isFuture(r.startTime) && ['approved', 'pending'].includes(r.status)
        );
      case 'pending':
        return filteredUserReservations.filter(r => r.status === 'pending');
      case 'current':
        return filteredUserReservations.filter(r => 
          DateUtils.isToday(r.startTime) || 
          (DateUtils.isFuture(r.startTime) && ['approved'].includes(r.status))
        );
      case 'past':
        // Only for admin
        return filteredUserReservations.filter(r => 
          !DateUtils.isFuture(r.startTime) || ['completed', 'cancelled', 'denied'].includes(r.status)
        );
      case 'all':
        return filteredUserReservations;
      default:
        return filteredUserReservations;
    }
  };

  const displayedReservations = getFilteredReservations();

  useFocusEffect(
    useCallback(() => {
      fetchUserReservations();
    }, [fetchUserReservations])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserReservations();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelReservation = async (reservation) => {
    // ✅ FIXED: Cancellation confirmation with translations
    Alert.alert(
      language === 'es' ? 'Cancelar Reserva' : 'Cancel Reservation',
      language === 'es' ? '¿Está seguro de que desea cancelar esta reserva?' : 'Are you sure you want to cancel this reservation?',
      [
        { text: language === 'es' ? 'No' : 'No', style: 'cancel' },
        {
          text: language === 'es' ? 'Sí, Cancelar' : 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelReservation(reservation.id);
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

  const handleNavigateToAmenities = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Amenities' } }],
    });
  };

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        selectedFilter === filter.key && styles.activeFilterButton,
      ]}
      onPress={() => setSelectedFilter(filter.key)}
    >
      <Text
        style={[
          styles.filterText,
          selectedFilter === filter.key && styles.activeFilterText,
        ]}
      >
        {filter.label}
      </Text>
      {filter.count > 0 && (
        <View style={[
          styles.filterBadge,
          selectedFilter === filter.key && styles.activeFilterBadge,
        ]}>
          <Text style={[
            styles.filterBadgeText,
            selectedFilter === filter.key && styles.activeFilterBadgeText,
          ]}>
            {filter.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderReservationItem = ({ item }) => (
    <ReservationCard
      reservation={item}
      onCancel={() => handleCancelReservation(item)}
      onViewDetails={() => {/* Navigate to details */}}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon 
        name={selectedFilter === 'upcoming' ? 'event-note' : 'filter-list'} 
        size={64} 
        color={COLORS.text.secondary} 
      />
      {/* ✅ FIXED: Empty state with proper translations */}
      <Text style={styles.emptyTitle}>
        {selectedFilter === 'upcoming' 
          ? t('noUpcomingReservationsTitle')
          : t('noMatchingReservations')
        }
      </Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'upcoming' 
          ? t('noUpcomingReservations')
          : (language === 'es' 
              ? `No se encontraron reservas para "${filters.find(f => f.key === selectedFilter)?.label}".`
              : `No reservations found for "${filters.find(f => f.key === selectedFilter)?.label}".`
            )
        }
      </Text>
      {selectedFilter === 'upcoming' && (
        <Button
          title={t('bookAmenity')}
          onPress={handleNavigateToAmenities}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  // ✅ ENHANCED: Show info about hidden old reservations for regular users
  const renderInfoMessage = () => {
    if (user?.role === 'admin') return null;

    return (
      <View style={styles.infoMessage}>
        <Icon name="info" size={16} color={COLORS.primary} />
        <Text style={styles.infoText}>
          {t('oldReservationsHidden')}
        </Text>
      </View>
    );
  };

  if (loading && reservations.length === 0) {
    return <LoadingSpinner message={language === 'es' ? 'Cargando reservas...' : 'Loading reservations...'} />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map(renderFilterButton)}
      </View>

      {/* Info Message for Regular Users */}
      {renderInfoMessage()}

      {/* Reservations List */}
      <FlatList
        data={displayedReservations}
        renderItem={renderReservationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* ✅ FIXED: Error handling with translations */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {ApiErrorTranslator.translateError(error, language)}
          </Text>
          <Button
            title={t('retry')}
            variant="outline"
            onPress={() => fetchUserReservations()}
            style={styles.retryButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  activeFilterText: {
    color: COLORS.text.inverse,
  },
  filterBadge: {
    backgroundColor: COLORS.text.secondary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  activeFilterBadge: {
    backgroundColor: COLORS.text.inverse,
  },
  filterBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text.inverse,
  },
  activeFilterBadgeText: {
    color: COLORS.primary,
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    padding: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  listContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
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
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    minWidth: 150,
  },
  errorContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
});

export default ReservationsScreen;