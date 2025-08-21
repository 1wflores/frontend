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
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ ADDED: Language support
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator'; // ✅ ADDED: Error translation
import { Localization } from '../../utils/localization'; // ✅ ADDED: Data translation
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { apiClient } from '../../services/apiClient';

const RESERVATION_STATUSES = {
  pending: { labelKey: 'waitingForApproval', color: COLORS.warning, icon: 'schedule' },
  approved: { labelKey: 'confirmed', color: COLORS.success, icon: 'check-circle' },
  rejected: { labelKey: 'notApproved', color: COLORS.error, icon: 'cancel' },
  cancelled: { labelKey: 'cancelled', color: COLORS.text.secondary, icon: 'event-busy' },
  completed: { labelKey: 'completed', color: COLORS.info, icon: 'event-available' },
};

export const AmenityReservationsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { language, t } = useLanguage(); // ✅ ADDED: Language hook
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

  // ✅ ADDED: Get translated amenity name
  const getTranslatedAmenityName = () => {
    return Localization.translateAmenity(amenityName, language);
  };

  // ✅ ADDED: Get translated status
  const getStatusText = (status) => {
    const statusConfig = RESERVATION_STATUSES[status];
    if (!statusConfig) return status;
    
    return t(statusConfig.labelKey) || Localization.translateStatus(status, language);
  };

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
      // ✅ ADDED: Error translation
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = reservations;

    // Apply search filter
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(reservation => {
        const apartmentNumber = ValidationUtils.extractApartmentNumber(reservation.username);
        const username = reservation.username?.toLowerCase() || '';
        
        return apartmentNumber.toLowerCase().includes(searchTerm) ||
               username.includes(searchTerm);
      });
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === selectedFilter);
    }

    setFilteredReservations(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  const handleApprove = async (reservation) => {
    // ✅ ADDED: Approval confirmation with translations
    Alert.alert(
      t('approveReservation') || (language === 'es' ? 'Aprobar Reserva' : 'Approve Reservation'),
      language === 'es'
        ? `¿Está seguro de que desea aprobar esta reserva para ${ValidationUtils.extractApartmentNumber(reservation.username)}?`
        : `Are you sure you want to approve this reservation for ${ValidationUtils.extractApartmentNumber(reservation.username)}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('approve'),
          onPress: async () => {
            try {
              await apiClient.post(`/api/reservations/${reservation.id}/approve`);
              await fetchReservations();
              // ✅ ADDED: Success message translation
              Alert.alert(
                t('success'),
                language === 'es' 
                  ? 'Reserva aprobada exitosamente'
                  : 'Reservation approved successfully'
              );
            } catch (error) {
              console.error('Error approving reservation:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error'), errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleReject = (reservation) => {
    setSelectedReservation(reservation);
    setActionModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      // ✅ ADDED: Validation message translation
      Alert.alert(
        t('error'),
        language === 'es' 
          ? 'Se requiere una razón para rechazar la reserva'
          : 'A reason is required to reject the reservation'
      );
      return;
    }

    try {
      await apiClient.post(`/api/reservations/${selectedReservation.id}/reject`, {
        reason: rejectionReason.trim(),
      });
      await fetchReservations();
      setActionModalVisible(false);
      setRejectionReason('');
      // ✅ ADDED: Success message translation
      Alert.alert(
        t('success'),
        language === 'es'
          ? 'Reserva rechazada exitosamente'
          : 'Reservation rejected successfully'
      );
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error'), errorMessage);
    }
  };

  const handleCancel = async (reservation) => {
    // ✅ ADDED: Cancel confirmation with translations
    Alert.alert(
      t('cancelReservation') || (language === 'es' ? 'Cancelar Reserva' : 'Cancel Reservation'),
      language === 'es'
        ? `¿Está seguro de que desea cancelar esta reserva para ${ValidationUtils.extractApartmentNumber(reservation.username)}?`
        : `Are you sure you want to cancel this reservation for ${ValidationUtils.extractApartmentNumber(reservation.username)}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: language === 'es' ? 'Cancelar Reserva' : 'Cancel Reservation',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post(`/api/reservations/${reservation.id}/cancel`);
              await fetchReservations();
              // ✅ ADDED: Success message translation
              Alert.alert(
                t('success'),
                language === 'es'
                  ? 'Reserva cancelada exitosamente'
                  : 'Reservation cancelled successfully'
              );
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error'), errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderReservationItem = ({ item }) => {
    const apartmentNumber = ValidationUtils.extractApartmentNumber(item.username);
    const statusConfig = RESERVATION_STATUSES[item.status] || {};

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

        <View style={styles.reservationDetails}>
          <View style={styles.detailRow}>
            <Icon name="event" size={16} color={COLORS.text.secondary} />
            {/* ✅ ADDED: Date formatting with language */}
            <Text style={styles.detailText}>
              {DateUtils.formatDate(item.date || item.startTime, language)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {DateUtils.formatTime(item.startTime)} - {DateUtils.formatTime(item.endTime)}
            </Text>
          </View>

          {item.specialRequests?.visitorCount > 0 && (
            <View style={styles.detailRow}>
              <Icon name="people" size={16} color={COLORS.text.secondary} />
              {/* ✅ ADDED: Visitor count translation */}
              <Text style={styles.detailText}>
                {item.specialRequests.visitorCount} {
                  item.specialRequests.visitorCount === 1 
                    ? t('visitor') || (language === 'es' ? 'visitante' : 'visitor')
                    : t('visitors') || (language === 'es' ? 'visitantes' : 'visitors')
                }
              </Text>
            </View>
          )}

          {item.specialRequirements?.grillUsage && (
            <View style={styles.detailRow}>
              <Icon name="outdoor-grill" size={16} color={COLORS.text.secondary} />
              {/* ✅ ADDED: Grill usage translation */}
              <Text style={styles.detailText}>
                {t('grillUsage') || (language === 'es' ? 'Uso de parrilla' : 'Grill usage')}
              </Text>
            </View>
          )}
        </View>

        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(item)}
            >
              <Icon name="check" size={16} color={COLORS.success} />
              {/* ✅ ADDED: Approve button translation */}
              <Text style={[styles.actionText, { color: COLORS.success }]}>
                {t('approve')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item)}
            >
              <Icon name="close" size={16} color={COLORS.error} />
              {/* ✅ ADDED: Reject button translation */}
              <Text style={[styles.actionText, { color: COLORS.error }]}>
                {t('reject') || (language === 'es' ? 'Rechazar' : 'Reject')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'approved' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancel(item)}
            >
              <Icon name="cancel" size={16} color={COLORS.warning} />
              {/* ✅ ADDED: Cancel button translation */}
              <Text style={[styles.actionText, { color: COLORS.warning }]}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-busy" size={64} color={COLORS.text.secondary} />
      {/* ✅ ADDED: Empty state translations */}
      <Text style={styles.emptyTitle}>
        {t('noReservations') || (language === 'es' ? 'Sin Reservas' : 'No Reservations')}
      </Text>
      <Text style={styles.emptyText}>
        {language === 'es'
          ? 'No hay reservas para esta amenidad en este momento.'
          : 'There are no reservations for this amenity at the moment.'}
      </Text>
    </View>
  );

  const filterOptions = [
    { key: 'all', label: t('all') || (language === 'es' ? 'Todas' : 'All') },
    { key: 'pending', label: t('pending') || (language === 'es' ? 'Pendientes' : 'Pending') },
    { key: 'approved', label: t('approved') || (language === 'es' ? 'Aprobadas' : 'Approved') },
    { key: 'rejected', label: t('rejected') || (language === 'es' ? 'Rechazadas' : 'Rejected') },
    { key: 'cancelled', label: t('cancelled') || (language === 'es' ? 'Canceladas' : 'Cancelled') },
    { key: 'completed', label: t('completed') || (language === 'es' ? 'Completadas' : 'Completed') },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {/* ✅ ADDED: Translated amenity name */}
          <Text style={styles.headerTitle}>{getTranslatedAmenityName()}</Text>
          {/* ✅ ADDED: Reservations subtitle translation */}
          <Text style={styles.headerSubtitle}>
            {t('reservations') || (language === 'es' ? 'Reservas' : 'Reservations')}
          </Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Input
          placeholder={t('searchByApartment') || (language === 'es' ? 'Buscar por apartamento...' : 'Search by apartment...')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          style={styles.searchInput}
        />
        
        <View style={styles.filtersContainer}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedFilter === option.key && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === option.key && styles.activeFilterText,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reservations.length}
          </Text>
          {/* ✅ ADDED: Total stat translation */}
          <Text style={styles.statLabel}>
            {t('total') || (language === 'es' ? 'Total' : 'Total')}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reservations.filter(r => r.status === 'pending').length}
          </Text>
          {/* ✅ ADDED: Pending stat translation */}
          <Text style={styles.statLabel}>
            {t('pending') || (language === 'es' ? 'Pendientes' : 'Pending')}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reservations.filter(r => r.status === 'approved').length}
          </Text>
          {/* ✅ ADDED: Approved stat translation */}
          <Text style={styles.statLabel}>
            {t('approved') || (language === 'es' ? 'Aprobadas' : 'Approved')}
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
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              {/* ✅ ADDED: Modal title translation */}
              <Text style={styles.modalTitle}>
                {t('rejectReservation') || (language === 'es' ? 'Rechazar Reserva' : 'Reject Reservation')}
              </Text>
              <TouchableOpacity 
                onPress={() => setActionModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            
            {/* ✅ ADDED: Modal subtitle translation */}
            <Text style={styles.modalSubtitle}>
              {language === 'es'
                ? 'Por favor, proporciona una razón para rechazar esta reserva:'
                : 'Please provide a reason for rejecting this reservation:'}
            </Text>
            
            <Input
              label={t('reason') || (language === 'es' ? 'Razón' : 'Reason')}
              placeholder={language === 'es' ? 'Ingresa la razón aquí...' : 'Enter reason here...'}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              style={styles.reasonInput}
            />
            
            <View style={styles.modalActions}>
              <Button
                title={t('cancel')}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
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