// src/utils/localization.js - COMPLETE WORKING VERSION

import AsyncStorage from '@react-native-async-storage/async-storage';

export class Localization {
  // Static properties
  static currentLanguage = 'en';
  static LANGUAGE_KEY = '@amenity_app_language';

  // Data translations for server responses
  static dataTranslations = {
    // Validation error messages from server
    validationErrors: {
      'End time must be after start time': 'La hora de fin debe ser después de la hora de inicio',
      'Cannot create reservations in the past': 'No se pueden crear reservas en el pasado',
      'The selected time slot is no longer available': 'El horario seleccionado ya no está disponible',
      'Amenity is not available on this day': 'La amenidad no está disponible este día',
      'Reservation duration cannot exceed 8 hours': 'La reserva no puede exceder 8 horas',
      'Visitor count must be between 1 and 50': 'El número de visitantes debe estar entre 1 y 50',
      'Notes must be less than 1000 characters': 'Las notas deben tener menos de 1000 caracteres',
      'Invalid status': 'Estado inválido',
      'Amenity not found': 'Amenidad no encontrada',
      'User not found': 'Usuario no encontrado',
      'Invalid credentials': 'Credenciales inválidas',
      'Unauthorized': 'No autorizado',
      'Forbidden': 'Prohibido',
      'Internal server error': 'Error interno del servidor',
    },

    // Amenity names
    amenities: {
      'Jacuzzi': 'Jacuzzi',
      'Cold Tub': 'Tina Fría',
      'Community Lounge': 'Salón Comunitario',
      'Yoga Deck': 'Terraza de Yoga',
    },

    // Status translations
    status: {
      'pending': 'pendiente',
      'approved': 'aprobado',
      'confirmed': 'confirmado',
      'denied': 'denegado',
      'cancelled': 'cancelado',
      'completed': 'completado',
    },

    // Common terms
    common: {
      'available': 'disponible',
      'unavailable': 'no disponible',
      'active': 'activo',
      'inactive': 'inactivo',
      'maintenance': 'mantenimiento',
    }
  };

  static errorMessages = {
    en: {
      'End time must be after start time': 'End time must be after start time',
      'Cannot create reservations in the past': 'Cannot create reservations in the past',
      'The selected time slot is no longer available': 'The selected time slot is no longer available',
      'Amenity is not available on this day': 'Amenity is not available on this day',
      'Reservation duration cannot exceed 8 hours': 'Reservation duration cannot exceed 8 hours',
      'Visitor count must be between 1 and 50': 'Visitor count must be between 1 and 50',
      'Notes must be less than 1000 characters': 'Notes must be less than 1000 characters',
      'Invalid status': 'Invalid status',
      'Amenity not found': 'Amenity not found',
      'User not found': 'User not found',
      'Invalid credentials': 'Invalid credentials',
      'Unauthorized': 'Unauthorized',
      'Forbidden': 'Forbidden',
      'Internal server error': 'Internal server error',
    },
    es: {
      'End time must be after start time': 'La hora de fin debe ser después de la hora de inicio',
      'Cannot create reservations in the past': 'No se pueden crear reservas en el pasado',
      'The selected time slot is no longer available': 'El horario seleccionado ya no está disponible',
      'Amenity is not available on this day': 'La amenidad no está disponible este día',
      'Reservation duration cannot exceed 8 hours': 'La reserva no puede exceder 8 horas',
      'Visitor count must be between 1 and 50': 'El número de visitantes debe estar entre 1 y 50',
      'Notes must be less than 1000 characters': 'Las notas deben tener menos de 1000 caracteres',
      'Invalid status': 'Estado inválido',
      'Amenity not found': 'Amenidad no encontrada',
      'User not found': 'Usuario no encontrado',
      'Invalid credentials': 'Credenciales inválidas',
      'Unauthorized': 'No autorizado',
      'Forbidden': 'Prohibido',
      'Internal server error': 'Error interno del servidor',
    }
  };

