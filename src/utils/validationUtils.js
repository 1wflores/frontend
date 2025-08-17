export class ValidationUtils {
  static validateApartmentUsername(username) {
    if (!username) {
      return { isValid: false, error: 'Username is required' };
    }

    if (username === 'admin') {
      return { isValid: true };
    }

    const apartmentRegex = /^apartment\d+$/i;
    if (!apartmentRegex.test(username)) {
      return { 
        isValid: false, 
        error: 'Username must be in format: apartment + number (e.g., apartment204)' 
      };
    }

    return { isValid: true };
  }

  static validatePassword(password) {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }

    return { isValid: true };
  }

  static validateReservationTime(startTime, endTime, amenityType = null) {
    const now = new Date();

    if (startTime <= now) {
      return { isValid: false, error: 'Start time must be in the future' };
    }

    // 🔥 NEW: Lounge requires 24-hour advance booking
    if (amenityType === 'lounge') {
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      if (startTime < twentyFourHoursFromNow) {
        return { 
          isValid: false, 
          error: 'Lounge reservations must be made at least 24 hours in advance' 
        };
      }
    }

    if (endTime <= startTime) {
      return { isValid: false, error: 'End time must be after start time' };
    }

    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    if (durationHours > 4) {
      return { isValid: false, error: 'Reservation cannot exceed 4 hours' };
    }

    return { isValid: true };
  }

  static validateVisitorCount(count, maxAllowed) {
    if (count < 1) {
      return { isValid: false, error: 'At least 1 visitor is required' };
    }

    if (count > maxAllowed) {
      return { isValid: false, error: `Maximum ${maxAllowed} visitors allowed` };
    }

    return { isValid: true };
  }

  // ✅ FIXED: Proper apartment number extraction with better error handling
  static extractApartmentNumber(identifier) {
    console.log('🔍 extractApartmentNumber called with:', identifier, typeof identifier);
    
    // Handle undefined/null/empty values
    if (!identifier || identifier === undefined || identifier === null) {
      console.warn('⚠️ extractApartmentNumber: identifier is null/undefined');
      return 'Unknown';
    }

    // Convert to string if it's not already
    const identifierStr = String(identifier).trim();
    
    if (!identifierStr) {
      console.warn('⚠️ extractApartmentNumber: identifier is empty string');
      return 'Unknown';
    }

    // Handle admin cases
    if (identifierStr === 'admin' || identifierStr === 'apartment000') {
      return 'Admin';
    }

    // Handle apartment format (apartment204 -> 204)
    const apartmentMatch = identifierStr.match(/apartment(\d+)/i);
    if (apartmentMatch) {
      const number = apartmentMatch[1];
      console.log('✅ extractApartmentNumber: extracted number:', number);
      return number;
    }

    // Handle direct numbers (204 -> 204)
    const numberMatch = identifierStr.match(/^\d+$/);
    if (numberMatch) {
      console.log('✅ extractApartmentNumber: direct number:', identifierStr);
      return identifierStr;
    }

    // Fallback for any other format
    console.warn('⚠️ extractApartmentNumber: unrecognized format:', identifierStr);
    return identifierStr.toUpperCase();
  }

  // 🔥 NEW: Check if reservation needs approval
  static needsApproval(reservationData, userReservations = []) {
    const { amenityId, startTime, userId } = reservationData;
    const reservationDate = new Date(startTime).toDateString();

    // Check if user has already booked the same amenity on the same date
    const existingReservation = userReservations.find(reservation => 
      reservation.amenityId === amenityId && 
      reservation.userId === userId &&
      new Date(reservation.startTime).toDateString() === reservationDate &&
      ['approved', 'pending'].includes(reservation.status)
    );

    // If there's an existing reservation for same amenity + user + date, needs approval
    return !!existingReservation;
  }

  // 🔥 NEW: Validate admin restrictions
  static validateAdminReservation(user, amenityType) {
    if (user?.role === 'admin' && amenityType !== 'maintenance') {
      return {
        isValid: false,
        error: 'Administrators can only make maintenance reservations'
      };
    }
    return { isValid: true };
  }
}