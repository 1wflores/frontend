// src/components/common/EmptyState.jsx - ENHANCED EMPTY STATE

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const EmptyState = ({ 
  icon = 'event-note',
  title,
  subtitle,
  actionText,
  onActionPress,
  loading = false 
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <Icon name="refresh" size={64} color={COLORS.text.secondary} />
        <Text style={styles.title}>Loading...</Text>
        <Text style={styles.subtitle}>Please wait while we fetch your data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={COLORS.text.secondary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Usage in ReservationsScreen:
const renderEmptyState = () => {
  if (loading) {
    return <EmptyState loading={true} />;
  }
  
  return (
    <EmptyState
      icon="event-note"
      title="No Reservations Yet"
      subtitle="You haven't made any reservations yet. Start by booking an amenity!"
      actionText="Browse Amenities"
      onActionPress={() => navigation.navigate('Amenities')}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background.primary,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  actionText: {
    color: COLORS.text.inverse,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default EmptyState;