  // Complete UI Translation strings
  static translations = {
    en: {
      // Navigation & General
      dashboard: 'Dashboard',
      reservations: 'My Bookings',
      amenities: 'Book Amenities', 
      profile: 'Profile',
      admin: 'Admin',
      home: 'Home',
      
      // Login Screen
      loginTitle: 'Amenity Reservation',
      loginSubtitle: 'Sign in with your apartment credentials',
      apartmentUsername: 'Apartment Username',
      password: 'Password',
      signIn: 'Sign In',
      loginFailed: 'Login Failed',
      invalidCredentials: 'Invalid username or password',
      passwordChangeNote: 'Password can only be changed by your building administrator',
      
      // Dashboard
      goodMorning: 'Good morning',
      goodAfternoon: 'Good afternoon', 
      goodEvening: 'Good evening',
      readyToBook: 'Ready to book your next amenity?',
      today: 'Today',
      pending: 'Pending',
      thisWeek: 'This Week',
      available: 'Available',
      todaysReservations: 'Today\'s Reservations',
      quickBook: 'Quick Book',
      viewAll: 'View All',
      upcomingReservations: 'Upcoming Reservations',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      bookAmenity: 'Book Amenity',
      myBookings: 'My Bookings',
      noUpcomingReservations: 'No upcoming reservations',
      bookAmenityToSee: 'Book an amenity to see your reservations here',

      // Date/Time/Status
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      startTime: 'Start Time',
      endTime: 'End Time',
      submitted: 'submitted',
      submittedOn: 'submitted',
      submittedAgo: 'submitted ago',
      
      // Booking Process
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      selectDateTime: 'Select Date & Time',
      additionalDetails: 'Additional Details',
      confirmReservation: 'Confirm Reservation',
      chooseWhenToUse: 'Choose when you\'d like to use',
      loungeWarning: 'Lounge requires 24-hour advance booking',
      availableSlotsFor: 'Available slots for',
      selectedTime: 'Selected Time',
      changeTime: 'Change Time',
      back: 'Back',
      continue: 'Continue',
      review: 'Review',
      confirmBooking: 'Confirm Booking',
      
      // NEW: Community Lounge Specific
      numberOfVisitors: 'Number of Visitors',
      numberOfGuests: 'Number of Guests',
      howManyPeople: 'How many people will be attending?',
      maximumPeople: 'Maximum',
      people: 'people',
      willUseGrill: 'Will Use Grill',
      grillUsage: 'Grill Usage',
      additionalFeesApply: 'Additional fees apply',
      grillUsageNote: 'Additional fees apply for grill usage',
      
      // Duration Selection
      selectDuration: 'Select Duration',
      howLongNeed: 'How long will you need the amenity?',
      loungeCanBeBooked: 'Community lounge can be booked for up to 4 hours',
      selectHowLongLounge: 'Select how long you\'ll need the community lounge',
      showingTimeSlots: 'Showing time slots',
      
      // Time Display
      hour: 'hour',
      hours: 'hours',
      minute: 'minute',
      minutes: 'minutes',
      '1h': '1h',
      '1h30m': '1h 30m',
      '2h': '2h',
      '2h30m': '2h 30m',
      '3h': '3h',
      '3h30m': '3h 30m',
      '4h': '4h',
      
      // Reservation Details
      reservationDetails: 'Reservation Details',
      amenity: 'Amenity',
      visitorCount: 'Visitor Count',
      grillIncluded: 'Grill Included',
      yes: 'Yes',
      no: 'No',
      
      // Booking Steps
      step1: 'Date & Time',
      step2: 'Details',
      dateTimeStep: 'Select Date & Time',
      detailsStep: 'Reservation Details',
      
      // Availability
      availableTimes: 'Available Times',
      noTimeSlotsAvailable: 'No time slots available for this date',
      tryDifferentDate: 'Try selecting a different date',
      tryDifferentDuration: 'Try selecting a different date or duration',
      loadingTimeSlots: 'Loading time slots...',
      
      // Validation Messages
      pleaseSelectTimeSlot: 'Please select a time slot',
      visitorCountBetween: 'Number of visitors must be between 1 and',
      notesOptional: 'Notes (Optional)',
      additionalNotes: 'Additional Notes',
      anyAdditionalInfo: 'Any additional information...',
      
      // Success/Error
      error: 'Error',
      success: 'Success',
      reservationCreated: 'Reservation created successfully!',
      errorCreatingReservation: 'Error creating reservation',
      loadingAmenity: 'Loading amenity...',
      errorLoadingAmenity: 'Error loading amenity details',
      
      // Status
      confirmed: 'Confirmed',
      pending: 'Pending',
      approved: 'Approved',
      denied: 'Denied',
      cancelled: 'Cancelled',
    },
    es: {
      // Navigation & General
      dashboard: 'Panel Principal',
      reservations: 'Mis Reservas',
      amenities: 'Reservar Amenidades',
      profile: 'Perfil',
      admin: 'Administrador',
      home: 'Inicio',
      
      // Login Screen
      loginTitle: 'Reserva de Amenidades',
      loginSubtitle: 'Inicie sesión con sus credenciales de apartamento',
      apartmentUsername: 'Usuario del Apartamento',
      password: 'Contraseña',
      signIn: 'Iniciar Sesión',
      loginFailed: 'Error de Inicio de Sesión',
      invalidCredentials: 'Usuario o contraseña inválidos',
      passwordChangeNote: 'La contraseña solo puede ser cambiada por el administrador del edificio',
      
      // Dashboard
      goodMorning: 'Buenos días',
      goodAfternoon: 'Buenas tardes',
      goodEvening: 'Buenas noches',
      readyToBook: '¿Listo para reservar su próxima amenidad?',
      today: 'Hoy',
      pending: 'Pendiente',
      thisWeek: 'Esta Semana',
      available: 'Disponible',
      todaysReservations: 'Reservas de Hoy',
      quickBook: 'Reserva Rápida',
      viewAll: 'Ver Todas',
      upcomingReservations: 'Próximas Reservas',
      recentActivity: 'Actividad Reciente',
      quickActions: 'Acciones Rápidas',
      bookAmenity: 'Reservar Amenidad',
      myBookings: 'Mis Reservas',
      noUpcomingReservations: 'No hay reservas próximas',
      bookAmenityToSee: 'Reserve una amenidad para ver sus reservas aquí',

      // Date/Time/Status
      date: 'Fecha',
      time: 'Hora',
      duration: 'Duración',
      startTime: 'Hora de Inicio',
      endTime: 'Hora de Fin',
      submitted: 'enviada',
      submittedOn: 'enviada',
      submittedAgo: 'enviada hace',
      
      // Booking Process
      selectDate: 'Seleccionar Fecha',
      selectTime: 'Seleccionar Hora',
      selectDateTime: 'Seleccione Fecha y Hora',
      additionalDetails: 'Detalles Adicionales',
      confirmReservation: 'Confirmar Reserva',
      chooseWhenToUse: 'Elija cuándo le gustaría usar',
      loungeWarning: 'El salón requiere reserva con 24 horas de anticipación',
      availableSlotsFor: 'Horarios disponibles para',
      selectedTime: 'Hora Seleccionada',
      changeTime: 'Cambiar Hora',
      back: 'Anterior',
      continue: 'Continuar',
      review: 'Revisar',
      confirmBooking: 'Confirmar Reserva',
      
      // NEW: Community Lounge Specific
      numberOfVisitors: 'Número de Visitantes',
      numberOfGuests: 'Número de Invitados',
      howManyPeople: '¿Cuántas personas asistirán?',
      maximumPeople: 'Máximo',
      people: 'personas',
      willUseGrill: 'Usará la Parrilla',
      grillUsage: 'Uso de Parrilla',
      additionalFeesApply: 'Se aplican cargos adicionales',
      grillUsageNote: 'Se aplican cargos adicionales por el uso de la parrilla',
      
      // Duration Selection
      selectDuration: 'Seleccionar Duración',
      howLongNeed: '¿Por cuánto tiempo necesitará la amenidad?',
      loungeCanBeBooked: 'El salón comunitario puede reservarse hasta por 4 horas',
      selectHowLongLounge: 'Seleccione cuánto tiempo necesitará el salón comunitario',
      showingTimeSlots: 'Mostrando slots de',
      
      // Time Display
      hour: 'hora',
      hours: 'horas',
      minute: 'minuto',
      minutes: 'minutos',
      '1h': '1h',
      '1h30m': '1h 30m',
      '2h': '2h',
      '2h30m': '2h 30m',
      '3h': '3h',
      '3h30m': '3h 30m',
      '4h': '4h',
      
      // Reservation Details
      reservationDetails: 'Detalles de la Reserva',
      amenity: 'Amenidad',
      visitorCount: 'Número de Visitantes',
      grillIncluded: 'Parrilla Incluida',
      yes: 'Sí',
      no: 'No',
      
      // Booking Steps
      step1: 'Fecha y Hora',
      step2: 'Detalles',
      dateTimeStep: 'Seleccionar Fecha y Hora',
      detailsStep: 'Detalles de la Reserva',
      
      // Availability
      availableTimes: 'Horarios Disponibles',
      noTimeSlotsAvailable: 'No hay horarios disponibles para esta fecha',
      tryDifferentDate: 'Intente seleccionar una fecha diferente',
      tryDifferentDuration: 'Intente con otra fecha o duración',
      loadingTimeSlots: 'Cargando horarios...',
      
      // Validation Messages
      pleaseSelectTimeSlot: 'Por favor seleccione una hora',
      visitorCountBetween: 'El número de visitantes debe estar entre 1 y',
      notesOptional: 'Notas (Opcional)',
      additionalNotes: 'Notas Adicionales',
      anyAdditionalInfo: 'Cualquier información adicional...',
      
      // Success/Error
      error: 'Error',
      success: 'Éxito',
      reservationCreated: '¡Reserva creada exitosamente!',
      errorCreatingReservation: 'Error al crear la reservación',
      loadingAmenity: 'Cargando amenidad...',
      errorLoadingAmenity: 'Error al cargar detalles de la amenidad',
      
      // Status
      confirmed: 'Confirmada',
      pending: 'Pendiente',
      approved: 'Aprobada',
      denied: 'Denegada',
      cancelled: 'Cancelada',
    }
  };

