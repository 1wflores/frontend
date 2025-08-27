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
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator';
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

  // ✅ SIMPLIFIED: No need for frontend filtering - backend handles it
  // Backend now only returns upcoming reservations for residents
  // Admins get all reservations and can filter them

  // ✅ UPDATED: Filters based on user role (simplified since backend filters)
  const getFilters = () => {
    if (user?.role === 'admin') {
      // Admin sees all filters including past - they get all data from backend
      return [
        { key: 'all', label: t('all'), count: 0 },
        { key: 'upcoming', label: t('upcoming'), count: 0 },
        { key: 'pending', label: language === 'es' ? 'Pendientes' : 'Pending', count: 0 },
        { key: 'past', label: language === 'es' ? 'Pasadas' : 'Past', count: 0 },
      ];
    } else {
      // Regular users only see upcoming filters - backend only sends upcoming data
      return [
        { key: 'all', label: t('all'), count: 0 },
        { key: 'upcoming', label: t('upcoming'), count: 0 },
        { key: 'pending', label: language === 'es' ? 'Pendientes' : 'Pending', count: 0 },
      ];
    }
  };

  const filters = getFilters();

  // Calculate filter counts - now using actual reservation data from backend
  const now = new Date();
  filters.forEach(filter => {
    switch (filter.key) {
      case 'all':
        filter.count = reservations.length;
        break;
      case 'upcoming':
        filter.count = reservations.filter(r => 
          DateUtils.isFuture(r.startTime) && ['approved', 'pending'].includes(r.status)
        ).length;
        break;
      case 'pending':
        filter.count = reservations.filter(r => r.status === 'pending').length;
        break;
      case 'past':
        // Only for admin - they receive all data
        filter.count = reservations.filter(r => 
          !DateUtils.isFuture(r.startTime) || ['completed', 'cancelled', 'denied'].includes(r.status)
        ).length;
        break;
    }
  });

  // ✅ SIMPLIFIED: Frontend filtering (much simpler now)
  const getFilteredReservations = () => {
    switch (selectedFilter) {
      case 'all':
        return reservations;
      case 'upcoming':
        return reservations.filter(r => 
          DateUtils.isFuture(r.startTime) && ['approved', 'pending'].includes(r.status)
        );
      case 'pending':
        return reservations.filter(r => r.status === 'pending');
      case 'past':
        // Only for admin
        return reservations.filter(r => 
          !DateUtils.isFuture(r.startTime) || ['completed', 'cancelled', 'denied'].includes(r.status)
        );
      default:
        return reservations;
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
    // ✅ ENHANCED: Cancellation confirmation with translations
    Alert.alert(
      language === 'es' ? 'Cancelar Reservación' : 'Cancel Reservation',
      language === 'es' 
        ? `¿Está seguro de que desea cancelar su reservación de ${reservation.amenityName} el ${DateUtils.formatDate(reservation.startTime)}?`
        : `Are you sure you want to cancel your reservation for ${reservation.amenityName} on ${DateUtils.formatDate(reservation.startTime)}?`,
      [
        {
          text: t('cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: language === 'es' ? 'Cancelar Reservación' : 'Cancel Reservation',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelReservation(reservation.id);
              Alert.alert(
                t('success') || 'Success',
                language === 'es' 
                  ? 'Reservación cancelada exitosamente'
                  : 'Reservation cancelled successfully'
              );
            } catch (error) {
              console.error('❌ Error cancelling reservation:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error') || 'Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderReservationItem = ({ item: reservation }) => (
    <ReservationCard
      reservation={reservation}
      onCancel={handleCancelReservation}
      language={language}
      user={user}
    />
  );

  const renderFilterButton = (filter) => {
    const isSelected = selectedFilter === filter.key;
    return (
      <TouchableOpacity
        key={filter.key}
        style={[
          styles.filterButton,
          isSelected && styles.filterButtonActive
        ]}
        onPress={() => setSelectedFilter(filter.key)}
      >
        <Text style={[
          styles.filterButtonText,
          isSelected && styles.filterButtonTextActive
        ]}>
          {filter.label}
        </Text>
        {filter.count > 0 && (
          <View style={[
            styles.countBadge,
            isSelected && styles.countBadgeActive
          ]}>
            <Text style={[
              styles.countText,
              isSelected && styles.countTextActive
            ]}>
              {filter.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-available" size={80} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>
        {language === 'es' ? 'No hay reservaciones' : 'No Reservations'}
      </Text>
      <Text style={styles.emptyMessage}>
        {selectedFilter === 'pending'
          ? (language === 'es' 
            ? 'No tienes reservaciones pendientes'
            : 'You have no pending reservations')
          : selectedFilter === 'past' && user?.role === 'admin'
          ? (language === 'es'
            ? 'No se encontraron reservaciones pasadas'
            : 'No past reservations found')
          : (language === 'es'
            ? 'Toca el botón de abajo para crear tu primera reservación'
            : 'Tap the button below to create your first reservation')
        }
      </Text>
      {selectedFilter !== 'past' && (
        <Button
          title={language === 'es' ? 'Crear Reservación' : 'Create Reservation'}
          onPress={() => navigation.navigate('CreateReservation')}
          style={styles.createButton}
        />
      )}
    </View>
  );

  if (loading && reservations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {language === 'es' ? 'Mis Reservaciones' : 'My Reservations'}
        </Text>
        {user?.role !== 'admin' && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateReservation')}
          >
            <Icon name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map(renderFilterButton)}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchUserReservations()}>
            <Text style={styles.retryText}>
              {language === 'es' ? 'Intentar de nuevo' : 'Try again'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reservations List */}
      <FlatList
        data={displayedReservations}
        renderItem={renderReservationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          displayedReservations.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Admin Badge */}
      {user?.role === 'admin' && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>
            {language === 'es' ? 'Vista Administrador' : 'Admin View'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  countBadge: {
    backgroundColor: COLORS.gray,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  countBadgeActive: {
    backgroundColor: COLORS.white,
  },
  countText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  countTextActive: {
    color: COLORS.primary,
  },
  errorContainer: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: 4,
  },
  retryText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  listContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  createButton: {
    paddingHorizontal: SPACING.xl,
  },
  adminBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default ReservationsScreen;