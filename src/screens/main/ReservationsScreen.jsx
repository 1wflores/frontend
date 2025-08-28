// src/screens/main/ReservationsScreen.jsx - FIXED VERSION

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView, // ✅ FIXED: Added missing ScrollView import
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ReservationCard } from '../../components/reservation/ReservationCard';
import EditReservationModal from '../../components/reservation/EditReservationModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { useReservations } from '../../hooks/useReservations';
import { useReservationEdit } from '../../hooks/useReservationEdit';
import { DateUtils } from '../../utils/dateUtils';
import { Localization } from '../../utils/localization';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const ReservationsScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { reservations, loading, fetchUserReservations, cancelReservation } = useReservations();
  const { canEditReservation } = useReservationEdit();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Load reservations on mount and focus
  useFocusEffect(
    useCallback(() => {
      loadReservations();
    }, [])
  );

  useEffect(() => {
    filterReservations();
  }, [reservations, selectedFilter]);

  const loadReservations = async () => {
    try {
      await fetchUserReservations();
    } catch (error) {
      console.error('Error loading reservations:', error);
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'Error al cargar reservaciones. Por favor intente de nuevo.'
          : 'Error loading reservations. Please try again.'
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadReservations();
    } catch (error) {
      console.error('Error refreshing reservations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ FIXED: Enhanced filtering logic for better upcoming detection
  const filterReservations = () => {
    console.log('🔍 Filtering reservations:', {
      total: reservations.length,
      selectedFilter,
      reservations: reservations.map(r => ({
        id: r.id,
        startTime: r.startTime,
        status: r.status,
        isUpcoming: DateUtils.isFuture(r.startTime),
        isPending: r.status === 'pending'
      }))
    });

    let filtered = [];
    const now = new Date();

    switch (selectedFilter) {
      case 'upcoming':
        filtered = reservations.filter(r => {
          const isInFuture = DateUtils.isFuture(r.startTime);
          const isActiveStatus = ['approved', 'pending'].includes(r.status);
          console.log(`Reservation ${r.id}: future=${isInFuture}, status=${r.status}, active=${isActiveStatus}`);
          return isInFuture && isActiveStatus;
        });
        break;
      case 'past':
        filtered = reservations.filter(r => {
          const isPast = !DateUtils.isFuture(r.startTime);
          const isCompleted = ['completed', 'cancelled'].includes(r.status);
          return isPast || isCompleted;
        });
        break;
      case 'pending':
        filtered = reservations.filter(r => r.status === 'pending');
        break;
      case 'cancelled':
        filtered = reservations.filter(r => r.status === 'cancelled');
        break;
      case 'all':
      default:
        filtered = reservations;
        break;
    }

    console.log('🔍 Filtered results:', {
      filter: selectedFilter,
      count: filtered.length,
      items: filtered.map(r => ({ id: r.id, startTime: r.startTime, status: r.status }))
    });

    // Sort by start time (upcoming first, then by date)
    filtered.sort((a, b) => {
      if (selectedFilter === 'upcoming') {
        return new Date(a.startTime) - new Date(b.startTime);
      }
      return new Date(b.startTime) - new Date(a.startTime);
    });

    setFilteredReservations(filtered);
  };

  const calculateStats = () => {
    const total = reservations.length;
    const upcoming = reservations.filter(r => 
      DateUtils.isFuture(r.startTime) && ['approved', 'pending'].includes(r.status)
    ).length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const completed = reservations.filter(r => 
      (!DateUtils.isFuture(r.startTime) && r.status === 'completed') || r.status === 'completed'
    ).length;

    console.log('📊 Stats calculated:', { total, upcoming, pending, completed });

    return { total, upcoming, pending, completed };
  };

  const stats = calculateStats();

  const handleCancelReservation = async (reservationId) => {
    try {
      Alert.alert(
        language === 'es' ? 'Cancelar Reservación' : 'Cancel Reservation',
        language === 'es' 
          ? '¿Está seguro de que desea cancelar esta reservación?'
          : 'Are you sure you want to cancel this reservation?',
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: language === 'es' ? 'Cancelar Reservación' : 'Cancel Reservation',
            style: 'destructive',
            onPress: async () => {
              try {
                await cancelReservation(reservationId);
                await loadReservations(); // Refresh the list
                
                Alert.alert(
                  t('success') || 'Success',
                  language === 'es' 
                    ? 'Reservación cancelada exitosamente'
                    : 'Reservation cancelled successfully'
                );
              } catch (error) {
                console.error('Cancel reservation error:', error);
                Alert.alert(
                  t('error') || 'Error',
                  error.message || (
                    language === 'es' 
                      ? 'Error al cancelar reservación'
                      : 'Error cancelling reservation'
                  )
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Handle cancel error:', error);
    }
  };

  const handleEditReservation = (reservation) => {
    if (canEditReservation(reservation)) {
      setSelectedReservation(reservation);
      setEditModalVisible(true);
    } else {
      Alert.alert(
        language === 'es' ? 'No Editable' : 'Cannot Edit',
        language === 'es' 
          ? 'Esta reservación no puede ser editada'
          : 'This reservation cannot be edited'
      );
    }
  };

  const handleReservationUpdate = async (updatedReservation) => {
    try {
      await loadReservations(); // Refresh the list
      Alert.alert(
        t('success') || 'Success',
        language === 'es' 
          ? 'Reservación actualizada exitosamente'
          : 'Reservation updated successfully'
      );
    } catch (error) {
      console.error('Handle update error:', error);
    }
  };

  const renderFilterButton = (filter, label) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterText,
          selectedFilter === filter && styles.activeFilterText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderReservation = ({ item: reservation }) => (
    <ReservationCard
      reservation={reservation}
      onCancel={() => handleCancelReservation(reservation.id)}
      onEdit={() => handleEditReservation(reservation)}
      onViewDetails={() => {
        // Navigate to details if needed
        console.log('View details for:', reservation.id);
      }}
      showEditButton={canEditReservation(reservation)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event" size={64} color={COLORS.text.secondary} />
      <Text style={styles.emptyTitle}>
        {selectedFilter === 'all' && (language === 'es' ? 'Sin Reservaciones' : 'No Reservations')}
        {selectedFilter === 'upcoming' && (language === 'es' ? 'Sin Reservaciones Próximas' : 'No Upcoming Reservations')}
        {selectedFilter === 'past' && (language === 'es' ? 'Sin Reservaciones Pasadas' : 'No Past Reservations')}
        {selectedFilter === 'pending' && (language === 'es' ? 'Sin Reservaciones Pendientes' : 'No Pending Reservations')}
        {selectedFilter === 'cancelled' && (language === 'es' ? 'Sin Reservaciones Canceladas' : 'No Cancelled Reservations')}
      </Text>
      <Text style={styles.emptyText}>
        {language === 'es' 
          ? 'Cuando haga una reservación, aparecerá aquí.'
          : 'When you make a reservation, it will appear here.'
        }
      </Text>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message={language === 'es' ? 'Cargando reservaciones...' : 'Loading reservations...'} />;
  }

  return (
    <View style={styles.container}>
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Icon name="event" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Total' : 'Total'}
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon name="event-available" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>{stats.upcoming}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Próximas' : 'Upcoming'}
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon name="schedule" size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Pendientes' : 'Pending'}
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon name="check-circle" size={24} color={COLORS.text.secondary} />
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Pasadas' : 'Past'}
          </Text>
        </Card>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {renderFilterButton('all', language === 'es' ? 'Todas' : 'All')}
          {renderFilterButton('upcoming', language === 'es' ? 'Próximas' : 'Upcoming')}
          {renderFilterButton('past', language === 'es' ? 'Pasadas' : 'Past')}
          {renderFilterButton('pending', language === 'es' ? 'Pendientes' : 'Pending')}
          {renderFilterButton('cancelled', language === 'es' ? 'Canceladas' : 'Cancelled')}
        </ScrollView>
      </View>

      {/* Reservations List */}
      <FlatList
        data={filteredReservations}
        renderItem={renderReservation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Reservation Modal */}
      {selectedReservation && (
        <EditReservationModal
          visible={editModalVisible}
          reservation={selectedReservation}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedReservation(null);
          }}
          onUpdate={(updatedReservation) => {
            handleReservationUpdate(updatedReservation);
            setEditModalVisible(false);
            setSelectedReservation(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
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
  },
  filterContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  filterScrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginRight: SPACING.sm,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  activeFilterText: {
    color: COLORS.white,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default ReservationsScreen;