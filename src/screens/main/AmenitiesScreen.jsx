import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ ADDED: Language support
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator'; // ✅ ADDED: Error translation
import { useAmenities } from '../../hooks/useAmenities';
import { AmenityCard } from '../../components/reservation/AmenityCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const AmenitiesScreen = () => {
  const navigation = useNavigation();
  const { language, t } = useLanguage(); // ✅ ADDED: Language hook
  const { amenities, loading, error, fetchAmenities } = useAmenities();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAmenities();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBookAmenity = (amenity) => {
    if (!amenity.isActive) {
      // ✅ FIXED: Maintenance alert with translations
      Alert.alert(
        language === 'es' ? 'Amenidad No Disponible' : 'Amenity Unavailable',
        language === 'es' 
          ? 'Esta amenidad está actualmente en mantenimiento y no puede ser reservada.'
          : 'This amenity is currently under maintenance and cannot be booked.',
        [{ text: t('ok') }]
      );
      return;
    }

    navigation.navigate('AmenityBooking', { amenityId: amenity.id });
  };

  const renderAmenityItem = ({ item }) => (
    <AmenityCard
      amenity={item}
      onPress={() => handleBookAmenity(item)}
    />
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyState}>
      <Icon name="pool" size={64} color={COLORS.text.secondary} />
      <Text style={styles.emptyTitle}>
        {language === 'es' ? 'No Hay Amenidades Disponibles' : 'No Amenities Available'}
      </Text>
      <Text style={styles.emptyText}>
        {language === 'es' 
          ? 'No hay amenidades disponibles para reservar en este momento. Por favor consulte con la administración del edificio.'
          : 'No amenities are available for booking at this time. Please check with building administration.'
        }
      </Text>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>
        {language === 'es' ? 'Amenidades Disponibles' : 'Available Amenities'}
      </Text>
      <Text style={styles.headerSubtitle}>
        {language === 'es' 
          ? 'Seleccione una amenidad para hacer una reserva'
          : 'Select an amenity to make a reservation'
        }
      </Text>
      
      {/* Active amenities count */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="pool" size={20} color={COLORS.primary} />
          <Text style={styles.statText}>
            {amenities.filter(a => a.isActive).length} {language === 'es' ? 'disponibles' : 'available'}
          </Text>
        </View>
        
        {amenities.filter(a => !a.isActive).length > 0 && (
          <View style={styles.statCard}>
            <Icon name="build" size={20} color={COLORS.warning} />
            <Text style={styles.statText}>
              {amenities.filter(a => !a.isActive).length} {language === 'es' ? 'en mantenimiento' : 'in maintenance'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading && amenities.length === 0) {
    return <LoadingSpinner message={language === 'es' ? 'Cargando amenidades...' : 'Loading amenities...'} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={amenities}
        renderItem={renderAmenityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            title={language === 'es' ? 'Actualizando...' : 'Refreshing...'}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      
      {/* ✅ FIXED: Error handling with translations */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {ApiErrorTranslator.translateError(error, language)}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchAmenities}
          >
            <Text style={styles.retryText}>{t('retry')}</Text>
          </TouchableOpacity>
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
  listContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    margin: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

// Export both named and default for compatibility
export default AmenitiesScreen;