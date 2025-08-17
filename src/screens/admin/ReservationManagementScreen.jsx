import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { reservationService } from '../../services/reservationService'; // ✅ Use real service
import { ReservationManagementCard } from '../../components/admin/ReservationManagementCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const ReservationManagementScreen = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [denyModalVisible, setDenyModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, selectedFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      // ✅ FIXED: Use real API call instead of mock data
      const response = await reservationService.getAllReservations();
      setReservations(response.reservations || []);
      
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Error', 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = reservations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(reservation => {
        const searchText = searchQuery.toLowerCase();
        const apartmentId = reservation.username || reservation.userId || '';
        const amenityName = reservation.amenityName || reservation.amenityId || '';
        
        return (
          apartmentId.toLowerCase().includes(searchText) ||
          amenityName.toLowerCase().includes(searchText) ||
          reservation.id.toLowerCase().includes(searchText)
        );
      });
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'pending':
        filtered = filtered.filter(r => r.status === 'pending');
        break;
      case 'approved':
        filtered = filtered.filter(r => r.status === 'approved');
        break;
      case 'denied':
        filtered = filtered.filter(r => r.status === 'denied');
        break;
      case 'today':
        filtered = filtered.filter(r => DateUtils.isToday(r.startTime));
        break;
    }

    // Sort by priority (pending first, then by start time)
    filtered.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    setFilteredReservations(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  const handleApproveReservation = async (reservation) => {
    Alert.alert(
      'Approve Reservation',
      `Approve reservation for apartment ${reservation.username || reservation.userId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              // ✅ FIXED: Use real API call
              await reservationService.updateReservationStatus(reservation.id, 'approved');
              Alert.alert('Success', 'Reservation approved successfully');
              await fetchReservations(); // Refresh data
            } catch (error) {
              console.error('Error approving reservation:', error);
              Alert.alert('Error', 'Failed to approve reservation');
            }
          },
        },
      ]
    );
  };

  const handleDenyReservation = (reservation) => {
    setSelectedReservation(reservation);
    setDenyModalVisible(true);
  };

  const submitDenial = async () => {
    if (!denialReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for denial');
      return;
    }

    if (!selectedReservation) return;

    try {
      // ✅ FIXED: Use real API call
      await reservationService.updateReservationStatus(
        selectedReservation.id, 
        'denied', 
        denialReason.trim()
      );
      
      Alert.alert('Success', 'Reservation denied successfully');
      await fetchReservations(); // Refresh data
      
    } catch (error) {
      console.error('Error denying reservation:', error);
      Alert.alert('Error', 'Failed to deny reservation');
    } finally {
      setDenyModalVisible(false);
      setSelectedReservation(null);
      setDenialReason('');
    }
  };

  const handleCancelReservation = async (reservation) => {
    const apartmentId = reservation.username || reservation.userId;
    Alert.alert(
      'Cancel Reservation',
      `Cancel this approved reservation for ${apartmentId}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ FIXED: Use real API call
              await reservationService.cancelReservation(reservation.id);
              Alert.alert('Success', 'Reservation cancelled successfully');
              await fetchReservations(); // Refresh data
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (reservation) => {
    Alert.alert(
      'Reservation Details',
      `Detailed view for reservation ${reservation.id.slice(0, 8)} will be implemented in a future update.`,
      [{ text: 'OK' }]
    );
  };

  const filters = [
    { key: 'pending', label: 'Pending', count: reservations.filter(r => r.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: reservations.filter(r => r.status === 'approved').length },
    { key: 'denied', label: 'Denied', count: reservations.filter(r => r.status === 'denied').length },
    { key: 'today', label: 'Today', count: reservations.filter(r => DateUtils.isToday(r.startTime)).length },
    { key: 'all', label: 'All', count: reservations.length },
  ];

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
    <ReservationManagementCard
      reservation={item}
      onApprove={() => handleApproveReservation(item)}
      onDeny={() => handleDenyReservation(item)}
      onCancel={() => handleCancelReservation(item)}
      onViewDetails={() => handleViewDetails(item)}
    />
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyState}>
      <Icon name="event-available" size={64} color={COLORS.text.secondary} />
      <Text style={styles.emptyTitle}>No Reservations</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'all'
          ? 'No reservations match your current filters.'
          : 'No reservations have been made yet.'}
      </Text>
    </Card>
  );

  const renderDenyModal = () => (
    <Modal
      visible={denyModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setDenyModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Deny Reservation</Text>
            <TouchableOpacity
              onPress={() => setDenyModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Icon name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Please provide a reason for denying this reservation:
          </Text>
          
          <Input
            label="Denial Reason"
            placeholder="e.g., Facility under maintenance, Double booking, etc."
            value={denialReason}
            onChangeText={setDenialReason}
            multiline
            numberOfLines={3}
            style={styles.denialInput}
          />
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setDenyModalVisible(false)}
              style={styles.modalButton}
            />
            <Button
              title="Deny Reservation"
              variant="danger"
              onPress={submitDenial}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && reservations.length === 0) {
    return <LoadingSpinner message="Loading reservations..." />;
  }

  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <View style={styles.container}>
      {/* Priority Alert */}
      {pendingCount > 0 && (
        <View style={styles.priorityAlert}>
          <Icon name="priority-high" size={20} color={COLORS.warning} />
          <Text style={styles.priorityText}>
            {pendingCount} reservation{pendingCount > 1 ? 's' : ''} pending approval
          </Text>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by apartment, amenity, or ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map(renderFilterButton)}
      </View>

      {/* Reservations List */}
      <FlatList
        data={filteredReservations}
        renderItem={renderReservationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Deny Modal */}
      {renderDenyModal()}
    </View>
  );
};

// Styles remain the same as they're already correct
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  priorityAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warning,
  },
  priorityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    marginBottom: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: SPACING.xs,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
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
  listContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    margin: SPACING.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  denialInput: {
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.48,
  },
});

export default ReservationManagementScreen;