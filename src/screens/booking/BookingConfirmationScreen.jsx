import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth'; // ✅ NEW: Get current user
import { reservationService } from '../../services/reservationService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const BookingConfirmationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { reservationId } = route.params || {};
  const { t, language } = useLanguage();
  const { user } = useAuth(); // ✅ NEW: Get current user for apartment display
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('BookingConfirmationScreen loaded with reservationId:', reservationId);

  useEffect(() => {
    if (reservationId) {
      loadReservation();
    } else {
      console.log('No reservationId provided');
      setLoading(false);
    }
  }, [reservationId]);

  const loadReservation = async () => {
    try {
      console.log('Starting to load reservation for ID:', reservationId);
      
      // ✅ ENHANCED: Try multiple methods to get reservation data
      let foundReservation = null;
      
      try {
        foundReservation = await reservationService.getReservationById(reservationId);
        console.log('Found reservation by ID:', foundReservation);
      } catch (error) {
        console.log('Failed to get reservation by ID, trying user reservations:', error.message);
        
        // Fallback to searching user reservations
        const response = await reservationService.getUserReservations();
        console.log('User reservations response:', response);
        
        const userReservations = response.reservations || [];
        console.log('User reservations:', userReservations);
        
        foundReservation = userReservations.find((r) => r.id === reservationId);
        console.log('Found reservation in user list:', foundReservation);
      }
      
      if (foundReservation) {
        setReservation(foundReservation);
        console.log('Reservation set successfully');
      } else {
        console.log('No matching reservation found for ID:', reservationId);
      }
    } catch (error) {
      console.error('Error loading reservation:', error);
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  const handleViewReservations = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Reservations' } }],
    });
  };

  const handleBookAnother = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Amenities' } }],
    });
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  if (loading) {
    return <LoadingSpinner message={language === 'es' ? 'Cargando confirmación...' : 'Loading confirmation...'} />;
  }

  if (!reservationId) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Icon name="error" size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>
            {language === 'es' ? 'Solicitud Inválida' : 'Invalid Request'}
          </Text>
          <Text style={styles.errorText}>
            {language === 'es' 
              ? 'No se proporcionó ID de reserva. Por favor intente reservar de nuevo.'
              : 'No reservation ID was provided. Please try booking again.'
            }
          </Text>
          <View style={styles.errorActions}>
            <Button
              title={t('bookAmenity')}
              onPress={handleBookAnother}
              style={styles.errorButton}
            />
            <Button
              title={language === 'es' ? 'Ir al Panel Principal' : 'Go to Dashboard'}
              variant="outline"
              onPress={handleGoHome}
              style={styles.errorButton}
            />
          </View>
        </Card>
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Icon name="error" size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>
            {language === 'es' ? 'Reserva No Encontrada' : 'Reservation Not Found'}
          </Text>
          <Text style={styles.errorText}>
            {language === 'es' 
              ? 'No pudimos encontrar su reserva. Por favor verifique sus reservas o intente de nuevo.'
              : 'We couldn\'t find your reservation. Please check your bookings or try again.'
            }
          </Text>
          <View style={styles.errorActions}>
            <Button
              title={language === 'es' ? 'Ver Mis Reservas' : 'View My Reservations'}
              onPress={handleViewReservations}
              style={styles.errorButton}
            />
            <Button
              title={language === 'es' ? 'Ir al Panel Principal' : 'Go to Dashboard'}
              variant="outline"
              onPress={handleGoHome}
              style={styles.errorButton}
            />
          </View>
        </Card>
      </View>
    );
  }

  const getStatusIcon = () => {
    switch (reservation.status) {
      case 'approved':
        return { name: 'check-circle', color: COLORS.success };
      case 'pending':
        return { name: 'schedule', color: COLORS.warning };
      default:
        return { name: 'info', color: COLORS.primary };
    }
  };

  const statusIcon = getStatusIcon();
  
  // ✅ FIXED: Use current user data for apartment display
  const apartmentNumber = user ? ValidationUtils.extractApartmentNumber(user.username) : 'Unknown';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Success Header */}
      <Card style={styles.successCard}>
        <View style={styles.successHeader}>
          <Icon name={statusIcon.name} size={64} color={statusIcon.color} />
          <Text style={styles.successTitle}>
            {reservation.status === 'approved' ? t('bookingConfirmed') : t('bookingSubmitted')}
          </Text>
          <Text style={styles.successSubtitle}>
            {reservation.status === 'approved' 
              ? t('reservationConfirmed')
              : t('reservationSubmitted')
            }
          </Text>
          
          {/* Booking ID Badge */}
          <View style={styles.bookingIdBadge}>
            <Text style={styles.bookingIdLabel}>{t('bookingId')}</Text>
            <Text style={styles.bookingIdValue}>
              {reservation.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>
      </Card>

      {/* Reservation Details */}
      <Card style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>{t('reservationDetails')}</Text>
        
        <View style={styles.detailRow}>
          <Icon name="home" size={20} color={COLORS.text.secondary} />
          <Text style={styles.detailLabel}>{t('apartment')}</Text>
          <Text style={styles.detailValue}>{apartmentNumber}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="place" size={20} color={COLORS.text.secondary} />
          <Text style={styles.detailLabel}>{t('amenity')}</Text>
          <Text style={styles.detailValue}>
            {reservation.amenityName || reservation.amenityId}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="calendar-today" size={20} color={COLORS.text.secondary} />
          <Text style={styles.detailLabel}>{t('date')}</Text>
          <Text style={styles.detailValue}>
            {DateUtils.formatDate(reservation.startTime, language === 'es' ? 'es-CR' : 'en-US')}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="access-time" size={20} color={COLORS.text.secondary} />
          <Text style={styles.detailLabel}>{t('time')}</Text>
          <Text style={styles.detailValue}>
            {DateUtils.formatTime(reservation.startTime, language === 'es' ? 'es-CR' : 'en-US')} - {DateUtils.formatTime(reservation.endTime, language === 'es' ? 'es-CR' : 'en-US')}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="timer" size={20} color={COLORS.text.secondary} />
          <Text style={styles.detailLabel}>{t('duration')}</Text>
          <Text style={styles.detailValue}>
            {DateUtils.getDurationText(reservation.startTime, reservation.endTime, language === 'es' ? 'es-CR' : 'en-US')}
          </Text>
        </View>

        {reservation.specialRequests?.visitorCount && (
          <View style={styles.detailRow}>
            <Icon name="group" size={20} color={COLORS.text.secondary} />
            <Text style={styles.detailLabel}>{t('visitors')}</Text>
            <Text style={styles.detailValue}>{reservation.specialRequests.visitorCount}</Text>
          </View>
        )}

        {reservation.specialRequests?.grillUsage && (
          <View style={styles.detailRow}>
            <Icon name="outdoor-grill" size={20} color={COLORS.text.secondary} />
            <Text style={styles.detailLabel}>{t('grillUsage')}</Text>
            <Text style={styles.detailValue}>{t('included')}</Text>
          </View>
        )}

        {reservation.specialRequests?.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>{t('specialNotes')}:</Text>
            <Text style={styles.notesText}>{reservation.specialRequests.notes}</Text>
          </View>
        )}
      </Card>

      {/* Status Information */}
      <Card style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          {reservation.status === 'approved' ? t('whatsNext') : t('pendingApproval')}
        </Text>
        
        {reservation.status === 'approved' ? (
          <View>
            <Text style={styles.statusText}>
              {language === 'es' 
                ? '¡Su reserva está confirmada! Esto es lo que necesita saber:'
                : 'Your reservation is confirmed! Here\'s what you need to know:'
              }
            </Text>
            <View style={styles.statusList}>
              <View style={styles.statusItem}>
                <Icon name="schedule" size={16} color={COLORS.success} />
                <Text style={styles.statusItemText}>
                  {language === 'es' 
                    ? 'Llegue a tiempo para su reserva'
                    : 'Arrive on time for your reservation'
                  }
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Icon name="rule" size={16} color={COLORS.success} />
                <Text style={styles.statusItemText}>
                  {language === 'es' 
                    ? 'Siga todas las reglas y pautas de las instalaciones'
                    : 'Follow all facility rules and guidelines'
                  }
                </Text>
              </View>
              {reservation.specialRequirements?.requiresDeposit && (
                <View style={styles.statusItem}>
                  <Icon name="account-balance-wallet" size={16} color={COLORS.warning} />
                  <Text style={styles.statusItemText}>
                    ${reservation.specialRequirements.depositAmount || 50} {language === 'es' 
                      ? 'depósito requerido para uso de parrilla'
                      : 'deposit required for grill usage'
                    }
                  </Text>
                </View>
              )}
              <View style={styles.statusItem}>
                <Icon name="cancel" size={16} color={COLORS.primary} />
                <Text style={styles.statusItemText}>
                  {language === 'es' 
                    ? 'Puede cancelar hasta 2 horas antes de su horario'
                    : 'You can cancel up to 2 hours before your slot'
                  }
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.statusText}>
              {t('reservationRequiresApproval')}
            </Text>
            <Text style={styles.statusSubtext}>
              {t('usuallyTakes')}
            </Text>
            
            <View style={styles.pendingInfo}>
              <Icon name="info" size={20} color={COLORS.primary} />
              <View style={styles.pendingInfoContent}>
                <Text style={styles.pendingInfoTitle}>
                  {language === 'es' ? '¿Por qué necesito aprobación?' : 'Why do I need approval?'}
                </Text>
                <Text style={styles.pendingInfoText}>
                  {language === 'es' 
                    ? 'Esta reserva requiere revisión porque tiene otra reserva para esta amenidad en la misma fecha, o es una reserva repetida que necesita verificación del administrador.'
                    : 'This reservation requires review because you have another booking for this amenity on the same date, or it\'s a repeat reservation that needs admin verification.'
                  }
                </Text>
              </View>
            </View>
          </View>
        )}
      </Card>

      {/* Deposit Notice */}
      {reservation.specialRequirements?.requiresDeposit && (
        <Card style={styles.depositCard}>
          <View style={styles.depositHeader}>
            <Icon name="account-balance-wallet" size={24} color={COLORS.warning} />
            <Text style={styles.depositTitle}>
              {language === 'es' ? 'Depósito Requerido' : 'Deposit Required'}
            </Text>
          </View>
          <Text style={styles.depositText}>
            {language === 'es' 
              ? `Se requiere un depósito de ${reservation.specialRequirements.depositAmount || 50} para el uso de la parrilla. Por favor traiga efectivo o cheque a la recepción antes de su reserva.`
              : `A ${reservation.specialRequirements.depositAmount || 50} deposit is required for grill usage. Please bring cash or check to the front desk before your reservation.`
            }
          </Text>
          <View style={styles.depositNote}>
            <Icon name="info" size={16} color={COLORS.text.secondary} />
            <Text style={styles.depositNoteText}>
              {language === 'es' 
                ? 'El depósito será reembolsado después de su reserva si no ocurren daños.'
                : 'The deposit will be refunded after your reservation if no damages occur.'
              }
            </Text>
          </View>
        </Card>
      )}

      {/* Quick Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>
          {language === 'es' ? '💡 Consejos Rápidos' : '💡 Quick Tips'}
        </Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>
            {language === 'es' 
              ? '• Verifique las condiciones climáticas antes de usar amenidades al aire libre'
              : '• Check weather conditions before outdoor amenities'
            }
          </Text>
          <Text style={styles.tipItem}>
            {language === 'es' 
              ? '• Traiga toallas para áreas de jacuzzi o piscina'
              : '• Bring towels for jacuzzi or pool areas'
            }
          </Text>
          <Text style={styles.tipItem}>
            {language === 'es' 
              ? '• Limpie después del uso para mantener la calidad de las instalaciones'
              : '• Clean up after use to maintain facility quality'
            }
          </Text>
          <Text style={styles.tipItem}>
            {language === 'es' 
              ? '• Contacte al administrador si necesita hacer cambios'
              : '• Contact admin if you need to make changes'
            }
          </Text>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title={language === 'es' ? 'Ver Mis Reservas' : 'View My Reservations'}
          onPress={handleViewReservations}
          fullWidth
          style={styles.actionButton}
        />
        
        <Button
          title={language === 'es' ? 'Reservar Otra Amenidad' : 'Book Another Amenity'}
          variant="outline"
          onPress={handleBookAnother}
          fullWidth
          style={styles.actionButton}
        />

        <Button
          title={language === 'es' ? 'Ir al Panel Principal' : 'Go to Dashboard'}
          variant="secondary"
          onPress={handleGoHome}
          fullWidth
          style={styles.actionButton}
        />
      </View>

      {/* Contact Info */}
      <Card style={styles.contactCard}>
        <View style={styles.contactHeader}>
          <Icon name="support-agent" size={20} color={COLORS.primary} />
          <Text style={styles.contactTitle}>
            {language === 'es' ? '¿Necesita Ayuda?' : 'Need Help?'}
          </Text>
        </View>
        <Text style={styles.contactText}>
          {language === 'es' 
            ? 'Contacte al administrador del edificio si tiene preguntas sobre su reserva o necesita hacer cambios.'
            : 'Contact your building administrator if you have questions about your reservation or need to make any changes.'
          }
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  successCard: {
    margin: SPACING.md,
    alignItems: 'center',
  },
  successHeader: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  bookingIdBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  bookingIdLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.inverse,
    opacity: 0.8,
    marginBottom: SPACING.xs / 2,
  },
  bookingIdValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.inverse,
    fontFamily: 'monospace',
  },
  detailsCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  detailsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  detailLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  notesContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  notesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontStyle: 'italic',
  },
  statusCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  statusTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  statusSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  statusList: {
    marginTop: SPACING.xs,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  statusItemText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
    flex: 1,
    lineHeight: 20,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FF',
    padding: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  pendingInfoContent: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  pendingInfoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs / 2,
  },
  pendingInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  depositCard: {
    margin: SPACING.md,
    marginTop: 0,
    backgroundColor: '#FFF8E1',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  depositHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  depositTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: SPACING.xs,
  },
  depositText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  depositNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: SPACING.xs,
    borderRadius: 6,
  },
  depositNoteText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs / 2,
    flex: 1,
  },
  tipsCard: {
    margin: SPACING.md,
    marginTop: 0,
    backgroundColor: '#F0FFF4',
  },
  tipsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  tipsList: {
    marginLeft: SPACING.xs,
  },
  tipItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
    lineHeight: 18,
  },
  actionButtons: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  contactCard: {
    margin: SPACING.md,
    marginTop: 0,
    marginBottom: SPACING.xl,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  contactTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  contactText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  errorCard: {
    margin: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  errorActions: {
    width: '100%',
  },
  errorButton: {
    marginBottom: SPACING.sm,
    minWidth: 200,
  },
});

export default BookingConfirmationScreen;