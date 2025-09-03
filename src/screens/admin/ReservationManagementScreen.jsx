// src/screens/admin/ReservationManagementScreen.jsx - ENHANCED with chronological ordering

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useReservations } from '../../hooks/useReservations';
import { DateUtils } from '../../utils/dateUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const ReservationManagementScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const { 
    reservations: allReservations, 
    loading, 
    error,
    fetchAllReservations,
    approveReservation,
    denyReservation,
    updateReservationStatus 
  } = useReservations();

  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('pending'); // Default to pending requests
  const [refreshing, setRefreshing] = useState(false);
  const [processingReservations, setProcessingReservations] = useState(new Set());

  // Filter options
  const filterOptions = [
    { key: 'pending', label: language === 'es' ? 'Pendientes' : 'Pending', color: COLORS.warning },
    { key: 'all', label: language === 'es' ? 'Todos' : 'All', color: COLORS.primary },
    { key: 'today', label: language === 'es' ? 'Hoy' : 'Today', color: COLORS.success },
    { key: 'lounge', label: language === 'es' ? 'Salón' : 'Lounge', color: COLORS.accent },
  ];

  // Load reservations on mount
  useEffect(() => {
    loadReservations();
  }, []);

  // Filter reservations when data or filter changes
  useEffect(() => {
    filterReservations();
  }, [allReservations, selectedFilter]);

  const loadReservations = async (forceRefresh = false) => {
    try {
      await fetchAllReservations(forceRefresh, {
        includePastReservations: true // Include past reservations for full admin view
      });
    } catch (error) {
      console.error('Error loading reservations:', error);
      Alert.alert(
        t('error') || 'Error',
        language === 'es' 
          ? 'Error al cargar las reservas'
          : 'Error loading reservations'
      );
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadReservations(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filterReservations = () => {
    if (!allReservations || allReservations.length === 0) {
      setFilteredReservations([]);
      return;
    }

    let filtered = [...allReservations];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Apply filters
    switch (selectedFilter) {
      case 'pending':
        filtered = filtered.filter(r => r.status === 'pending');
        break;
      case 'today':
        filtered = filtered.filter(r => {
          const reservationDate = new Date(r.startTime);
          const reservationDay = new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate());
          return reservationDay.getTime() === today.getTime();
        });
        break;
      case 'lounge':
        filtered = filtered.filter(r => 
          r.amenityType === 'lounge' || 
          (r.amenityName && r.amenityName.toLowerCase().includes('lounge'))
        );
        break;
      case 'all':
      default:
        // No additional filtering
        break;
    }

    // **ENHANCED: Sort by creation date (chronological order) with same-day prioritization**
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      // For same day reservations, show submission order clearly
      const dayA = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
      const dayB = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
      
      if (dayA.getTime() === dayB.getTime()) {
        // Same day - sort by submission time (earliest first)
        return dateA.getTime() - dateB.getTime();
      } else {
        // Different days - most recent day first, but within each day chronological
        return dateB.getTime() - dateA.getTime();
      }
    });

    // **NEW: Add submission order indicators for same-day requests**
    const enrichedReservations = filtered.map((reservation, index) => {
      const sameDayReservations = filtered.filter(r => {
        const rDate = new Date(r.createdAt);
        const currentDate = new Date(reservation.createdAt);
        return rDate.getFullYear() === currentDate.getFullYear() &&
               rDate.getMonth() === currentDate.getMonth() &&
               rDate.getDate() === currentDate.getDate();
      });

      if (sameDayReservations.length > 1) {
        // Find the order within the same day
        const dayIndex = sameDayReservations.findIndex(r => r.id === reservation.id);
        return {
          ...reservation,
          submissionOrder: dayIndex + 1,
          totalSameDayRequests: sameDayReservations.length,
          isFirstOfDay: dayIndex === 0,
          isMultipleRequestDay: true
        };
      } else {
        return {
          ...reservation,
          isMultipleRequestDay: false
        };
      }
    });

    setFilteredReservations(enrichedReservations);
  };

  const handleApproveReservation = async (reservation) => {
    if (processingReservations.has(reservation.id)) return;

    Alert.alert(
      language === 'es' ? 'Confirmar Aprobación' : 'Confirm Approval',
      language === 'es' 
        ? `¿Aprobar la reserva de ${reservation.username || 'Usuario'} para ${reservation.amenityName}?`
        : `Approve reservation for ${reservation.username || 'User'} at ${reservation.amenityName}?`,
      [
        {
          text: language === 'es' ? 'Cancelar' : 'Cancel',
          style: 'cancel'
        },
        {
          text: language === 'es' ? 'Aprobar' : 'Approve',
          onPress: async () => {
            setProcessingReservations(prev => new Set([...prev, reservation.id]));
            try {
              await approveReservation(reservation.id);
              Alert.alert(
                language === 'es' ? 'Aprobada' : 'Approved',
                language === 'es' ? 'Reserva aprobada exitosamente' : 'Reservation approved successfully'
              );
              await loadReservations(true);
            } catch (error) {
              Alert.alert(
                t('error') || 'Error',
                language === 'es' 
                  ? 'Error al aprobar la reserva'
                  : 'Error approving reservation'
              );
            } finally {
              setProcessingReservations(prev => {
                const updated = new Set(prev);
                updated.delete(reservation.id);
                return updated;
              });
            }
          }
        }
      ]
    );
  };

  const handleRejectReservation = async (reservation) => {
    if (processingReservations.has(reservation.id)) return;

    Alert.alert(
      language === 'es' ? 'Confirmar Rechazo' : 'Confirm Rejection',
      language === 'es' 
        ? `¿Rechazar la reserva de ${reservation.username || 'Usuario'}?`
        : `Reject reservation for ${reservation.username || 'User'}?`,
      [
        {
          text: language === 'es' ? 'Cancelar' : 'Cancel',
          style: 'cancel'
        },
        {
          text: language === 'es' ? 'Rechazar' : 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingReservations(prev => new Set([...prev, reservation.id]));
            try {
              await denyReservation(reservation.id, 'Rejected by administrator');
              Alert.alert(
                language === 'es' ? 'Rechazada' : 'Rejected',
                language === 'es' ? 'Reserva rechazada' : 'Reservation rejected'
              );
              await loadReservations(true);
            } catch (error) {
              Alert.alert(
                t('error') || 'Error',
                language === 'es' 
                  ? 'Error al rechazar la reserva'
                  : 'Error rejecting reservation'
              );
            } finally {
              setProcessingReservations(prev => {
                const updated = new Set(prev);
                updated.delete(reservation.id);
                return updated;
              });
            }
          }
        }
      ]
    );
  };

  const handleCancelReservation = async (reservation) => {
    if (processingReservations.has(reservation.id)) return;

    Alert.alert(
      language === 'es' ? 'Confirmar Cancelación' : 'Confirm Cancellation',
      language === 'es' 
        ? `¿Cancelar la reserva de ${reservation.username || 'Usuario'}?`
        : `Cancel reservation for ${reservation.username || 'User'}?`,
      [
        {
          text: language === 'es' ? 'No' : 'No',
          style: 'cancel'
        },
        {
          text: language === 'es' ? 'Cancelar Reserva' : 'Cancel Reservation',
          style: 'destructive',
          onPress: async () => {
            setProcessingReservations(prev => new Set([...prev, reservation.id]));
            try {
              await updateReservationStatus(reservation.id, 'cancelled');
              Alert.alert(
                language === 'es' ? 'Cancelada' : 'Cancelled',
                language === 'es' ? 'Reserva cancelada' : 'Reservation cancelled'
              );
              await loadReservations(true);
            } catch (error) {
              Alert.alert(
                t('error') || 'Error',
                language === 'es' 
                  ? 'Error al cancelar la reserva'
                  : 'Error cancelling reservation'
              );
            } finally {
              setProcessingReservations(prev => {
                const updated = new Set(prev);
                updated.delete(reservation.id);
                return updated;
              });
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'approved': return COLORS.success;
      case 'denied': return COLORS.error;
      case 'cancelled': return COLORS.text.secondary;
      default: return COLORS.primary;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: language === 'es' ? 'Pendiente' : 'Pending',
      approved: language === 'es' ? 'Aprobada' : 'Approved',
      denied: language === 'es' ? 'Rechazada' : 'Denied',
      cancelled: language === 'es' ? 'Cancelada' : 'Cancelled',
    };
    return labels[status] || status;
  };

  const renderReservationItem = ({ item }) => {
    const isLounge = item.amenityType === 'lounge' || 
                    (item.amenityName && item.amenityName.toLowerCase().includes('lounge'));
    const isProcessing = processingReservations.has(item.id);

    return (
      <Card style={[
        styles.reservationCard,
        isLounge && styles.loungeCard,
        item.isFirstOfDay && styles.firstRequestCard
      ]}>
        {/* **NEW: Submission order indicator for same-day multiple requests** */}
        {item.isMultipleRequestDay && (
          <View style={[
            styles.submissionOrderBadge,
            item.isFirstOfDay && styles.firstSubmissionBadge
          ]}>
            <Icon 
              name={item.isFirstOfDay ? 'flag' : 'schedule'} 
              size={12} 
              color={COLORS.white} 
            />
            <Text style={styles.submissionOrderText}>
              {item.isFirstOfDay 
                ? (language === 'es' ? '1° ENVIADA' : '1ST SUBMITTED')
                : `${item.submissionOrder}/${item.totalSameDayRequests}`
              }
            </Text>
          </View>
        )}

        {/* User and Amenity Info */}
        <View style={styles.reservationHeader}>
          <View style={styles.userInfo}>
            <Icon name="person" size={18} color={COLORS.primary} />
            <Text style={styles.username}>{item.username || 'Unknown User'}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.amenityInfo}>
          <Icon name={isLounge ? 'weekend' : 'place'} size={20} color={COLORS.text.primary} />
          <Text style={styles.amenityName}>{item.amenityName}</Text>
          {isLounge && (
            <View style={styles.loungeIndicator}>
              <Text style={styles.loungeText}>
                {language === 'es' ? 'SALÓN' : 'LOUNGE'}
              </Text>
            </View>
          )}
        </View>

        {/* Reservation Details */}
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

          {/* Lounge-specific details */}
          {isLounge && item.visitorCount > 0 && (
            <View style={styles.detailRow}>
              <Icon name="people" size={16} color={COLORS.text.secondary} />
              <Text style={styles.detailText}>
                {item.visitorCount} {
                  item.visitorCount === 1 
                    ? (language === 'es' ? 'visitante' : 'visitor')
                    : (language === 'es' ? 'visitantes' : 'visitors')
                }
              </Text>
            </View>
          )}

          {isLounge && item.willUseGrill && (
            <View style={styles.detailRow}>
              <Icon name="outdoor_grill" size={16} color={COLORS.warning} />
              <Text style={styles.detailText}>
                {language === 'es' ? 'Usará parrilla' : 'Will use grill'}
              </Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.detailRow}>
              <Icon name="note" size={16} color={COLORS.text.secondary} />
              <Text style={styles.detailText} numberOfLines={2}>{item.notes}</Text>
            </View>
          )}

          {/* **ENHANCED: Submission timestamp with better formatting** */}
          <View style={styles.detailRow}>
            <Icon name="access-time" size={16} color={COLORS.text.secondary} />
            <Text style={styles.submittedText}>
              {language === 'es' ? 'enviado' : 'submitted'} {DateUtils.formatRelativeTime(item.createdAt, language)}
            </Text>
            {item.isFirstOfDay && (
              <Text style={styles.firstSubmissionText}>
                {language === 'es' ? '• primera del día' : '• first of day'}
              </Text>
            )}
          </View>
        </View>

        {/* Action buttons */}
        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <Button
              title={language === 'es' ? 'Aprobar' : 'Approve'}
              onPress={() => handleApproveReservation(item)}
              style={styles.approveButton}
              variant="success"
              loading={isProcessing}
              disabled={isProcessing}
            />
            <Button
              title={language === 'es' ? 'Rechazar' : 'Reject'}
              onPress={() => handleRejectReservation(item)}
              style={styles.rejectButton}
              variant="danger"
              loading={isProcessing}
              disabled={isProcessing}
            />
          </View>
        )}

        {item.status === 'approved' && (
          <View style={styles.actionButtons}>
            <Button
              title={language === 'es' ? 'Cancelar' : 'Cancel'}
              onPress={() => handleCancelReservation(item)}
              style={styles.cancelButton}
              variant="secondary"
              loading={isProcessing}
              disabled={isProcessing}
            />
          </View>
        )}
      </Card>
    );
  };

  if (loading && filteredReservations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>
          {language === 'es' ? 'Cargando reservas...' : 'Loading reservations...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && { backgroundColor: filter.color }
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
            {/* Show count for pending requests */}
            {filter.key === 'pending' && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {allReservations?.filter(r => r.status === 'pending').length || 0}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Reservations List */}
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservationItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="event_note" size={64} color={COLORS.text.secondary} />
            <Text style={styles.emptyText}>
              {language === 'es' ? 'No hay reservas para mostrar' : 'No reservations to show'}
            </Text>
            {selectedFilter === 'pending' && (
              <Text style={styles.emptySubtext}>
                {language === 'es' 
                  ? 'Las nuevas solicitudes aparecerán aquí'
                  : 'New requests will appear here'
                }
              </Text>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border?.light || '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 8,
    marginHorizontal: 2,
    position: 'relative',
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: SPACING.md,
  },
  reservationCard: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  loungeCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  firstRequestCard: {
    shadowColor: COLORS.success,
    shadowOpacity: 0.1,
    elevation: 8,
  },
  submissionOrderBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  firstSubmissionBadge: {
    backgroundColor: COLORS.success,
  },
  submissionOrderText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 2,
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
  username: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  amenityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  amenityName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  loungeIndicator: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loungeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  reservationDetails: {
    marginBottom: SPACING.md,
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
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  },
  firstSubmissionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  approveButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  errorContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background?.error || '#FFEBEE',
    margin: SPACING.md,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});

export default ReservationManagementScreen;