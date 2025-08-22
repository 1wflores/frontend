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

    // Lounge requires 24-hour advance booking
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

  // FIXED: Enhanced apartment number extraction with better error handling
  static extractApartmentNumber(identifier) {
    console.log('🔍 extractApartmentNumber called with:', identifier, typeof identifier);
    
    // Handle undefined/null/empty values
    if (!identifier || identifier === undefined || identifier === null) {
      console.warn('⚠️ extractApartmentNumber: identifier is null/undefined');
      return 'Unknown';
    }

    // Handle case where identifier is an object with username property
    if (typeof identifier === 'object') {
      if (identifier.username) {
        console.log('🔄 extractApartmentNumber: extracting from object.username');
        return this.extractApartmentNumber(identifier.username);
      }
      if (identifier.user && identifier.user.username) {
        console.log('🔄 extractApartmentNumber: extracting from object.user.username');
        return this.extractApartmentNumber(identifier.user.username);
      }
      // If it's an object but doesn't have username, convert to string
      console.warn('⚠️ extractApartmentNumber: object without username property:', identifier);
      return 'Unknown';
    }

    // Convert to string if it's not already
    const identifierStr = String(identifier).trim();
    
    if (!identifierStr) {
      console.warn('⚠️ extractApartmentNumber: identifier is empty string');
      return 'Unknown';
    }

    // Handle admin cases
    if (identifierStr.toLowerCase() === 'admin' || identifierStr === 'apartment000') {
      console.log('✅ extractApartmentNumber: admin user detected');
      return 'Admin';
    }

    // Handle apartment format (apartment204 -> 204)
    const apartmentMatch = identifierStr.match(/apartment(\d+)/i);
    if (apartmentMatch) {
      const number = apartmentMatch[1];
      console.log('✅ extractApartmentNumber: extracted apartment number:', number);
      return number;
    }

    // Handle direct numbers (204 -> 204)
    const numberMatch = identifierStr.match(/^\d+$/);
    if (numberMatch) {
      console.log('✅ extractApartmentNumber: direct number format:', identifierStr);
      return identifierStr;
    }

    // Handle apartment format with different cases (Apartment204, APARTMENT204)
    const apartmentCaseMatch = identifierStr.match(/apartment(\d+)/gi);
    if (apartmentCaseMatch && apartmentCaseMatch.length > 0) {
      const match = apartmentCaseMatch[0].match(/(\d+)/);
      if (match) {
        const number = match[1];
        console.log('✅ extractApartmentNumber: case-insensitive apartment number:', number);
        return number;
      }
    }

    // Handle user IDs that might be apartment numbers
    if (identifierStr.startsWith('user_apartment_')) {
      const userIdMatch = identifierStr.match(/user_apartment_(\d+)/);
      if (userIdMatch) {
        const number = userIdMatch[1];
        console.log('✅ extractApartmentNumber: from user ID:', number);
        return number;
      }
    }

    // Fallback for any other format - try to extract any numbers
    const anyNumberMatch = identifierStr.match(/(\d+)/);
    if (anyNumberMatch) {
      const number = anyNumberMatch[1];
      console.log('⚠️ extractApartmentNumber: fallback number extraction:', number);
      return number;
    }

    // Final fallback for unrecognized formats
    console.warn('⚠️ extractApartmentNumber: unrecognized format, returning as-is:', identifierStr);
    return identifierStr.charAt(0).toUpperCase() + identifierStr.slice(1);
  }

  // Enhanced method to get apartment display text from reservation object
  static getApartmentFromReservation(reservation) {
    console.log('🏠 getApartmentFromReservation called with:', reservation);
    
    // Try multiple possible sources for apartment information
    const possibleSources = [
      reservation.username,
      reservation.user?.username,
      reservation.userId,
      reservation.apartmentNumber,
      reservation.apartment,
      reservation.createdBy,
      reservation.userDetails?.username,
    ];

    for (const source of possibleSources) {
      if (source) {
        const apartment = this.extractApartmentNumber(source);
        if (apartment && apartment !== 'Unknown') {
          console.log('✅ getApartmentFromReservation: found apartment from', source, ':', apartment);
          return apartment;
        }
      }
    }

    console.warn('⚠️ getApartmentFromReservation: no apartment found, returning Unknown');
    return 'Unknown';
  }

  // Check if reservation needs approval
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

  // Validate admin restrictions
  static validateAdminReservation(user, amenityType) {
    if (user?.role === 'admin' && amenityType !== 'maintenance') {
      return {
        isValid: false,
        error: 'Administrators can only make maintenance reservations'
      };
    }
    return { isValid: true };
  }

  // Enhanced email validation
  static validateEmail(email) {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true };
  }

  // Phone number validation
  static validatePhoneNumber(phone) {
    if (!phone) {
      return { isValid: false, error: 'Phone number is required' };
    }

    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (assuming 10 digits for simplicity)
    if (cleaned.length < 10) {
      return { isValid: false, error: 'Phone number must be at least 10 digits' };
    }

    return { isValid: true };
  }

  // Validate special requests/notes
  static validateNotes(notes) {
    if (!notes) {
      return { isValid: true }; // Notes are optional
    }

    if (notes.length > 1000) {
      return { isValid: false, error: 'Notes must be less than 1000 characters' };
    }

    return { isValid: true };
  }

  // Validate capacity
  static validateCapacity(capacity) {
    if (!capacity || isNaN(capacity)) {
      return { isValid: false, error: 'Capacity must be a number' };
    }

    const cap = parseInt(capacity);
    if (cap < 1 || cap > 100) {
      return { isValid: false, error: 'Capacity must be between 1 and 100' };
    }

    return { isValid: true };
  }
}