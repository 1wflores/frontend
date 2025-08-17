import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAmenities } from '../../hooks/useAmenities';
import { AmenityCard } from '../../components/reservation/AmenityCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { COLORS, SPACING } from '../../utils/constants';

export const AmenitiesScreen = () => {
  const navigation = useNavigation();
  const { amenities, loading, error, fetchAmenities } = useAmenities();

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  const handleBookAmenity = (amenity) => {
    if (!amenity.isActive) {
      Alert.alert(
        'Amenity Unavailable',
        'This amenity is currently under maintenance and cannot be booked.',
        [{ text: 'OK' }]
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

  if (loading) {
    return <LoadingSpinner message="Loading amenities..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={amenities}
        renderItem={renderAmenityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAmenities} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SPACING.md,
  },
});

// Export both named and default for compatibility
export default AmenitiesScreen;