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
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { reservationService } from '../../services/reservationService';
import { ReservationManagementCard } from '../../components/admin/ReservationManagementCard';
import { Button } from '../../components/common/Button';
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

  // Validation function for denial reason
  const validateDenialReason = (reason) => {
    if (!reason || reason.trim().length === 0) {
      return 'Please provide a reason for denying this reservation';
    }
    
    if (reason.trim().length < 10) {
      return 'Please provide a more detailed justification (at least 10 characters)';
    }
    
    if (reason.trim().length > 500) {
      return 'Denial reason is too long (maximum 500 characters)';
    }
    
    // Check if it's just repeated characters or meaningless
    const uniqueChars = new Set(reason.trim().toLowerCase().replace(/\s/g, '')).size;
    if (uniqueChars < 3) {
      return 'Please provide a valid justification for denying the reservation';
    }
    
    return null; // No error
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      // Use real API call
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
              await reservationService.updateReservationStatus(reservation.id, 'approved');
              Alert.alert('Success', 'Reservation approved successfully');
              await fetchReservations();
            } catch (error) {
              console.error('Error approving reservation:', error);
              Alert.alert('Error', 'Failed to approve reservation');
            }
          }
        }
      ]
    );
  };

  const handleDenyReservation = (reservation) => {
    setSelectedReservation(reservation);
    setDenialReason(''); // Reset the reason
    setDenyModalVisible(true);
  };

  const submitDenial = async () => {
    // Validate the denial reason
    const validationError = validateDenialReason(denialReason);
    
    if (validationError) {
      Alert.alert(
        'Invalid Denial Reason',
        validationError,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      
      await reservationService.updateReservationStatus(
        selectedReservation.id, 
        'denied', 
        denialReason.trim()
      );
      
      Alert.alert(
        'Success', 
        'Reservation denied successfully',
        [{ 
          text: 'OK',
          onPress: () => {
            setDenyModalVisible(false);
            setDenialReason('');
            setSelectedReservation(null);
            fetchReservations(); // Refresh the list
          }
        }]
      );
    } catch (error) {
      console.error('Error denying reservation:', error);
      Alert.alert(
        'Error', 
        'Failed to deny reservation. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderReservationItem = ({ item }) => (
    <ReservationManagementCard
      reservation={item}
      onApprove={() => handleApproveReservation(item)}
      onDeny={() => handleDenyReservation(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-available" size={64} color={COLORS.text.secondary} />
      <Text style={styles.emptyTitle}>No Reservations</Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'pending' 
          ? 'No pending reservations to review'
          : 'No reservations found for the selected filter'}
      </Text>
    </View>
  );

  const filterButtons = [
    { key: 'pending', label: 'Pending', icon: 'hourglass-empty' },
    { key: 'approved', label: 'Approved', icon: 'check-circle' },
    { key: 'denied', label: 'Denied', icon: 'cancel' },
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'all', label: 'All', icon: 'list' },
  ];

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading reservations..." />;
  }

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Icon name="hourglass-empty" size={24} color={COLORS.warning} />
          <Text style={styles.statNumber}>
            {reservations.filter(r => r.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.statNumber}>
            {reservations.filter(r => r.status === 'approved' && DateUtils.isToday(r.startTime)).length}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Icon name="event" size={24} color={COLORS.primary} />
          <Text style={styles.statNumber}>
            {reservations.length}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </Card>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {filterButtons.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.activeFilterButton
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Icon 
              name={filter.icon} 
              size={18} 
              color={selectedFilter === filter.key ? COLORS.surface : COLORS.text.secondary}
            />
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
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

      {/* Denial Modal */}
      <Modal
        visible={denyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDenyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Deny Reservation</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setDenyModalVisible(false);
                  setDenialReason('');
                }}
              >
                <Icon name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            {selectedReservation && (
              <>
                <Text style={styles.modalSubtitle}>
                  Reservation for {selectedReservation.amenityName || 'Amenity'} by{' '}
                  {selectedReservation.username || selectedReservation.userId}
                </Text>
                
                <View style={styles.denialReasonContainer}>
                  <Text style={styles.inputLabel}>
                    Reason for Denial <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.denialInput,
                      denialReason.trim().length > 0 && denialReason.trim().length < 10 && styles.inputError
                    ]}
                    placeholder="Please provide a detailed justification for denying this reservation..."
                    value={denialReason}
                    onChangeText={setDenialReason}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    textAlignVertical="top"
                  />
                  <View style={styles.inputHelperContainer}>
                    <Text style={[
                      styles.characterCount,
                      denialReason.trim().length > 450 && styles.characterCountWarning
                    ]}>
                      {denialReason.length}/500 characters
                    </Text>
                    {denialReason.trim().length > 0 && denialReason.trim().length < 10 && (
                      <Text style={styles.errorText}>
                        Minimum 10 characters required
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    onPress={() => {
                      setDenyModalVisible(false);
                      setDenialReason('');
                    }}
                    variant="outline"
                    style={styles.modalButton}
                  />
                  <Button
                    title={loading ? "Denying..." : "Confirm Denial"}
                    onPress={submitDenial}
                    variant="danger"
                    style={styles.modalButton}
                    disabled={loading || !denialReason.trim() || denialReason.trim().length < 10}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-around',
    padding: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    padding: SPACING.md,
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
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    justifyContent: 'space-around',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs / 2,
    fontWeight: '600',
  },
  activeFilterText: {
    color: COLORS.surface,
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
  denialReasonContainer: {
    marginVertical: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  denialInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    backgroundColor: COLORS.surface,
    minHeight: 100,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputHelperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  characterCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
  characterCountWarning: {
    color: COLORS.warning,
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 0.48,
  },
});

export default ReservationManagementScreen;