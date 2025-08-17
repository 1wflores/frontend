import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';

export const Card = ({ 
  children, 
  style, 
  padding = SPACING.md 
}) => {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: SPACING.sm,
  },
});