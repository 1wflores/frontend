import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-icons';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';
import { Localization } from '../../utils/localization';
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { useAuth } from '../../hooks/useAuth';
import { reservationService } from '../../services/reservationService';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const BookingConfirmationScreen = ({ route, navigation }) => {
  const { reservationId } = route.params || {};
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reservationId) {
      loadReservation();
    } else {
      setLoading(false);
    }
  }, [reservationId]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      console.log('Loading reservation with ID:', reservationId);
      
      let foundReservation = null;
      
      // Try to get the specific reservation first
      try {
        foundReservation = await reservationService.getReservationById(reservationId);
        console.log('Found reservation via ID:', foundReservation);
      } catch (error) {
        console.log('Could not find reservation by ID, trying user reservations:', error.message);
      }
      
      // If not found, check user's reservations
      if (!foundReservation) {
        const userReservations = await reservationService.getUserReservations(user.id);
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
    return <LoadingSpinner message={t('loading')} />;
  }

  // ✅ FIXED: Error states with proper translations
  if (!reservationId) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Icon name="error" size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>
            {t('invalidRequest')}
          </Text>
          <Text style={styles.errorText}>
            {t('noReservationId')}
          </Text>
          <View style={styles.errorActions}>
            <Button
              title={t('bookAmenity')}
              onPress={handleBookAnother}
              style={styles.errorButton}
            />
            <Button
              title={t('dashboard')}
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
            {t('reservationNotFound')}
          </Text>
          <Text style={styles.errorText}>
            {t('reservationNotFoundDesc')}
          </Text>
          <View style={styles.errorActions}>
            <Button
              title={t('reservations')}
              onPress={handleViewReservations}
              style={styles.errorButton}
            />
            <Button
              title={t('dashboard')}
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
  const apartmentNumber = user ? ValidationUtils.extractApartmentNumber(user.username) : t('unknown');

  // ✅ FIXED: Get translated amenity name
  const getTranslatedAmenityName = () => {
    return Localization.translateAmenity(reservation.amenityName || reservation.amenity?.name, language);
  };

  // ✅ FIXED: Format visitor count with proper translation
  const getVisitorText = () => {
    const count = reservation.specialRequests?.visitorCount || 0;
    if (count === 0) return null;
    
    const visitorWord = count === 1 
      ? Localization.translateCommon('guest', language)
      : Localization.translateCommon('guests', language);
    return `${count} ${visitorWord}`;
  };

  // ✅ FIXED: Format duration with proper translation
  const getDurationText = () => {
    const start = new Date(reservation.startTime);
    const end = new Date(reservation.endTime);
    const durationMinutes = (end - start) / (1000 * 60);
    
    if (durationMinutes >= 60) {
      const hours = Math.floor(durationMinutes / 60);
      const remainingMinutes = durationMinutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? t('hour') : t('hours')}`;
      } else {
        return `${hours}h ${remainingMinutes}${t('minutes')}`;
      }
    } else {
      return `${durationMinutes} ${t('minutes')}`;
    }
  };

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
        </View>

        <View style={styles.bookingIdContainer}>
          <Text style={styles.bookingIdLabel}>{t('bookingId')}</Text>
          <Text style={styles.bookingIdValue}>{reservation.id}</Text>
        </View>
      </Card>

      {/* Reservation Details */}
      <Card style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>{t('reservationDetails')}</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('apartment')}</Text>
          <Text style={styles.detailValue}>{apartmentNumber}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('amenity')}</Text>
          <Text style={styles.detailValue}>{getTranslatedAmenityName()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('date')}</Text>
          <Text style={styles.detailValue}>
            {DateUtils.formatDate(reservation.startTime, language)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('time')}</Text>
          <Text style={styles.detailValue}>
            {DateUtils.formatTime(reservation.startTime)} - {DateUtils.formatTime(reservation.endTime)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('duration')}</Text>
          <Text style={styles.detailValue}>{getDurationText()}</Text>
        </View>

        {getVisitorText() && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('visitors')}</Text>
            <Text style={styles.detailValue}>{getVisitorText()}</Text>
          </View>
        )}

        {reservation.specialRequests?.grillUsage && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('grillUsage')}</Text>
            <Text style={styles.detailValue}>{t('included')}</Text>
          </View>
        )}

        {reservation.specialRequests?.notes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('specialNotes')}</Text>
            <Text style={styles.detailValue}>{reservation.specialRequests.notes}</Text>
          </View>
        )}
      </Card>

      {/* What's Next Section - Only show for pending reservations */}
      {reservation.status === 'pending' && (
        <Card style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>{t('whatsNext')}</Text>
          
          <View style={styles.pendingContainer}>
            <Icon name="schedule" size={24} color={COLORS.warning} />
            <View style={styles.pendingText}>
              <Text style={styles.pendingTitle}>{t('pendingApproval')}</Text>
              <Text style={styles.pendingDescription}>
                {t('reservationRequiresApproval')}
              </Text>
              <Text style={styles.pendingNote}>
                {t('usuallyTakes')}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          title={t('reservations')}
          onPress={handleViewReservations}
          style={styles.actionButton}
        />
        
        <Button
          title={t('bookAmenity')}
          variant="outline"
          onPress={handleBookAnother}
          style={styles.actionButton}
        />
        
        <Button
          title={t('dashboard')}
          variant="outline"
          onPress={handleGoHome}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  successCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  successSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bookingIdContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  bookingIdLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  bookingIdValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  detailsCard: {
    marginBottom: SPACING.lg,
  },
  detailsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    flex: 1,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  nextStepsCard: {
    marginBottom: SPACING.lg,
  },
  nextStepsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pendingText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  pendingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  pendingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  pendingNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  actionContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    width: '100%',
  },
  errorCard: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  errorActions: {
    width: '100%',
    gap: SPACING.md,
  },
  errorButton: {
    width: '100%',
  },
});

// 🚨 FIX: Use default export instead of named export
export default BookingConfirmationScreen;