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
import { apiClient } from '../../services/apiClient'; // ✅ Use real API client
import { UserManagementCard } from '../../components/admin/UserManagementCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // ✅ FIXED: Use real API call instead of mock data
      const response = await apiClient.get('/api/auth/users');
      const userData = response.data.data.users || [];
      setUsers(userData);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
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
    Alert.alert(
      'Create User',
      'User creation feature will be implemented in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleEditUser = (user) => {
    Alert.alert(
      'Edit User',
      `Edit functionality for ${user.username} will be implemented in a future update.`,
      [{ text: 'OK' }]
    );
  };

  const handleActivateUser = async (user) => {
    Alert.alert(
      'Activate User',
      `Are you sure you want to activate ${user.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            try {
              // ✅ FUTURE: When you implement this endpoint
              Alert.alert('Info', 'User activation will be implemented in a future update');
              // await apiClient.patch(`/api/auth/users/${user.id}/activate`);
              // await fetchUsers(); // Refresh data
            } catch (error) {
              console.error('Error activating user:', error);
              Alert.alert('Error', 'Failed to activate user');
            }
          },
        },
      ]
    );
  };

  const handleDeactivateUser = async (user) => {
    Alert.alert(
      'Deactivate User',
      `Are you sure you want to deactivate ${user.username}? They will no longer be able to make reservations.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ FIXED: Use real API call (this endpoint exists in your backend)
              await apiClient.delete(`/api/auth/users/${user.id}`);
              Alert.alert('Success', 'User deactivated successfully');
              await fetchUsers(); // Refresh data
            } catch (error) {
              console.error('Error deactivating user:', error);
              Alert.alert('Error', 'Failed to deactivate user');
            }
          },
        },
      ]
    );
  };

  const handleViewUserReservations = (user) => {
    Alert.alert(
      'User Reservations',
      `View reservations for ${user.username} will be implemented in a future update.`,
      [{ text: 'OK' }]
    );
  };

  const filters = [
    { key: 'all', label: 'All Users' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'admins', label: 'Admins' },
    { key: 'residents', label: 'Residents' },
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
      <Text style={styles.emptyTitle}>No Users Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'all'
          ? 'No users match your current filters.'
          : 'No users have been created yet.'}
      </Text>
      {!searchQuery && selectedFilter === 'all' && (
        <Button
          title="Create First User"
          onPress={handleCreateUser}
          style={styles.emptyButton}
        />
      )}
    </Card>
  );

  if (loading && users.length === 0) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header with Create Button */}
      <View style={styles.header}>
        <Button
          title="Create User"
          onPress={handleCreateUser}
          leftIcon="person-add"
          style={styles.createButton}
        />
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search by username..."
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
          <Text style={styles.statLabel}>Total Users</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.isActive).length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.role === 'admin').length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{users.filter(u => u.role === 'resident').length}</Text>
          <Text style={styles.statLabel}>Residents</Text>
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
  createButton: {
    alignSelf: 'flex-end',
    minWidth: 120,
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