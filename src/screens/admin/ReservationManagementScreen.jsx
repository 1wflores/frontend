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
import { Input } from '../../components/common/Input';
import { useLanguage } from '../../contexts/LanguageContext';
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator';
import { Localization } from '../../utils/localization';
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const ReservationManagementScreen = () => {
  const { language, t } = useLanguage();
  
  // 🚨 FIX: Ensure reservations is always an array
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

  const validateDenialReason = (reason) => {
    if (!reason || reason.trim().length === 0) {
      return language === 'es' 
        ? 'Se requiere una razón para la denegación'
        : 'Denial reason is required';
    }
    
    if (reason.trim().length < 10) {
      return language === 'es' 
        ? 'La razón de denegación debe tener al menos 10 caracteres'
        : 'Denial reason must be at least 10 characters long';
    }
    
    if (reason.trim().length > 500) {
      return language === 'es' 
        ? 'La razón de denegación no puede exceder 500 caracteres'
        : 'Denial reason cannot exceed 500 characters';
    }
    
    return null;
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getAllReservations();
      
      // 🚨 FIX: Ensure data is always an array
      const reservationData = Array.isArray(data) ? data : (data?.reservations || []);
      
      console.log('Fetched reservations:', reservationData);
      setReservations(reservationData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error'), errorMessage);
      
      // 🚨 FIX: Set empty array on error to prevent undefined
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    // 🚨 FIX: Check if reservations is an array before filtering
    if (!Array.isArray(reservations)) {
      console.warn('Reservations is not an array:', reservations);
      setFilteredReservations([]);
      return;
    }

    let filtered = [...reservations]; // Create a copy to avoid mutations

    // Apply search filter
    if (searchQuery) {
      const searchText = searchQuery.toLowerCase();
      filtered = filtered.filter(reservation => {
        const userName = reservation.username || reservation.userId || '';
        const amenityName = reservation.amenityName || '';
        const apartmentId = reservation.apartmentId || '';
        
        return (
          userName.toLowerCase().includes(searchText) ||
          amenityName.toLowerCase().includes(searchText) ||
          Localization.translateAmenity(amenityName, language).toLowerCase().includes(searchText) ||
          apartmentId.toLowerCase().includes(searchText) ||
          reservation.id?.toString().toLowerCase().includes(searchText)
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
      case 'all':
      default:
        // No additional filtering
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
      language === 'es' ? 'Confirmar Aprobación' : 'Confirm Approval',
      language === 'es' 
        ? `¿Está seguro de que desea aprobar esta reserva?`
        : `Are you sure you want to approve this reservation?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('approve'),
          onPress: async () => {
            try {
              setLoading(true);
              await reservationService.updateReservationStatus(reservation.id, 'approved');
              
              Alert.alert(
                t('success'), 
                language === 'es' 
                  ? 'Reserva aprobada exitosamente'
                  : 'Reservation approved successfully',
                [{ 
                  text: t('ok'),
                  onPress: () => fetchReservations()
                }]
              );
            } catch (error) {
              console.error('Error approving reservation:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error'), errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDenyReservation = (reservation) => {
    setSelectedReservation(reservation);
    setDenyModalVisible(true);
  };

  const handleConfirmDeny = async () => {
    const validationError = validateDenialReason(denialReason);
    if (validationError) {
      Alert.alert(
        language === 'es' ? 'Razón de Denegación Inválida' : 'Invalid Denial Reason',
        validationError,
        [{ text: t('ok') }]
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
        t('success'), 
        language === 'es' 
          ? 'Reserva denegada exitosamente'
          : 'Reservation denied successfully',
        [{ 
          text: t('ok'),
          onPress: () => {
            setDenyModalVisible(false);
            setDenialReason('');
            setSelectedReservation(null);
            fetchReservations();
          }
        }]
      );
    } catch (error) {
      console.error('Error denying reservation:', error);
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error'), errorMessage);
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
      <Text style={styles.emptyTitle}>
        {language === 'es' ? 'Sin Reservas' : 'No Reservations'}
      </Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'pending' 
          ? (language === 'es' 
              ? 'No hay reservas pendientes de aprobación.'
              : 'No reservations pending approval.')
          : (searchQuery 
              ? (language === 'es' 
                  ? 'No se encontraron reservas que coincidan con su búsqueda.'
                  : 'No reservations match your search.')
              : (language === 'es' 
                  ? `No hay reservas ${getFilterLabel(selectedFilter).toLowerCase()}.`
                  : `No ${getFilterLabel(selectedFilter).toLowerCase()} reservations.`)
            )
        }
      </Text>
    </View>
  );

  const getFilterLabel = (filterKey) => {
    const labels = {
      en: {
        all: 'All',
        pending: 'Pending',
        approved: 'Approved', 
        denied: 'Denied',
        today: 'Today'
      },
      es: {
        all: 'Todas',
        pending: 'Pendientes',
        approved: 'Aprobadas',
        denied: 'Denegadas', 
        today: 'Hoy'
      }
    };
    return labels[language]?.[filterKey] || labels.en[filterKey] || filterKey;
  };

  const filters = [
    { key: 'pending', label: getFilterLabel('pending') },
    { key: 'all', label: getFilterLabel('all') },
    { key: 'approved', label: getFilterLabel('approved') },
    { key: 'denied', label: getFilterLabel('denied') },
    { key: 'today', label: getFilterLabel('today') },
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
      <Text style={[
        styles.filterText,
        selectedFilter === filter.key && styles.activeFilterText
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  // 🚨 FIX: Add loading check for initial load
  if (loading && (!reservations || reservations.length === 0)) {
    return <LoadingSpinner message={language === 'es' ? 'Cargando reservas...' : 'Loading reservations...'} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          placeholder={language === 'es' 
            ? 'Buscar por usuario, amenidad o ID...'
            : 'Search by user, amenity, or ID...'
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filtersContainer}>
        {filters.map(renderFilterButton)}
      </View>

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
            {reservations.filter(r => DateUtils.isToday(r.startTime)).length}
          </Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Hoy' : 'Today'}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{reservations.length}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Total' : 'Total'}
          </Text>
        </Card>
      </View>

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
        animationType="fade"
        onRequestClose={() => setDenyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'es' ? 'Denegar Reserva' : 'Deny Reservation'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setDenyModalVisible(false)}
              >
                <Icon name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              {language === 'es' 
                ? 'Proporcione una razón para denegar esta reserva:'
                : 'Please provide a reason for denying this reservation:'
              }
            </Text>
            
            <Input
              placeholder={language === 'es' 
                ? 'Ingrese la razón de denegación...'
                : 'Enter denial reason...'
              }
              value={denialReason}
              onChangeText={setDenialReason}
              multiline={true}
              numberOfLines={4}
              style={styles.reasonInput}
            />
            
            <View style={styles.modalActions}>
              <Button
                title={t('cancel')}
                variant="outline"
                onPress={() => setDenyModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title={t('deny')}
                onPress={handleConfirmDeny}
                loading={loading}
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
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    marginBottom: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  filterButton: {
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