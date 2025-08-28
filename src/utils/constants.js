// src/utils/constants.js - FIXED VERSION

export const API_CONFIG = {
  BASE_URL: 'https://reservation-app-fhb8f7g7duanh7g2.centralus-01.azurewebsites.net', // Always use production
  TIMEOUT: 30000,
};

export const COLORS = {
  primary: '#6264A7',
  secondary: '#464775',
  accent: '#8B8D97',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#E74C3C',
  success: '#27AE60',
  warning: '#F39C12',
  text: {
    primary: '#2D2D30',
    secondary: '#8B8D97',
    inverse: '#FFFFFF',
  },
  // ADD THESE MISSING PROPERTIES
  border: {
    light: '#E0E0E0',    // Light border for cards and dividers
    default: '#D0D0D0',  // Default border color
    dark: '#B0B0B0',     // Darker border for emphasis
  },
  white: '#FFFFFF',      // Add white color for selectedTypeLabel styles
  // ALSO ADD NESTED BACKGROUND PROPERTIES
  background: {
    default: '#F5F5F5',
    card: '#FFFFFF',
    error: '#FFEBEE',    // Light error background
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
};

export const AMENITY_ICONS = {
  jacuzzi: 'hot-tub',
  'cold-tub': 'ac-unit',
  'yoga-deck': 'self-improvement',
  lounge: 'weekend',
};

export const STATUS_COLORS = {
  pending: COLORS.warning,
  approved: COLORS.success,
  denied: COLORS.error,
  cancelled: COLORS.accent,
  completed: COLORS.primary,
};

export const RESERVATION_STATUS_MESSAGES = {
  pending: 'Waiting for approval',
  approved: 'Confirmed',
  denied: 'Not approved',
  cancelled: 'Cancelled',
  completed: 'Completed',
};