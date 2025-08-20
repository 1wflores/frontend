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
import { useRoute, useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { apiClient } from '../../services/apiClient';

const RESERVATION_STATUSES = {
  pending: { label: 'Pending', color: COLORS.warning, icon: 'schedule' },
  approved: { label: 'Approved', color: COLORS.success, icon: 'check-circle' },
  rejected: { label: 'Rejected', color: COLORS.error, icon: 'cancel' },
  cancelled: { label: 'Cancelled', color: COLORS.text.secondary, icon: 'event-busy' },
  completed: { label: 'Completed', color: COLORS.info, icon: 'event-available' },
};

export const AmenityReservationsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { amenityId, amenityName } = route.params;

  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [amenityId]);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, selectedFilter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/reservations/amenity/${amenityId}`);
      
      if (response.data.success) {
        setReservations(response.data.data.reservations || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Fetch reservations error:', error);
      Alert.alert(
        'Error',
        'Failed to load reservations. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  const filterReservations = () => {
    let filtered = reservations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(reservation =>
        reservation.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.userName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(r => r.status === selectedFilter);
    }

    setFilteredReservations(filtered);
  };

  const handleReservationAction = (reservation, action) => {
    setSelectedReservation(reservation);
    
    if (action === 'approve') {
      updateReservationStatus(reservation.id, 'approved');
    } else if (action === 'reject') {
      setActionModalVisible(true);
    } else if (action === 'cancel') {
      Alert.alert(
        'Cancel Reservation',
        `Are you sure you want to cancel this reservation?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => updateReservationStatus(reservation.id, 'cancelled'),
          },
        ]
      );
    }
  };

  const updateReservationStatus = async (reservationId, newStatus, reason = '') => {
    try {
      const response = await apiClient.patch(`/api/reservations/${reservationId}/status`, {
        status: newStatus,
        adminNotes: reason,
      });

      if (response.data.success) {
        Alert.alert('Success', `Reservation ${newStatus} successfully`);
        fetchReservations(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to update reservation');
      }
    } catch (error) {
      console.error('Update reservation status error:', error);
      Alert.alert(
        'Error',
        'Failed to update reservation status. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    updateReservationStatus(selectedReservation.id, 'rejected', rejectionReason);
    setActionModalVisible(false);
    setRejectionReason('');
    setSelectedReservation(null);
  };

  const getStatusInfo = (status) => {
    return RESERVATION_STATUSES[status] || { 
      label: status, 
      color: COLORS.text.secondary, 
      icon: 'help' 
    };
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'completed', label: 'Completed' },
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
    </TouchableOpacity>
  );

  const renderReservationItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const canApprove = item.status === 'pending';
    const canReject = item.status === 'pending';
    const canCancel = ['pending', 'approved'].includes(item.status);

    return (
      <Card style={styles.reservationCard}>
        <View style={styles.reservationHeader}>
          <View style={styles.userInfo}>
            <Icon name="person" size={20} color={COLORS.primary} />
            <Text style={styles.userName}>
              {item.userName || item.userId}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Icon name={statusInfo.icon} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.reservationDetails}>
          <View style={styles.detailRow}>
            <Icon name="event" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {DateUtils.formatDate(item.date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {item.startTime} - {item.endTime}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="group" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {item.partySize} {item.partySize === 1 ? 'person' : 'people'}
            </Text>
          </View>

          {item.specialRequests && (
            <View style={styles.detailRow}>
              <Icon name="comment" size={16} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>
                {item.specialRequests}
              </Text>
            </View>
          )}

          {item.adminNotes && (
            <View style={styles.detailRow}>
              <Icon name="admin-panel-settings" size={16} color={COLORS.warning} />
              <Text style={styles.detailText}>
                Admin: {item.adminNotes}
              </Text>
            </View>
          )}
        </View>

        {(canApprove || canReject || canCancel) && (
          <View style={styles.actionButtons}>
            {canApprove && (
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleReservationAction(item, 'approve')}
              >
                <Icon name="check" size={16} color={COLORS.success} />
                <Text style={[styles.actionText, { color: COLORS.success }]}>
                  Approve
                </Text>
              </TouchableOpacity>
            )}

            {canReject && (
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReservationAction(item, 'reject')}
              >
                <Icon name="close" size={16} color={COLORS.error} />
                <Text style={[styles.actionText, { color: COLORS.error }]}>
                  Reject
                </Text>
              </TouchableOpacity>
            )}

            {canCancel && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleReservationAction(item, 'cancel')}
              >
                <Icon name="event-busy" size={16} color={COLORS.warning} />
                <Text style={[styles.actionText, { color: COLORS.warning }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Card style={styles.emptyState}>
      <Icon name="event-busy" size={64} color={COLORS.text.secondary} />
      <Text style={styles.emptyTitle}>No Reservations Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'all'
          ? 'No reservations match your current filters.'
          : 'This amenity has no reservations yet.'}
      </Text>
    </Card>
  );

  const renderRejectionModal = () => (
    <Modal
      visible={actionModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setActionModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reject Reservation</Text>
            <TouchableOpacity
              onPress={() => setActionModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Icon name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            Please provide a reason for rejecting this reservation:
          </Text>
          
          <Input
            label="Rejection Reason"
            placeholder="e.g., Amenity under maintenance, scheduling conflict..."
            value={rejectionReason}
            onChangeText={setRejectionReason}
            multiline
            numberOfLines={3}
            style={styles.reasonInput}
          />
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setActionModalVisible(false)}
              style={styles.modalButton}
            />
            <Button
              title="Reject Reservation"
              variant="danger"
              onPress={submitRejection}
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{amenityName}</Text>
          <Text style={styles.headerSubtitle}>Reservations</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by user..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          style={styles.searchInput}
        />
        
        <View style={styles.filtersContainer}>
          {filters.map(renderFilterButton)}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{reservations.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reservations.filter(r => r.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reservations.filter(r => r.status === 'approved').length}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reservations.filter(r => ['rejected', 'cancelled'].includes(r.status)).length}
          </Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </Card>
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

      {renderRejectionModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    marginBottom: SPACING.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
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
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingTop: 0,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    padding: SPACING.sm,
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
  listContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  reservationCard: {
    marginBottom: SPACING.md,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  reservationDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs / 2,
  },
  detailText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  approveButton: {
    backgroundColor: COLORS.success + '10',
  },
  rejectButton: {
    backgroundColor: COLORS.error + '10',
  },
  cancelButton: {
    backgroundColor: COLORS.warning + '10',
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
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
  reasonInput: {
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

export default AmenityReservationsScreen;