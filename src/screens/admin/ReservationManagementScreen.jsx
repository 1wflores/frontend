import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-icons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator';
import { ValidationUtils } from '../../utils/validationUtils';
import { DateUtils } from '../../utils/dateUtils';
import { Localization } from '../../utils/localization';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

// Reservation status configuration
const RESERVATION_STATUSES = {
  pending: {
    icon: 'schedule',
    color: COLORS.warning,
    labelKey: 'pending',
  },
  approved: {
    icon: 'check-circle',
    color: COLORS.success,
    labelKey: 'approved',
  },
  denied: {
    icon: 'cancel',
    color: COLORS.error,
    labelKey: 'denied',
  },
  cancelled: {
    icon: 'cancel',
    color: COLORS.text.secondary,
    labelKey: 'cancelled',
  },
  completed: {
    icon: 'check',
    color: COLORS.info,
    labelKey: 'completed',
  },
};

const ReservationManagementScreen = ({ navigation }) => {
  const { language, t } = useLanguage();
  
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
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, selectedFilter]);

  // FIXED: Enhanced fetchReservations with better error handling and debugging
  const fetchReservations = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching reservations from API...');
      
      const response = await apiClient.get('/api/reservations');
      console.log('📊 Reservations API response:', response);
      console.log('📊 Reservations data sample:', response.data?.slice(0, 2));
      
      let reservationsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          reservationsData = response.data;
        } else if (response.data.reservations && Array.isArray(response.data.reservations)) {
          reservationsData = response.data.reservations;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          reservationsData = response.data.data;
        }
      }

      // FIXED: Debug each reservation for apartment extraction
      reservationsData.forEach((reservation, index) => {
        console.log(`🔍 Reservation ${index}:`, {
          id: reservation.id,
          username: reservation.username,
          userId: reservation.userId,
          user: reservation.user,
          createdBy: reservation.createdBy,
          apartmentExtracted: ValidationUtils.getApartmentFromReservation(reservation)
        });
      });

      setReservations(reservationsData);
      console.log(`✅ Loaded ${reservationsData.length} reservations successfully`);
      
    } catch (error) {
      console.error('❌ Error fetching reservations:', error);
      
      // For development, create sample reservations if API fails
      if (__DEV__ && error.response?.status !== 401) {
        console.log('🧪 Creating sample reservations for development...');
        const sampleReservations = [
          {
            id: '1',
            amenityId: 'lounge',
            amenityName: 'Community Lounge',
            username: 'apartment204',
            user: { username: 'apartment204', id: 'user1' },
            startTime: '2025-08-23T12:30:00.000Z',
            endTime: '2025-08-23T13:30:00.000Z',
            status: 'pending',
            specialRequests: { visitorCount: 5, notes: 'Grill usage requested' },
            createdAt: '2025-08-22T09:15:00.000Z',
            submittedAgo: '1 ago',
          },
          {
            id: '2',
            amenityId: 'jacuzzi',
            amenityName: 'Jacuzzi',
            username: 'apartment301',
            user: { username: 'apartment301', id: 'user2' },
            startTime: '2025-08-24T19:00:00.000Z',
            endTime: '2025-08-24T20:00:00.000Z',
            status: 'approved',
            specialRequests: { visitorCount: 2 },
            createdAt: '2025-08-21T14:30:00.000Z',
            submittedAgo: '2 days ago',
          },
          {
            id: '3',
            amenityId: 'cold-tub',
            amenityName: 'Cold Tub',
            username: 'apartment102',
            user: { username: 'apartment102', id: 'user3' },
            startTime: '2025-08-25T07:00:00.000Z',
            endTime: '2025-08-25T08:00:00.000Z',
            status: 'pending',
            specialRequests: { visitorCount: 1 },
            createdAt: '2025-08-22T06:45:00.000Z',
            submittedAgo: '3 hours ago',
          },
        ];
        setReservations(sampleReservations);
        
        Alert.alert(
          language === 'es' ? 'Modo de Desarrollo' : 'Development Mode',
          language === 'es' 
            ? 'Usando datos de muestra para reservas.'
            : 'Using sample reservation data.'
        );
      } else {
        const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
        Alert.alert(t('error') || 'Error', errorMessage);
        setReservations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = reservations;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(reservation => {
        const apartment = ValidationUtils.getApartmentFromReservation(reservation);
        const amenityName = Localization.translateAmenity(reservation.amenityName, language);
        
        return (
          apartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          amenityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reservation.id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === selectedFilter);
    }

    setFilteredReservations(filtered);
    console.log(`🔍 Filtered ${filtered.length} reservations out of ${reservations.length} total`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  // FIXED: Get translated status text
  const getStatusText = (status) => {
    const statusConfig = RESERVATION_STATUSES[status];
    if (!statusConfig) return status;
    
    return t(statusConfig.labelKey) || Localization.translateStatus(status, language);
  };

  // FIXED: Get translated amenity name
  const getTranslatedAmenityName = (amenityName) => {
    return Localization.translateAmenity(amenityName, language);
  };

  const handleApproveReservation = async (reservation) => {
    try {
      await apiClient.post(`/api/reservations/${reservation.id}/approve`);
      setReservations(prev =>
        prev.map(r => (r.id === reservation.id ? { ...r, status: 'approved' } : r))
      );
      Alert.alert(
        t('success') || 'Success',
        language === 'es'
          ? 'Reserva aprobada exitosamente'
          : 'Reservation approved successfully'
      );
    } catch (error) {
      console.error('Error approving reservation:', error);
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error') || 'Error', errorMessage);
    }
  };

  const handleRejectReservation = (reservation) => {
    setSelectedReservation(reservation);
    setActionModalVisible(true);
  };

  const confirmReject = async () => {
    try {
      await apiClient.post(`/api/reservations/${selectedReservation.id}/reject`, {
        reason: rejectionReason,
      });
      setReservations(prev =>
        prev.map(r => (r.id === selectedReservation.id ? { ...r, status: 'denied' } : r))
      );
      setActionModalVisible(false);
      setRejectionReason('');
      setSelectedReservation(null);
      Alert.alert(
        t('success') || 'Success',
        language === 'es'
          ? 'Reserva rechazada exitosamente'
          : 'Reservation rejected successfully'
      );
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error') || 'Error', errorMessage);
    }
  };

  const handleCancelReservation = (reservation) => {
    Alert.alert(
      language === 'es' ? 'Cancelar Reserva' : 'Cancel Reservation',
      language === 'es'
        ? '¿Está seguro de que desea cancelar esta reserva?'
        : 'Are you sure you want to cancel this reservation?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: language === 'es' ? 'Cancelar Reserva' : 'Cancel Reservation',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post(`/api/reservations/${reservation.id}/cancel`);
              setReservations(prev =>
                prev.map(r => (r.id === reservation.id ? { ...r, status: 'cancelled' } : r))
              );
              Alert.alert(
                t('success') || 'Success',
                language === 'es'
                  ? 'Reserva cancelada exitosamente'
                  : 'Reservation cancelled successfully'
              );
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error') || 'Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderReservationItem = ({ item }) => {
    // FIXED: Use enhanced apartment extraction
    const apartmentNumber = ValidationUtils.getApartmentFromReservation(item);
    const statusConfig = RESERVATION_STATUSES[item.status] || {};
    const translatedAmenityName = getTranslatedAmenityName(item.amenityName);

    return (
      <Card style={styles.reservationCard}>
        <View style={styles.reservationHeader}>
          <View style={styles.userInfo}>
            <Icon name="home" size={20} color={COLORS.primary} />
            <Text style={styles.userName}>{apartmentNumber}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Icon 
              name={statusConfig.icon || 'help'} 
              size={16} 
              color={statusConfig.color || COLORS.text.secondary} 
            />
            <Text style={[styles.statusText, { color: statusConfig.color || COLORS.text.secondary }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.amenityInfo}>
          <Text style={styles.amenityName}>{translatedAmenityName}</Text>
        </View>

        <View style={styles.reservationDetails}>
          <View style={styles.detailRow}>
            <Icon name="event" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailLabel}>
              {language === 'es' ? 'fecha:' : 'date:'}
            </Text>
            <Text style={styles.detailText}>
              {DateUtils.formatDate(item.startTime, language)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailLabel}>
              {language === 'es' ? 'hora:' : 'time:'}
            </Text>
            <Text style={styles.detailText}>
              {DateUtils.formatTime(item.startTime)} - {DateUtils.formatTime(item.endTime)}
            </Text>
          </View>

          {item.specialRequests?.visitorCount > 0 && (
            <View style={styles.detailRow}>
              <Icon name="people" size={16} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>
                {item.specialRequests.visitorCount} {
                  item.specialRequests.visitorCount === 1 
                    ? t('visitor') || (language === 'es' ? 'visitante' : 'visitor')
                    : t('visitors') || (language === 'es' ? 'visitantes' : 'visitors')
                }
              </Text>
            </View>
          )}

          {item.specialRequests?.notes && (
            <View style={styles.detailRow}>
              <Icon name="note" size={16} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>{item.specialRequests.notes}</Text>
            </View>
          )}

          {/* FIXED: Submitted timestamp with translation */}
          <View style={styles.detailRow}>
            <Icon name="access-time" size={16} color={COLORS.text.secondary} />
            <Text style={styles.submittedText}>
              {language === 'es' ? 'enviado hace' : 'submitted'} {item.submittedAgo || DateUtils.formatRelativeTime(item.createdAt, language)}
            </Text>
          </View>
        </View>

        {/* Action buttons for pending reservations */}
        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <Button
              title={t('approve') || (language === 'es' ? 'Aprobar' : 'Approve')}
              onPress={() => handleApproveReservation(item)}
              style={styles.approveButton}
              variant="success"
            />
            <Button
              title={t('deny') || (language === 'es' ? 'Rechazar' : 'Reject')}
              onPress={() => handleRejectReservation(item)}
              style={styles.rejectButton}
              variant="danger"
            />
          </View>
        )}

        {/* Cancel button for approved reservations */}
        {item.status === 'approved' && (
          <View style={styles.actionButtons}>
            <Button
              title={t('cancel') || (language === 'es' ? 'Cancelar' : 'Cancel')}
              onPress={() => handleCancelReservation(item)}
              style={styles.cancelButton}
              variant="outline"
            />
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-note" size={64} color={COLORS.text.secondary} />
      <Text style={styles.emptyTitle}>
        {language === 'es' ? 'No hay Reservas' : 'No Reservations'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'all'
          ? (language === 'es' 
              ? 'No hay reservas que coincidan con los filtros actuales.'
              : 'No reservations match the current filters.')
          : (language === 'es' 
              ? 'No hay reservas en este momento.'
              : 'There are no reservations at the moment.')
        }
      </Text>
    </View>
  );

  const filterOptions = [
    { key: 'all', label: t('all') || (language === 'es' ? 'Todas' : 'All') },
    { key: 'pending', label: t('pending') || (language === 'es' ? 'Pendientes' : 'Pending') },
    { key: 'approved', label: t('approved') || (language === 'es' ? 'Aprobadas' : 'Approved') },
    { key: 'denied', label: t('denied') || (language === 'es' ? 'Rechazadas' : 'Rejected') },
    { key: 'cancelled', label: t('cancelled') || (language === 'es' ? 'Canceladas' : 'Cancelled') },
    { key: 'completed', label: t('completed') || (language === 'es' ? 'Completadas' : 'Completed') },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner 
          message={language === 'es' ? 'Cargando reservas...' : 'Loading reservations...'} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Input
          placeholder={language === 'es' ? 'Buscar por apartamento, amenidad o ID...' : 'Search by apartment, amenity, or ID...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          style={styles.searchInput}
        />
        
        <View style={styles.filtersContainer}>
          {filterOptions.map((filter) => (
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
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reservations.filter(r => r.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Pendientes' : 'Pending'}
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reservations.filter(r => r.status === 'approved').length}
          </Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Aprobadas' : 'Approved'}
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{reservations.length}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Total' : 'Total'}
          </Text>
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

      {/* Rejection Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'es' ? 'Rechazar Reserva' : 'Reject Reservation'}
              </Text>
              <TouchableOpacity
                onPress={() => setActionModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              {language === 'es' 
                ? 'Por favor proporcione una razón para el rechazo:'
                : 'Please provide a reason for rejection:'}
            </Text>
            
            <Input
              placeholder={language === 'es' ? 'Razón del rechazo...' : 'Rejection reason...'}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              style={styles.reasonInput}
            />
            
            <View style={styles.modalActions}>
              <Button
                title={t('cancel') || (language === 'es' ? 'Cancelar' : 'Cancel')}
                variant="outline"
                onPress={() => setActionModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title={t('reject') || (language === 'es' ? 'Rechazar' : 'Reject')}
                variant="danger"
                onPress={confirmReject}
                style={styles.modalButton}
              />
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
    paddingBottom: SPACING.sm,
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
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  amenityInfo: {
    marginBottom: SPACING.sm,
  },
  amenityName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  reservationDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    marginRight: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  submittedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  approveButton: {
    flex: 0.48,
  },
  rejectButton: {
    flex: 0.48,
  },
  cancelButton: {
    flex: 1,
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

export default ReservationManagementScreen;