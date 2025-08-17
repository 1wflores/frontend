// Navigation utilities for JavaScript project

// Screen name constants for better maintainability
export const SCREEN_NAMES = {
  // Auth Stack
  LOGIN: 'Login',
  
  // Main Stack
  MAIN_TABS: 'MainTabs',
  AMENITY_BOOKING: 'AmenityBooking',
  BOOKING_CONFIRMATION: 'BookingConfirmation',
  
  // Main Tabs
  DASHBOARD: 'Dashboard',
  RESERVATIONS: 'Reservations',
  AMENITIES: 'Amenities',
  PROFILE: 'Profile',
  ADMIN: 'Admin',
  
  // Admin Screens (for future use)
  USER_MANAGEMENT: 'UserManagement',
  RESERVATION_MANAGEMENT: 'ReservationManagement',
};

// Navigation helper functions
export const navigationHelpers = {
  // Helper to check if current route is a certain screen
  isCurrentScreen: (routeName, targetScreen) => {
    return routeName === targetScreen;
  },
  
  // Helper to get screen title
  getScreenTitle: (screenName) => {
    const titles = {
      [SCREEN_NAMES.LOGIN]: 'Login',
      [SCREEN_NAMES.DASHBOARD]: 'Home',
      [SCREEN_NAMES.RESERVATIONS]: 'My Bookings',
      [SCREEN_NAMES.AMENITIES]: 'Book Amenities',
      [SCREEN_NAMES.PROFILE]: 'Profile',
      [SCREEN_NAMES.ADMIN]: 'Admin',
      [SCREEN_NAMES.AMENITY_BOOKING]: 'Book Amenity',
      [SCREEN_NAMES.BOOKING_CONFIRMATION]: 'Booking Confirmed',
    };
    return titles[screenName] || screenName;
  }
};