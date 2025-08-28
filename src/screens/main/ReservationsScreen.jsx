// src/screens/main/ReservationsScreen.jsx - COMPLETE FILE WITH EDIT SUPPORT

import React, { useState, useEffect, useCallback } from 'react';
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
          ? 'No se pudieron cargar las reservas' 
          : 'Failed to load reservations'
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  const filterReservations = () => {
    let filtered = [...reservations];
    const now = new Date();

    switch (selectedFilter) {
      case 'upcoming':
        filtered = filtered.filter(r => {
          const startTime = new Date(r.startTime);
          return startTime > now && ['pending', 'approved', 'confirmed'].includes(r.status);
        });
        break;
      case 'past':
        filtered = filtered.filter(r => {
          const endTime = new Date(r.endTime);
          return endTime < now || r.status === 'completed';
        });
        break;
      case 'pending':
        filtered = filtered.filter(r => r.status === 'pending');
        break;
      case 'cancelled':
        filtered = filtered.filter(r => ['cancelled', 'denied'].includes(r.status));
        break;
      default:
        // 'all' - no filter
        break;
    }

    // Sort by start time (most recent first for past, soonest first for upcoming)
    filtered.sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      
      if (selectedFilter === 'past') {
        return dateB - dateA; // Most recent first for past
      } else {
        return dateA - dateB; // Soonest first for upcoming
      }
    });

    setFilteredReservations(filtered);
  };

  const handleReservationPress = (reservation) => {
    setSelectedReservation(reservation);
    
    // Show options for editable reservations
    if (canEditReservation(reservation)) {
      showReservationOptions(reservation);
    } else {
      showReservationDetails(reservation);
    }
  };

  const showReservationOptions = (reservation) => {
    const options = [];
    const destructiveOptions = [];
    
    // Add view details option
    options.push({
      text: language === 'es' ? 'Ver detalles' : 'View details',
      onPress: () => showReservationDetails(reservation)
    });
    
    // Add edit option for eligible reservations
    if (canEditReservation(reservation)) {
      options.push({
        text: language === 'es' ? 'Editar reserva' : 'Edit reservation',
        onPress: () => handleEditReservation(reservation)
      });
    }
    
    // Add cancel option for cancellable reservations
    const cancellableStatuses = ['pending', 'approved', 'confirmed'];
    if (cancellableStatuses.includes(reservation.status)) {
      destructiveOptions.push({
        text: language === 'es' ? 'Cancelar reserva' : 'Cancel reservation',
        style: 'destructive',
        onPress: () => handleCancelReservation(reservation)
      });
    }
    
    // Show action sheet
    Alert.alert(
      Localization.translateAmenity(reservation.amenityName, language),
      DateUtils.formatDateTime(new Date(reservation.startTime), language),
      [
        ...options,
        ...destructiveOptions,
        {
          text: language === 'es' ? 'Cerrar' : 'Close',
          style: 'cancel'
        }
      ]
    );
  };

  const showReservationDetails = (reservation) => {
    const isLounge = reservation.amenityType === 'lounge' || 
                    reservation.amenityName?.toLowerCase().includes('lounge');
    
    let details = `${t('amenity') || 'Amenity'}: ${Localization.translateAmenity(reservation.amenityName, language)}\n`;
    details += `${t('date') || 'Date'}: ${DateUtils.formatDate(new Date(reservation.startTime), language)}\n`;
    details += `${t('time') || 'Time'}: ${DateUtils.formatTime(new Date(reservation.startTime))} - ${DateUtils.formatTime(new Date(reservation.endTime))}\n`;
    details += `${t('status') || 'Status'}: ${Localization.translateStatus(reservation.status, language)}`;
    
    // Add lounge-specific details if applicable
    if (isLounge && reservation.visitorCount) {
      details += `\n${language === 'es' ? 'Visitantes' : 'Visitors'}: ${reservation.visitorCount}`;
    }
    
    if (isLounge && reservation.willUseGrill !== undefined) {
      details += `\n${language === 'es' ? 'Uso de parrilla' : 'Grill usage'}: ${
        reservation.willUseGrill 
          ? (language === 'es' ? 'Sí' : 'Yes')
          : (language === 'es' ? 'No' : 'No')
      }`;
    }
    
    if (reservation.notes) {
      details += `\n\n${t('notes') || 'Notes'}: ${reservation.notes}`;
    }
    
    if (reservation.status === 'denied' && reservation.denialReason) {
      details += `\n\n${language === 'es' ? 'Razón del rechazo' : 'Rejection reason'}: ${reservation.denialReason}`;
    }
    
    Alert.alert(
      language === 'es' ? 'Detalles de la Reserva' : 'Reservation Details',
      details,
      [{ text: 'OK' }]
    );
  };

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation);
    setEditModalVisible(true);
  };

  const handleReservationUpdate = (updatedReservation) => {
    // Update the reservation in the local state
    const updatedReservations = reservations.map(res => 
      res.id === updatedReservation.id ? updatedReservation : res
    );
    
    // Trigger a refresh to get the latest data
    loadReservations();
    
    // Show success message
    Alert.alert(
      t('success') || 'Success',
      language === 'es'
        ? 'Reserva actualizada exitosamente'
        : 'Reservation updated successfully'
    );
  };

  const handleCancelReservation = (reservation) => {
    Alert.alert(
      language === 'es' ? 'Confirmar Cancelación' : 'Confirm Cancellation',
      language === 'es' 
        ? '¿Está seguro de que desea cancelar esta reserva?'
        : 'Are you sure you want to cancel this reservation?',
      [
        {
          text: language === 'es' ? 'No' : 'No',
          style: 'cancel'
        },
        {
          text: language === 'es' ? 'Sí, Cancelar' : 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelReservation(reservation.id);
              await loadReservations();
              Alert.alert(
                t('success') || 'Success',
                language === 'es'
                  ? 'Reserva cancelada exitosamente'
                  : 'Reservation cancelled successfully'
              );
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert(
                t('error') || 'Error',
                language === 'es'
                  ? 'No se pudo cancelar la reserva'
                  : 'Failed to cancel reservation'
              );
            }
          }
        }
      ]
    );
  };

  const renderFilterButton = (filter, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === filter && styles.activeFilterText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    let message = '';
    let icon = 'event-busy';
    
    switch (selectedFilter) {
      case 'upcoming':
        message = language === 'es' 
          ? 'No tienes reservas próximas'
          : 'You have no upcoming reservations';
        icon = 'event-available';
        break;
      case 'past':
        message = language === 'es'
          ? 'No tienes reservas pasadas'
          : 'You have no past reservations';
        icon = 'history';
        break;
      case 'pending':
        message = language === 'es'
          ? 'No tienes reservas pendientes'
          : 'You have no pending reservations';
        icon = 'schedule';
        break;
      case 'cancelled':
        message = language === 'es'
          ? 'No tienes reservas canceladas'
          : 'You have no cancelled reservations';
        icon = 'cancel';
        break;
      default:
        message = language === 'es'
          ? 'No tienes reservas aún'
          : 'You have no reservations yet';
        icon = 'event-note';
    }
    
    return (
      <View style={styles.emptyState}>
        <Icon name={icon} size={64} color={COLORS.text.secondary} />
        <Text style={styles.emptyTitle}>{message}</Text>
        <Text style={styles.emptyText}>
          {language === 'es'
            ? 'Reserva una amenidad para comenzar'
            : 'Book an amenity to get started'}
        </Text>
      </View>
    );
  };

  const renderReservation = ({ item }) => (
    <ReservationCard
      reservation={item}
      onPress={() => handleReservationPress(item)}
      onUpdate={handleReservationUpdate}
      showActions={true}
      isAdmin={false}
    />
  );

  const getStatistics = () => {
    const now = new Date();
    const stats = {
      total: reservations.length,
      upcoming: reservations.filter(r => {
        const startTime = new Date(r.startTime);
        return startTime > now && ['pending', 'approved', 'confirmed'].includes(r.status);
      }).length,
      pending: reservations.filter(r => r.status === 'pending').length,
      completed: reservations.filter(r => r.status === 'completed' || new Date(r.endTime) < now).length
    };
    return stats;
  };

  const stats = getStatistics();

  if (loading && reservations.length === 0) {
    return <LoadingSpinner message={t('loading')} />;
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