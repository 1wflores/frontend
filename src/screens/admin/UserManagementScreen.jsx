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
import { UserManagementCard } from '../../components/admin/UserManagementCard';
import { UserCreationModal } from '../../components/admin/UserCreationModal';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/apiClient';
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const UserManagementScreen = ({ navigation }) => {
  const { language, t } = useLanguage();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedFilter]);

  // FIXED: Enhanced fetchUsers with better error handling and debugging
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('📥 Fetching users from API...');
      
      // Make the API call
      const response = await apiClient.get('/api/auth/users');
      console.log('📊 Users API response:', response);
      console.log('📊 Users data:', response.data);
      
      // Handle different response formats
      let usersData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response.data.users && Array.isArray(response.data.users)) {
          usersData = response.data.users;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          usersData = response.data.data;
        }
      }
      
      console.log(`✅ Processing ${usersData.length} users`);
      
      // Filter out current user from the list if needed
      const filteredUsers = usersData.filter(user => user.id !== currentUser?.id);
      
      setUsers(filteredUsers);
      console.log(`✅ Loaded ${filteredUsers.length} users successfully`);
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // For development, create some sample users if API fails
      if (__DEV__ && error.response?.status !== 401) {
        console.log('🧪 Creating sample users for development...');
        const sampleUsers = [
          {
            id: '1',
            username: 'apartment204',
            role: 'resident',
            isActive: true,
            createdAt: '2024-01-15T10:30:00.000Z',
            lastLogin: '2024-01-20T15:45:00.000Z',
          },
          {
            id: '2',
            username: 'apartment205',
            role: 'resident',
            isActive: true,
            createdAt: '2024-01-10T09:20:00.000Z',
            lastLogin: '2024-01-19T12:30:00.000Z',
          },
          {
            id: '3',
            username: 'apartment301',
            role: 'resident',
            isActive: false,
            createdAt: '2024-01-05T14:15:00.000Z',
            lastLogin: '2024-01-18T08:45:00.000Z',
          },
          {
            id: '4',
            username: 'apartment102',
            role: 'resident',
            isActive: true,
            createdAt: '2024-01-12T11:00:00.000Z',
            lastLogin: null,
          },
          {
            id: '5',
            username: 'admin2',
            role: 'admin',
            isActive: true,
            createdAt: '2024-01-01T08:00:00.000Z',
            lastLogin: '2024-01-21T16:20:00.000Z',
          },
        ];
        setUsers(sampleUsers);
        
        Alert.alert(
          language === 'es' ? 'Modo de Desarrollo' : 'Development Mode',
          language === 'es' 
            ? 'Usando datos de muestra. Verifica la conexión a la API en producción.'
            : 'Using sample data. Check API connection in production.'
        );
      } else {
        // Show error to user
        const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
        Alert.alert(t('error') || 'Error', errorMessage);
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status/role filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(user => user.isActive);
        break;
      case 'inactive':
        filtered = filtered.filter(user => !user.isActive);
        break;
      case 'admins':
        filtered = filtered.filter(user => user.role === 'admin');
        break;
      case 'residents':
        filtered = filtered.filter(user => user.role === 'resident');
        break;
    }

    setFilteredUsers(filtered);
    console.log(`🔍 Filtered ${filtered.length} users out of ${users.length} total`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const handleCreateUser = () => {
    setCreateModalVisible(true);
  };

  const handleUserCreated = (newUser) => {
    setUsers(prev => [newUser, ...prev]);
    Alert.alert(
      t('success') || 'Success',
      language === 'es' 
        ? 'Usuario creado exitosamente'
        : 'User created successfully'
    );
  };

  const handleEditUser = (user) => {
    // TODO: Implement edit user functionality
    console.log('Edit user:', user);
    Alert.alert(
      language === 'es' ? 'Editar Usuario' : 'Edit User',
      language === 'es' 
        ? 'Funcionalidad de edición próximamente'
        : 'Edit functionality coming soon'
    );
  };

  const handleActivateUser = async (user) => {
    Alert.alert(
      language === 'es' ? 'Activar Usuario' : 'Activate User',
      language === 'es' 
        ? `¿Está seguro de que desea activar al usuario "${user.username}"?`
        : `Are you sure you want to activate user "${user.username}"?`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: language === 'es' ? 'Activar' : 'Activate',
          onPress: async () => {
            try {
              await apiClient.post(`/api/auth/users/${user.id}/activate`);
              setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, isActive: true } : u))
              );
              Alert.alert(
                t('success') || 'Success',
                language === 'es' 
                  ? 'Usuario activado exitosamente'
                  : 'User activated successfully'
              );
            } catch (error) {
              console.error('Error activating user:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error') || 'Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleDeactivateUser = async (user) => {
    Alert.alert(
      language === 'es' ? 'Desactivar Usuario' : 'Deactivate User',
      language === 'es' 
        ? `¿Está seguro de que desea desactivar al usuario "${user.username}"? Este usuario ya no podrá acceder a la aplicación.`
        : `Are you sure you want to deactivate user "${user.username}"? This user will no longer be able to access the application.`,
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: language === 'es' ? 'Desactivar' : 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.post(`/api/auth/users/${user.id}/deactivate`);
              setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, isActive: false } : u))
              );
              Alert.alert(
                t('success') || 'Success',
                language === 'es' 
                  ? 'Usuario desactivado exitosamente'
                  : 'User deactivated successfully'
              );
            } catch (error) {
              console.error('Error deactivating user:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error') || 'Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleViewUserReservations = (user) => {
    navigation.navigate('UserReservations', { 
      userId: user.id, 
      username: user.username 
    });
  };

  const handleBulkCreateUsers = () => {
    Alert.alert(
      language === 'es' ? 'Crear Usuarios en Lote' : 'Bulk Create Users',
      language === 'es' 
        ? '¿Desea crear usuarios para todos los apartamentos del 101 al 1000 con la contraseña predeterminada "Resident123!"?'
        : 'Do you want to create users for all apartments from 101 to 1000 with default password "Resident123!"?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        {
          text: language === 'es' ? 'Crear' : 'Create',
          onPress: async () => {
            try {
              const response = await apiClient.post('/api/auth/users/bulk-create');
              const newUsers = response.data.users || response.data;
              setUsers(prev => [...newUsers, ...prev]);
              Alert.alert(
                t('success') || 'Success',
                language === 'es' 
                  ? `Se crearon ${newUsers.length} usuarios de apartamentos con la contraseña predeterminada "Resident123!"`
                  : `Created ${newUsers.length} apartment users with default password "Resident123!"`
              );
            } catch (error) {
              console.error('Error bulk creating users:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error') || 'Error', errorMessage);
            }
          }
        },
      ]
    );
  };

  // Filters with translations
  const filters = [
    { key: 'all', label: language === 'es' ? 'Todos los Usuarios' : 'All Users' },
    { key: 'active', label: language === 'es' ? 'Activos' : 'Active' },
    { key: 'inactive', label: language === 'es' ? 'Inactivos' : 'Inactive' },
    { key: 'admins', label: language === 'es' ? 'Administradores' : 'Admins' },
    { key: 'residents', label: language === 'es' ? 'Residentes' : 'Residents' },
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

  const renderUserItem = ({ item }) => (
    <UserManagementCard
      user={item}
      onEdit={() => handleEditUser(item)}
      onActivate={() => handleActivateUser(item)}
      onDeactivate={() => handleDeactivateUser(item)}
      onViewReservations={() => handleViewUserReservations(item)}
    />
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyState}>
      <Icon name="people-outline" size={64} color={COLORS.text.secondary} />
      <Text style={styles.emptyTitle}>
        {language === 'es' ? 'No se Encontraron Usuarios' : 'No Users Found'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'all'
          ? (language === 'es' 
              ? 'Ningún usuario coincide con sus filtros actuales.'
              : 'No users match your current filters.')
          : (language === 'es' 
              ? 'Aún no se han creado usuarios.'
              : 'No users have been created yet.')
        }
      </Text>
      {!searchQuery && selectedFilter === 'all' && (
        <Button
          title={language === 'es' ? 'Crear Primer Usuario' : 'Create First User'}
          onPress={handleCreateUser}
          style={styles.emptyButton}
        />
      )}
    </Card>
  );

  // Show loading spinner while fetching
  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner 
          message={language === 'es' ? 'Cargando usuarios...' : 'Loading users...'} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with action buttons */}
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <Button
            title={t('createUser') || (language === 'es' ? 'Crear Usuario' : 'Create User')}
            onPress={handleCreateUser}
            leftIcon="person-add"
            style={styles.createButton}
          />
          <Button
            title={language === 'es' ? 'Crear en Lote' : 'Bulk Create'}
            onPress={handleBulkCreateUsers}
            leftIcon="group-add"
            variant="outline"
            style={styles.bulkButton}
          />
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Input
          placeholder={language === 'es' ? 'Buscar por nombre de usuario...' : 'Search by username...'}
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
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Total Usuarios' : 'Total Users'}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.isActive).length}
          </Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Activos' : 'Active'}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.role === 'admin').length}
          </Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Administradores' : 'Admins'}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.role === 'resident').length}
          </Text>
          <Text style={styles.statLabel}>
            {language === 'es' ? 'Residentes' : 'Residents'}
          </Text>
        </Card>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* User Creation Modal */}
      <UserCreationModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onUserCreated={handleUserCreated}
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
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  bulkButton: {
    flex: 1,
    marginLeft: SPACING.sm,
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
});

export default UserManagementScreen;