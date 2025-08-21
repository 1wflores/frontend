import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { apiClient } from '../../services/apiClient';
import { UserManagementCard } from '../../components/admin/UserManagementCard';
import { UserCreationModal } from '../../components/admin/UserCreationModal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ ADDED: Language support
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator'; // ✅ ADDED: Error translation
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const UserManagementScreen = () => {
  const { language, t } = useLanguage(); // ✅ ADDED: Language hook
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await apiClient.get('/api/auth/users');
      const userData = response.data.data.users || [];
      setUsers(userData);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      // ✅ FIXED: Error translation
      const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
      Alert.alert(t('error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
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
  };

  const handleEditUser = (user) => {
    // TODO: Implement edit user functionality
    console.log('Edit user:', user);
  };

  const handleActivateUser = async (user) => {
    // ✅ FIXED: Activate confirmation with translations
    Alert.alert(
      language === 'es' ? 'Activar Usuario' : 'Activate User',
      language === 'es' 
        ? `¿Está seguro de que desea activar al usuario "${user.username}"?`
        : `Are you sure you want to activate user "${user.username}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: language === 'es' ? 'Activar' : 'Activate',
          onPress: async () => {
            try {
              await apiClient.post(`/api/auth/users/${user.id}/activate`);
              setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, isActive: true } : u))
              );
              // ✅ FIXED: Success message translation
              Alert.alert(
                t('success'),
                language === 'es' 
                  ? 'Usuario activado exitosamente'
                  : 'User activated successfully'
              );
            } catch (error) {
              console.error('Error activating user:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error'), errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleDeactivateUser = async (user) => {
    // ✅ FIXED: Deactivate confirmation with translations
    Alert.alert(
      language === 'es' ? 'Desactivar Usuario' : 'Deactivate User',
      language === 'es' 
        ? `¿Está seguro de que desea desactivar al usuario "${user.username}"? Este usuario ya no podrá acceder a la aplicación.`
        : `Are you sure you want to deactivate user "${user.username}"? This user will no longer be able to access the application.`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: language === 'es' ? 'Desactivar' : 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/api/auth/users/${user.id}`);
              setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, isActive: false } : u))
              );
              // ✅ FIXED: Success message translation
              Alert.alert(
                t('success'),
                language === 'es' 
                  ? 'Usuario desactivado exitosamente'
                  : 'User deactivated successfully'
              );
            } catch (error) {
              console.error('Error deactivating user:', error);
              const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
              Alert.alert(t('error'), errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleViewUserReservations = (user) => {
    // TODO: Navigate to user reservations
    console.log('View reservations for user:', user);
  };

  const handleBulkCreateUsers = () => {
    // ✅ FIXED: Bulk create prompt with translations
    Alert.prompt(
      language === 'es' ? 'Crear Usuarios en Lote' : 'Bulk Create Users',
      language === 'es' 
        ? 'Ingrese los números de apartamentos separados por comas (ej: 101,102,103):'
        : 'Enter apartment numbers separated by commas (e.g., 101,102,103):',
      async (apartmentNumbers) => {
        if (!apartmentNumbers) return;

        const numbers = apartmentNumbers
          .split(',')
          .map(num => num.trim())
          .filter(num => num.match(/^\d+$/));

        if (numbers.length === 0) {
          Alert.alert(
            t('error'), 
            language === 'es' 
              ? 'Por favor ingrese números de apartamentos válidos'
              : 'Please enter valid apartment numbers'
          );
          return;
        }

        try {
          const response = await apiClient.post('/api/auth/users/bulk-create', {
            apartmentNumbers: numbers,
          });

          if (response.data.success) {
            const newUsers = response.data.data.users;
            setUsers(prev => [...newUsers, ...prev]);
            // ✅ FIXED: Success message translation
            Alert.alert(
              t('success'),
              language === 'es' 
                ? `Se crearon ${newUsers.length} usuarios de apartamentos con la contraseña predeterminada "Resident123!"`
                : `Created ${newUsers.length} apartment users with default password "Resident123!"`
            );
          }
        } catch (error) {
          console.error('Error bulk creating users:', error);
          const errorMessage = ApiErrorTranslator.extractAndTranslateError(error, language);
          Alert.alert(t('error'), errorMessage);
        }
      }
    );
  };

  // ✅ FIXED: Filters with translations
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
      {/* ✅ FIXED: Empty state with translations */}
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

  if (loading && users.length === 0) {
    return <LoadingSpinner message={language === 'es' ? 'Cargando usuarios...' : 'Loading users...'} />;
  }

  return (
    <View style={styles.container}>
      {/* ✅ FIXED: Header with translated buttons */}
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <Button
            title={t('createUser')}
            onPress={handleCreateUser}
            leftIcon="person_add"
            style={styles.createButton}
          />
          <Button
            title={language === 'es' ? 'Crear en Lote' : 'Bulk Create'}
            onPress={handleBulkCreateUsers}
            leftIcon="group_add"
            variant="outline"
            style={styles.bulkButton}
          />
        </View>
      </View>

      {/* ✅ FIXED: Search and Filters with translations */}
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

      {/* ✅ FIXED: Stats with translations */}
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