  // Initialize with stored language preference
  static async initialize() {
    try {
      const storedLanguage = await AsyncStorage.getItem(this.LANGUAGE_KEY);
      if (storedLanguage && ['en', 'es'].includes(storedLanguage)) {
        this.currentLanguage = storedLanguage;
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  }

  // Set and persist language
  static async setLanguage(language) {
    if (!['en', 'es'].includes(language)) {
      throw new Error('Unsupported language');
    }
    
    this.currentLanguage = language;
    try {
      await AsyncStorage.setItem(this.LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }

  // Get current language - FIX: Make this async to match LanguageProvider expectations
  static async getCurrentLanguage() {
    try {
      const storedLanguage = await AsyncStorage.getItem(this.LANGUAGE_KEY);
      if (storedLanguage && ['en', 'es'].includes(storedLanguage)) {
        this.currentLanguage = storedLanguage;
        return storedLanguage;
      }
      return this.currentLanguage; // Return default if no stored language
    } catch (error) {
      console.error('Error getting current language:', error);
      return this.currentLanguage; // Return default on error
    }
  }

  // Get translation for a key
  static t(key, language = null) {
    const lang = language || this.currentLanguage;
    return this.translations[lang]?.[key] || this.translations.en[key] || key;
  }

  // Translate data stored in English to user's language
  static translateData(category, englishValue, language = null) {
    const lang = language || this.currentLanguage;
    
    // If language is English or translation category doesn't exist, return original
    if (lang === 'en' || !this.dataTranslations[category]) {
      return englishValue;
    }

    // Return translated value or original if translation doesn't exist
    return this.dataTranslations[category][englishValue] || englishValue;
  }

  // Translate server validation errors
  static translateValidationError(englishError, language = null) {
    return this.translateData('validationErrors', englishError, language);
  }

  // Translate amenity name
  static translateAmenity(englishName, language = null) {
    return this.translateData('amenities', englishName, language);
  }

  // Translate status
  static translateStatus(englishStatus, language = null) {
    return this.translateData('status', englishStatus, language);
  }

  // Translate common terms
  static translateCommon(englishTerm, language = null) {
    return this.translateData('common', englishTerm, language);
  }

  // Smart text translation - handles mixed content including validation errors
  static smartTranslate(text, language = null) {
    if (!text) return text;
    
    const lang = language || this.currentLanguage;
    if (lang === 'en') return text;

    let translatedText = text;

    // Check all data translation categories
    Object.keys(this.dataTranslations).forEach(category => {
      Object.keys(this.dataTranslations[category]).forEach(englishTerm => {
        const spanishTerm = this.dataTranslations[category][englishTerm];
        // Use word boundaries to avoid partial matches
        const regex = new RegExp(`\\b${englishTerm}\\b`, 'gi');
        translatedText = translatedText.replace(regex, spanishTerm);
      });
    });

    return translatedText;
  }

  // Get available languages
  static getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' }
    ];
  }

  static getTranslation(key, language = 'en') {
    return this.translations[language]?.[key] || this.translations.en[key] || key;
  }

  static getErrorMessage(key, language = 'en') {
    return this.errorMessages[language]?.[key] || this.errorMessages.en[key] || key;
  }

  // Helper method for pluralization
  static pluralize(count, singular, plural, language = 'en') {
    if (language === 'es') {
      return count === 1 ? singular : (plural || singular + 's');
    }
    return count === 1 ? singular : (plural || singular + 's');
  }

  // Helper method for time duration formatting
  static formatDuration(minutes, language = 'en') {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}${language === 'es' ? 'm' : 'm'}`;
    } else if (remainingMinutes === 0) {
      return `${hours}${language === 'es' ? 'h' : 'h'}`;
    } else {
      return `${hours}${language === 'es' ? 'h' : 'h'} ${remainingMinutes}${language === 'es' ? 'm' : 'm'}`;
    }
  }
}

// Export for hook usage
export const useLocalization = (language = 'en') => {
  const t = (key) => Localization.getTranslation(key, language);
  const tError = (key) => Localization.getErrorMessage(key, language);
  
  return { t, tError };
};