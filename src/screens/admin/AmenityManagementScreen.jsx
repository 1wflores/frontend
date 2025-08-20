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
import { useNavigation } from '@react-navigation/native';
import { useAmenities } from '../../hooks/useAmenities';
import { AmenityCard } from '../../components/reservation/AmenityCard';
import { AmenityFormModal } from '../../components/admin/AmenityFormModal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { apiClient } from '../../services/apiClient';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const AmenityManagementScreen = () => {
  const navigation = useNavigation();
  const { amenities, loading, fetchAmenities } = useAmenities();
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Form Modal State
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Maintenance Modal State
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  useEffect(() => {
    fetchAmenities();
  }, []);

  useEffect(() => {
    filterAmenities();
  }, [amenities, searchQuery, selectedFilter]);

  const filterAmenities = () => {
    let filtered = amenities;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(amenity =>
        amenity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        amenity.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(a => a.isActive);
        break;
      case 'maintenance':
        filtered = filtered.filter(a => !a.isActive);
        break;
    }

    setFilteredAmenities(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAmenities();
    setRefreshing(false);
  };

  const handleCreateAmenity = () => {
    setEditingAmenity(null);
    setFormModalVisible(true);
  };

  const handleEditAmenity = (amenity) => {
    setEditingAmenity(amenity);
    setFormModalVisible(true);
  };

  const handleViewReservations = (amenity) => {
    navigation.navigate('AmenityReservations', {
      amenityId: amenity.id,
      amenityName: amenity.name,
    });
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      
      let response;
      if (editingAmenity) {
        // Update existing amenity
        response = await apiClient.put(`/api/amenities/${editingAmenity.id}`, formData);
      } else {
        // Create new amenity
        response = await apiClient.post('/api/amenities', formData);
      }

      if (response.data.success) {
        Alert.alert(
          'Success',
          editingAmenity 
            ? 'Amenity updated successfully!' 
            : 'Amenity created successfully!'
        );
        setFormModalVisible(false);
        setEditingAmenity(null);
        await fetchAmenities(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Form submit error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Operation failed. Please try again.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleMaintenance = async (amenity) => {
    if (amenity.isActive) {
      // Put under maintenance
      setSelectedAmenity(amenity);
      setMaintenanceModalVisible(true);
    } else {
      // Reactivate amenity
      Alert.alert(
        'Reactivate Amenity',
        `Are you sure you want to reactivate ${amenity.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reactivate',
            onPress: () => updateAmenityStatus(amenity.id, true),
          },
        ]
      );
    }
  };

  const updateAmenityStatus = async (amenityId, isActive, notes = '') => {
    try {
      const response = await apiClient.put(`/api/amenities/${amenityId}`, {
        isActive,
        maintenanceNotes: notes,
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          isActive 
            ? 'Amenity has been reactivated' 
            : 'Amenity has been put under maintenance'
        );
        await fetchAmenities(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to update amenity status');
      }
    } catch (error) {
      console.error('Update amenity status error:', error);
      Alert.alert(
        'Error',
        'Failed to update amenity status. Please try again.'
      );
    }
  };

  const submitMaintenance = () => {
    if (!maintenanceNotes.trim()) {
      Alert.alert('Error', 'Please provide maintenance notes');
      return;
    }

    if (selectedAmenity) {
      updateAmenityStatus(selectedAmenity.id, false, maintenanceNotes);
    }

    setMaintenanceModalVisible(false);
    setSelectedAmenity(null);
    setMaintenanceNotes('');
  };

  const handleDeleteAmenity = (amenity) => {
    Alert.alert(
      'Delete Amenity',
      `Are you sure you want to delete ${amenity.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAmenity(amenity.id),
        },
      ]
    );
  };

  const deleteAmenity = async (amenityId) => {
    try {
      const response = await apiClient.delete(`/api/amenities/${amenityId}`);

      if (response.data.success) {
        Alert.alert('Success', 'Amenity deleted successfully');
        await fetchAmenities(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to delete amenity');
      }
    } catch (error) {
      console.error('Delete amenity error:', error);
      Alert.alert(
        'Error',
        'Failed to delete amenity. Please try again.'
      );
    }
  };

  const filters = [
    { key: 'all', label: 'All Amenities' },
    { key: 'active', label: 'Active' },
    { key: 'maintenance', label: 'Maintenance' },
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

  const renderAmenityItem = ({ item }) => (
    <View style={styles.amenityItemContainer}>
      <AmenityCard amenity={item} disabled />
      
      <View style={styles.amenityActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditAmenity(item)}
        >
          <Icon name="edit" size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewReservations(item)}
        >
          <Icon name="event" size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Reservations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            item.isActive ? styles.maintenanceAction : styles.activateAction
          ]}
          onPress={() => handleToggleMaintenance(item)}
        >
          <Icon 
            name={item.isActive ? "build" : "check-circle"} 
            size={16} 
            color={item.isActive ? COLORS.warning : COLORS.success} 
          />
          <Text style={[
            styles.actionText,
            { color: item.isActive ? COLORS.warning : COLORS.success }
          ]}>
            {item.isActive ? 'Maintenance' : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteAction]}
          onPress={() => handleDeleteAmenity(item)}
        >
          <Icon name="delete" size={16} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyState}>
      <Icon name="pool" size={64} color={COLORS.text.secondary} />
      <Text style={styles.emptyTitle}>No Amenities Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'all'
          ? 'No amenities match your current filters.'
          : 'No amenities have been created yet.'}
      </Text>
      {!searchQuery && selectedFilter === 'all' && (
        <Button
          title="Create First Amenity"
          onPress={handleCreateAmenity}
          style={styles.emptyButton}
        />
      )}
    </Card>
  );

  const renderMaintenanceModal = () => (
    <Modal
      visible={maintenanceModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setMaintenanceModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Put Under Maintenance</Text>
            <TouchableOpacity
              onPress={() => setMaintenanceModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Icon name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>
            {selectedAmenity ? `${selectedAmenity.name} will be unavailable for booking` : ''}
          </Text>
          
          <Input
            label="Maintenance Notes"
            placeholder="e.g., Scheduled cleaning, Equipment repair, etc."
            value={maintenanceNotes}
            onChangeText={setMaintenanceNotes}
            multiline
            numberOfLines={3}
            style={styles.maintenanceInput}
          />
          
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setMaintenanceModalVisible(false)}
              style={styles.modalButton}
            />
            <Button
              title="Put Under Maintenance"
              variant="danger"
              onPress={submitMaintenance}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && amenities.length === 0) {
    return <LoadingSpinner message="Loading amenities..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header with Create Button */}
      <View style={styles.header}>
        <Button
          title="Create Amenity"
          onPress={handleCreateAmenity}
          leftIcon="add"
          style={styles.createButton}
        />
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search amenities..."
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
          <Text style={styles.statNumber}>{amenities.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {amenities.filter(a => a.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {amenities.filter(a => !a.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Maintenance</Text>
        </Card>
      </View>

      {/* Amenities List */}
      <FlatList
        data={filteredAmenities}
        renderItem={renderAmenityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Form Modal */}
      <AmenityFormModal
        visible={formModalVisible}
        onClose={() => {
          setFormModalVisible(false);
          setEditingAmenity(null);
        }}
        onSubmit={handleFormSubmit}
        amenity={editingAmenity}
        loading={formLoading}
      />

      {/* Maintenance Modal */}
      {renderMaintenanceModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  createButton: {
    alignSelf: 'flex-start',
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
  amenityItemContainer: {
    marginBottom: SPACING.md,
  },
  amenityActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: -SPACING.sm,
    marginHorizontal: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
    borderRadius: 6,
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  maintenanceAction: {
    backgroundColor: '#FFF8E1',
  },
  activateAction: {
    backgroundColor: '#F0FFF4',
  },
  deleteAction: {
    backgroundColor: '#FFEBEE',
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
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    minWidth: 150,
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
  maintenanceInput: {
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

export default AmenityManagementScreen;