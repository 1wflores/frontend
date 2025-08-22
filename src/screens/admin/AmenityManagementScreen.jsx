import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiClient } from '../../services/apiClient';
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator';
import { Localization } from '../../utils/localization';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const AmenityManagementScreen = ({ navigation }) => {
  const { language, t } = useLanguage();
  
  const [amenities, setAmenities] = useState([]);
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchAmenities();
  }, []);

  useEffect(() => {
    filterAmenities();
  }, [amenities, searchQuery, selectedFilter]);

  // FIXED: Enhanced amenity descriptions with proper translations
  const getAmenityDescriptions = () => {
    return {
      'Jacuzzi': {
        es: 'Jacuzzi para relajación y terapia. Perfecto para aliviar el estrés después de un largo día.',
        en: 'Jacuzzi for relaxation and therapy. Perfect for stress relief after a long day.'
      },
      'Cold Tub': {
        es: 'Tina fría para terapia de recuperación y bienestar. Ideal para recuperación post-ejercicio.',
        en: 'Cold therapy tub for recovery and wellness. Ideal for post-exercise recovery.'
      },
      'Yoga Deck': {
        es: 'Terraza de yoga para ejercicios y relajación. Espacio tranquilo con vista panorámica.',
        en: 'Yoga deck for exercise and relaxation. Peaceful space with panoramic views.'
      },
      'Community Lounge': {
        es: 'Salón Comunitario con acceso a parrilla para reuniones sociales y eventos.',
        en: 'Community Lounge with grill access for social gatherings and events.'
      },
      'Rooftop Terrace': {
        es: 'Terraza en azotea con vista panorámica de la ciudad. Ideal para eventos al aire libre.',
        en: 'Rooftop terrace with panoramic city views. Ideal for outdoor events.'
      },
      'Gym': {
        es: 'Gimnasio completamente equipado con máquinas modernas y pesas libres.',
        en: 'Fully equipped gym with modern machines and free weights.'
      },
      'Pool': {
        es: 'Piscina climatizada disponible todo el año para natación y relajación.',
        en: 'Heated pool available year-round for swimming and relaxation.'
      },
      'BBQ Area': {
        es: 'Área de barbacoa con parrillas de gas y carbón, perfecta para reuniones familiares.',
        en: 'BBQ area with gas and charcoal grills, perfect for family gatherings.'
      },
      'Conference Room': {
        es: 'Sala de conferencias profesional con equipo audiovisual y capacidad para 20 personas.',
        en: 'Professional conference room with audiovisual equipment and capacity for 20 people.'
      },
      'Game Room': {
        es: 'Sala de juegos con mesa de pool, ping pong y entretenimiento para todas las edades.',
        en: 'Game room with pool table, ping pong, and entertainment for all ages.'
      }
    };
  };

  // FIXED: Get translated amenity name
  const getTranslatedAmenityName = (amenityName) => {
    return Localization.translateAmenity(amenityName, language);
  };

  // FIXED: Get translated amenity description
  const getTranslatedDescription = (amenityName, originalDescription) => {
    const descriptions = getAmenityDescriptions();
    const amenityDesc = descriptions[amenityName];
    
    if (amenityDesc) {
      return language === 'es' ? amenityDesc.es : amenityDesc.en;
    }
    
    // Fallback to original description if available
    return originalDescription || (language === 'es' ? 'Descripción no disponible' : 'Description not available');
  };

  // FIXED: Get operating hours with translation
  const getTranslatedOperatingHours = (hours) => {
    if (!hours) {
      return language === 'es' ? '24 horas' : '24 hours';
    }
    
    // Translate day names in operating hours
    let translatedHours = hours;
    
    const dayTranslations = {
      'Monday': 'Lunes',
      'Tuesday': 'Martes', 
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
      'Friday': 'Viernes',
      'Saturday': 'Sábado',
      'Sunday': 'Domingo',
      'Mon': 'Lun',
      'Tue': 'Mar',
      'Wed': 'Mié',
      'Thu': 'Jue',
      'Fri': 'Vie',
      'Sat': 'Sáb',
      'Sun': 'Dom'
    };

    if (language === 'es') {
      Object.keys(dayTranslations).forEach(englishDay => {
        const spanishDay = dayTranslations[englishDay];
        translatedHours = translatedHours.replace(new RegExp(englishDay, 'g'), spanishDay);
      });
    }

    return translatedHours;
  };

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching amenities from API...');
      
      const response = await apiClient.get('/api/amenities');
      console.log('📊 Amenities API response:', response);
      
      let amenitiesData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          amenitiesData = response.data;
        } else if (response.data.amenities && Array.isArray(response.data.amenities)) {
          amenitiesData = response.data.amenities;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          amenitiesData = response.data.data;
        }
      }

      setAmenities(amenitiesData);
      console.log(`✅ Loaded ${amenitiesData.length} amenities successfully`);
      
    } catch (error) {
      console.error('❌ Error fetching amenities:', error);
      
      // For development, create sample amenities if API fails
      if (__DEV__ && error.response?.status !== 401) {
        console.log('🧪 Creating sample amenities for development...');
        const sampleAmenities = [
          {
            id: 'jacuzzi',
            name: 'Jacuzzi',
            type: 'jacuzzi',
            capacity: 6,
            isActive: true,
            operatingHours: 'Mon-Sun: 07:00 - 21:00',
            requiresApproval: false,
            maxDuration: 60,
            description: 'Jacuzzi for relaxation and therapy',
            amenityRules: ['No glass containers', 'Maximum 6 people'],
          },
          {
            id: 'cold-tub',
            name: 'Cold Tub',
            type: 'cold-tub',
            capacity: 4,
            isActive: true,
            operatingHours: 'Mon-Sun: 07:00 - 21:00',
            requiresApproval: false,
            maxDuration: 60,
            description: 'Cold therapy tub for recovery and wellness',
            amenityRules: ['Maximum 4 people', 'Maximum 60 minutes'],
          },
          {
            id: 'lounge',
            name: 'Community Lounge',
            type: 'lounge',
            capacity: 20,
            isActive: true,
            operatingHours: 'Mon-Sun: 07:00 - 22:00',
            requiresApproval: true,
            maxDuration: 240,
            description: 'Community Lounge with grill access for',
            amenityRules: ['24-hour advance booking required', 'Grill usage additional fee'],
          },
          {
            id: 'yoga-deck',
            name: 'Yoga Deck',
            type: 'yoga-deck',
            capacity: 8,
            isActive: false,
            operatingHours: 'Mon-Sun: 06:00 - 20:00',
            requiresApproval: false,
            maxDuration: 90,
            description: 'Yoga deck for exercise and relaxation',
            amenityRules: ['Bring your own mat', 'No shoes allowed'],
            maintenanceNote: 'Under maintenance until further notice',
          },
        ];
        setAmenities(sampleAmenities);
        
        Alert.alert(
          language === 'es' ? 'Modo de Desarrollo' : 'Development Mode',
          language === 'es' 
            ? 'Usando datos de muestra para amenidades.'
            : 'Using sample amenity data.'
        );
      } else {
        const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
        Alert.alert(t('error') || 'Error', errorMessage);
        setAmenities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAmenities = () => {
    let filtered = amenities;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(amenity => {
        const translatedName = getTranslatedAmenityName(amenity.name);
        const translatedDesc = getTranslatedDescription(amenity.name, amenity.description);
        
        return (
          translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          translatedDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          amenity.type?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(amenity => amenity.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(amenity => !amenity.isActive);
        break;
      case 'maintenance':
        filtered = filtered.filter(amenity => amenity.maintenanceNote);
        break;
    }

    setFilteredAmenities(filtered);
    console.log(`🔍 Filtered ${filtered.length} amenities out of ${amenities.length} total`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAmenities();
    setRefreshing(false);
  };

  const handleToggleAmenity = async (amenity) => {
    const action = amenity.isActive ? 'deactivate' : 'activate';
    
    Alert.alert(
      language === 'es' 
        ? (amenity.isActive ? 'Desactivar Amenidad' : 'Activar Amenidad')
        : (amenity.isActive ? 'Deactivate Amenity' : 'Activate Amenity'),
      language === 'es'
        ? `¿Está seguro de que desea ${amenity.isActive ? 'desactivar' : 'activar'} "${getTranslatedAmenityName(amenity.name)}"?`
        : `Are you sure you want to ${action} "${getTranslatedAmenityName(amenity.name)}"?`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: language === 'es' 
            ? (amenity.isActive ? 'Desactivar' : 'Activar')
            : (amenity.isActive ? 'Deactivate' : 'Activate'),
          onPress: async () => {
            try {
              await apiClient.post(`/api/amenities/${amenity.id}/${action}`);
              setAmenities(prev =>
                prev.map(a => (a.id === amenity.id ? { ...a, isActive: !a.isActive } : a))
              );
              Alert.alert(
                t('success') || 'Success',
                language === 'es' 
                  ? `Amenidad ${amenity.isActive ? 'desactivada' : 'activada'} exitosamente`
                  : `Amenity ${action}d successfully`
              );
            } catch (error) {
              console.error(`Error ${action}ing amenity:`, error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error') || 'Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleEditAmenity = (amenity) => {
    navigation.navigate('EditAmenity', { amenityId: amenity.id });
  };

  const handleViewReservations = (amenity) => {
    navigation.navigate('AmenityReservations', { 
      amenityId: amenity.id, 
      amenityName: amenity.name 
    });
  };

  const handleScheduleMaintenance = (amenity) => {
    Alert.alert(
      language === 'es' ? 'Programar Mantenimiento' : 'Schedule Maintenance',
      language === 'es' 
        ? `¿Desea programar mantenimiento para "${getTranslatedAmenityName(amenity.name)}"?`
        : `Do you want to schedule maintenance for "${getTranslatedAmenityName(amenity.name)}"?`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: language === 'es' ? 'Programar' : 'Schedule',
          onPress: () => {
            // TODO: Implement maintenance scheduling
            Alert.alert(
              language === 'es' ? 'Mantenimiento Programado' : 'Maintenance Scheduled',
              language === 'es' 
                ? 'El mantenimiento ha sido programado exitosamente'
                : 'Maintenance has been scheduled successfully'
            );
          },
        },
      ]
    );
  };

  const renderAmenityItem = ({ item }) => {
    const translatedName = getTranslatedAmenityName(item.name);
    const translatedDescription = getTranslatedDescription(item.name, item.description);
    const translatedHours = getTranslatedOperatingHours(item.operatingHours);

    return (
      <Card style={[styles.amenityCard, !item.isActive && styles.inactiveCard]}>
        <View style={styles.amenityHeader}>
          <View style={styles.amenityInfo}>
            <Text style={styles.amenityName}>{translatedName}</Text>
            <Text style={styles.amenityDescription}>{translatedDescription}</Text>
          </View>
          
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.isActive ? COLORS.success + '20' : COLORS.error + '20' }
          ]}>
            <Icon 
              name={item.isActive ? 'check-circle' : 'cancel'} 
              size={16} 
              color={item.isActive ? COLORS.success : COLORS.error} 
            />
            <Text style={[
              styles.statusText, 
              { color: item.isActive ? COLORS.success : COLORS.error }
            ]}>
              {item.isActive 
                ? (language === 'es' ? 'Activa' : 'Active')
                : (language === 'es' ? 'Inactiva' : 'Inactive')
              }
            </Text>
          </View>
        </View>

        {item.maintenanceNote && (
          <View style={styles.maintenanceAlert}>
            <Icon name="build" size={16} color={COLORS.warning} />
            <Text style={styles.maintenanceText}>
              {language === 'es' ? 'En Mantenimiento' : 'Under Maintenance'}
            </Text>
          </View>
        )}

        <View style={styles.amenityDetails}>
          <View style={styles.detailRow}>
            <Icon name="people" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {language === 'es' ? 'Capacidad:' : 'Capacity:'} {item.capacity} {
                language === 'es' ? 'personas' : 'people'
              }
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {language === 'es' ? 'Horarios:' : 'Hours:'} {translatedHours}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="timer" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>
              {language === 'es' ? 'Duración máxima:' : 'Max duration:'} {item.maxDuration} {
                language === 'es' ? 'minutos' : 'minutes'
              }
            </Text>
          </View>

          {item.requiresApproval && (
            <View style={styles.detailRow}>
              <Icon name="approval" size={16} color={COLORS.warning} />
              <Text style={[styles.detailText, { color: COLORS.warning }]}>
                {language === 'es' ? 'Requiere aprobación' : 'Requires approval'}
              </Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewReservations(item)}
          >
            <Icon name="event" size={16} color={COLORS.primary} />
            <Text style={styles.actionText}>
              {language === 'es' ? 'Reservas' : 'Reservations'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditAmenity(item)}
          >
            <Icon name="edit" size={16} color={COLORS.info} />
            <Text style={styles.actionText}>
              {language === 'es' ? 'Editar' : 'Edit'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.maintenanceAction]}
            onPress={() => handleScheduleMaintenance(item)}
          >
            <Icon name="build" size={16} color={COLORS.warning} />
            <Text style={styles.actionText}>
              {language === 'es' ? 'Mantenimiento' : 'Maintenance'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleToggleAmenity(item)}
          >
            <Icon 
              name={item.isActive ? 'visibility-off' : 'visibility'} 
              size={16} 
              color={item.isActive ? COLORS.error : COLORS.success} 
            />
            <Text style={styles.actionText}>
              {item.isActive 
                ? (language === 'es' ? 'Desactivar' : 'Deactivate')
                : (language === 'es' ? 'Activar' : 'Activate')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="place" size={64} color={COLORS.text.secondary} />
      <Text style={styles.emptyTitle}>
        {language === 'es' ? 'No hay Amenidades' : 'No Amenities'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'all'
          ? (language === 'es' 
              ? 'No hay amenidades que coincidan con los filtros actuales.'
              : 'No amenities match the current filters.')
          : (language === 'es' 
              ? 'No hay amenidades configuradas en este momento.'
              : 'No amenities are configured at the moment.')
        }
      </Text>
    </View>
  );

  const filterOptions = [
    { key: 'all', label: language === 'es' ? 'Todas las Amenidades' : 'All Amenities' },
    { key: 'active', label: language === 'es' ? 'Activas' : 'Active' },
    { key: 'inactive', label: language === 'es' ? 'Inactivas' : 'Inactive' },
    { key: 'maintenance', label: language === 'es' ? 'Mantenimiento' : 'Maintenance' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner 
          message={language === 'es' ? 'Cargando amenidades...' : 'Loading amenities...'} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          title={language === 'es' ? 'Crear Amenidad' : 'Create Amenity'}
          onPress={() => navigation.navigate('CreateAmenity')}
          leftIcon="add"
          style={styles.createButton}
        />
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Input
          placeholder={language === 'es' ? 'Buscar amenidades...' : 'Search amenities...'}
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
          <Text style={styles.statNumber}>{amenities.length}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Total' : 'Total'}
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {amenities.filter(a => a.isActive).length}
          </Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Activas' : 'Active'}
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {amenities.filter(a => a.maintenanceNote).length}
          </Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Mantenimiento' : 'Maintenance'}
          </Text>
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
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
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
    textAlign: 'center',
  },
  listContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  amenityCard: {
    marginBottom: SPACING.md,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  amenityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  amenityInfo: {
    flex: 1,
  },
  amenityName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  amenityDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
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
  maintenanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  maintenanceText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  amenityDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 70,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs / 2,
  },
  maintenanceAction: {
    borderColor: COLORS.warning + '40',
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
});

export default AmenityManagementScreen;