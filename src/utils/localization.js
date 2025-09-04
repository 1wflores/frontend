// src/utils/localization.js - COMPLETE VERSION with ALL existing functionality + enhanced auth

import AsyncStorage from '@react-native-async-storage/async-storage';

export class Localization {
  // Static properties
  static currentLanguage = 'en';
  static LANGUAGE_KEY = '@amenity_app_language';

  // ✅ PRESERVED: Existing data translations for server responses
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
      'Authentication failed': 'Falló la autenticación',
      'Unauthorized': 'No autorizado',
      'Forbidden': 'Prohibido',
      'Internal server error': 'Error interno del servidor',
      'Cannot book consecutive weekend days': 'No se pueden reservar días consecutivos de fin de semana',
      'You already have a reservation that conflicts with this request': 'Ya tienes una reserva que entra en conflicto con esta solicitud',
      'Consecutive weekend bookings are not allowed': 'No se permiten reservas consecutivas de fin de semana',
      'The selected time slot conflicts with an existing reservation': 'El horario seleccionado entra en conflicto con una reserva existente',
      'Reservation must be at least 24 hours in advance': 'La reserva debe hacerse con al menos 24 horas de anticipación',
      'Maximum duration exceeded': 'Duración máxima excedida',
      'Amenity is closed at this time': 'La amenidad está cerrada en este horario',
    },

    // Amenity names
    amenities: {
      'Jacuzzi': 'Jacuzzi',
      'Cold Tub': 'Tina Fría',
      'Community Lounge': 'Salón Comunitario',
      'Yoga Deck': 'Terraza de Yoga',
      'Rooftop Terrace': 'Terraza en Azotea',
      'Gym': 'Gimnasio',
      'Pool': 'Piscina',
      'BBQ Area': 'Área de Barbacoa',
      'Conference Room': 'Sala de Conferencias',
      'Game Room': 'Sala de Juegos',
    },

    // Status translations
    status: {
      'pending': 'pendiente',
      'approved': 'aprobada',
      'confirmed': 'confirmada',
      'denied': 'denegada',
      'rejected': 'rechazada',
      'cancelled': 'cancelada',
      'completed': 'completada',
      'active': 'activa',
      'inactive': 'inactiva',
    },

    // Common terms
    common: {
      'morning': 'mañana',
      'afternoon': 'tarde',
      'evening': 'noche',
      'weekday': 'día de semana',
      'weekend': 'fin de semana',
      'today': 'hoy',
      'tomorrow': 'mañana',
      'yesterday': 'ayer',
      'minutes': 'minutos',
      'hours': 'horas',
      'days': 'días',
      'weeks': 'semanas',
      'months': 'meses',
      'Friday': 'Viernes',
      'Saturday': 'Sábado',
      'Sunday': 'Domingo',
      'Monday': 'Lunes',
      'Tuesday': 'Martes',
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
      'guest': 'huésped',
      'guests': 'huéspedes',
      'visitor': 'visitante',
      'visitors': 'visitantes',
      'hour': 'hora',
      'minute': 'minuto',
    },
  };

  // ✅ COMPLETE: Main translations with ALL necessary keys
  static translations = {
    en: {
      // ✅ ENHANCED: Authentication section
      auth: {
        welcome: 'Welcome',
        loginSubtitle: 'Sign in to book amenities and manage your reservations',
        usernamePlaceholder: 'Your apartment (e.g., apartment101)',
        passwordPlaceholder: 'Your password',
        signIn: 'Sign In',
        loginFailed: 'Login Failed',
        invalidCredentials: 'Invalid username or password. Please check your credentials and try again.',
        needHelp: 'Need help? Contact your administrator',
        logout: 'Logout',
        profile: 'Profile'
      },

      // ✅ ENHANCED: Common UI elements
      common: {
        ok: 'OK',
        cancel: 'Cancel',
        yes: 'Yes',
        no: 'No',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        submit: 'Submit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        finish: 'Finish',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        tryAgain: 'Try Again',
        refresh: 'Refresh',
        all: 'All',
        none: 'None',
        unknown: 'Unknown',
        continue: 'Continue',
        viewAll: 'View All'
      },

      // ✅ ENHANCED: Error messages
      errors: {
        networkError: 'Network connection failed. Please check your internet connection.',
        serverError: 'A server error occurred. Please try again later.',
        authError: 'Authentication failed. Please log in again.',
        validationError: 'Please check your input and try again.',
        permissionError: 'You do not have permission to perform this action.',
        notFoundError: 'The requested resource was not found.',
        conflictError: 'There is a conflict with your request. Please try again.',
        rateLimitError: 'Too many requests. Please wait a moment and try again.',
        maintenanceError: 'System is under maintenance. Please try again later.',
        unknownError: 'An unexpected error occurred. Please try again.',
      },

      // Basic UI Elements
      home: 'Home',
      dashboard: 'Dashboard',
      reservations: 'My Bookings',
      myBookings: 'My Bookings',
      amenities: 'Book Amenities',
      admin: 'Admin',
      profile: 'Profile',
      login: 'Login',
      logout: 'Logout',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      ok: 'OK',
      yes: 'Yes',
      no: 'No',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      submit: 'Submit',
      close: 'Close',
      all: 'All',
      none: 'None',
      unknown: 'Unknown',
      
      // Navigation
      back: 'Back',
      continue: 'Continue',
      next: 'Next',
      finish: 'Finish',
      viewAll: 'View All',
      
      // Greetings
      goodMorning: 'Good Morning',
      goodAfternoon: 'Good Afternoon',
      goodEvening: 'Good Evening',
      welcome: 'Welcome',
      readyToBook: 'Ready to book your next amenity?',
      
      // Dashboard
      quickActions: 'Quick Actions',
      quickBook: 'Quick Book',
      recentActivity: 'Recent Activity',
      upcomingReservations: 'Upcoming Reservations',
      todaysReservations: 'Today\'s Reservations',
      noUpcomingReservations: 'No upcoming reservations',
      bookAmenityToSee: 'Book an amenity to see your reservations here',
      pendingReservations: 'Pending Reservations',
      totalUsers: 'Total Users',
      totalReservations: 'Total Reservations',
      
      // Amenities
      amenity: 'Amenity',
      amenityName: 'Amenity Name',
      amenityType: 'Amenity Type',
      amenityDescription: 'Description',
      capacity: 'Capacity',
      operatingHours: 'Operating Hours',
      available: 'Available',
      unavailable: 'Unavailable',
      bookNow: 'Book Now',
      bookAmenity: 'Book Amenity',
      chooseAmenity: 'Choose an Amenity',
      selectAmenity: 'Select Amenity',
      
      // Booking Process
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      selectDateTime: 'Select Date & Time',
      startTime: 'Start Time',
      endTime: 'End Time',
      duration: 'Duration',
      additionalDetails: 'Additional Details',
      specialRequests: 'Special Requests',
      notes: 'Notes',
      confirmReservation: 'Confirm Reservation',
      confirmBooking: 'Confirm Booking',
      bookingSubmitted: 'Booking Submitted',
      bookingConfirmed: 'Booking Confirmed',
      reviewBooking: 'Review Booking',
      bookingSummary: 'Booking Summary',
      
      // Date and Time
      date: 'Date',
      time: 'Time',
      today: 'Today',
      tomorrow: 'Tomorrow',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      nextWeek: 'Next Week',
      
      // Reservation Status
      pending: 'Pending',
      approved: 'Approved',
      confirmed: 'Confirmed',
      denied: 'Denied',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
      completed: 'Completed',
      waitingForApproval: 'Waiting for Approval',
      notApproved: 'Not Approved',
      
      // Actions
      approve: 'Approve',
      reject: 'Reject',
      deny: 'Deny',
      refresh: 'Refresh',
      filter: 'Filter',
      search: 'Search',
      sort: 'Sort',
      
      // Community Lounge Specific
      communityLounge: 'Community Lounge',
      lounge: 'Lounge',
      numberOfVisitors: 'Number of Visitors',
      numberOfGuests: 'Number of Guests',
      howManyPeople: 'How many people will attend?',
      
      // Consecutive booking error details
      consecutiveWeekendError: 'Cannot book consecutive weekend days',
      consecutiveBookingDetails: {
        fridayToSaturday: 'You cannot book Friday and Saturday consecutively. Please choose separate weekends.',
        saturdayToSunday: 'You cannot book Saturday and Sunday consecutively. Please choose separate weekends.',
        fridayToSunday: 'You cannot book Friday through Sunday consecutively. Please choose separate weekends.'
      },
      
      // Admin Interface
      adminInterface: {
        userManagement: 'User Management',
        reservationManagement: 'Reservation Management',
        amenityManagement: 'Amenity Management',
        systemSettings: 'System Settings',
        reports: 'Reports',
        analytics: 'Analytics'
      }
    },
    
    es: {
      // ✅ ENHANCED: Sección de autenticación
      auth: {
        welcome: 'Bienvenido',
        loginSubtitle: 'Inicia sesión para reservar amenidades y gestionar tus reservas',
        usernamePlaceholder: 'Tu apartamento (ej: apartment101)',
        passwordPlaceholder: 'Tu contraseña',
        signIn: 'Iniciar Sesión',
        loginFailed: 'Error de Inicio de Sesión',
        invalidCredentials: 'Usuario o contraseña inválidos. Por favor verifica tus credenciales e intenta nuevamente.',
        needHelp: '¿Necesitas ayuda? Contacta al administrador',
        logout: 'Cerrar Sesión',
        profile: 'Perfil'
      },

      // ✅ ENHANCED: Elementos comunes de la UI
      common: {
        ok: 'Aceptar',
        cancel: 'Cancelar',
        yes: 'Sí',
        no: 'No',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        create: 'Crear',
        update: 'Actualizar',
        submit: 'Enviar',
        close: 'Cerrar',
        back: 'Atrás',
        next: 'Siguiente',
        finish: 'Finalizar',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia',
        info: 'Información',
        tryAgain: 'Intentar Nuevamente',
        refresh: 'Actualizar',
        all: 'Todos',
        none: 'Ninguno',
        unknown: 'Desconocido',
        continue: 'Continuar',
        viewAll: 'Ver Todos'
      },

      // ✅ ENHANCED: Mensajes de error
      errors: {
        networkError: 'Falló la conexión de red. Por favor verifica tu conexión a internet.',
        serverError: 'Ocurrió un error del servidor. Por favor intenta más tarde.',
        authError: 'Falló la autenticación. Por favor inicia sesión nuevamente.',
        validationError: 'Por favor verifica tu entrada e intenta nuevamente.',
        permissionError: 'No tienes permisos para realizar esta acción.',
        notFoundError: 'No se encontró el recurso solicitado.',
        conflictError: 'Hay un conflicto con tu solicitud. Por favor intenta nuevamente.',
        rateLimitError: 'Demasiadas solicitudes. Por favor espera un momento e intenta nuevamente.',
        maintenanceError: 'El sistema está en mantenimiento. Por favor intenta más tarde.',
        unknownError: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
      },

      // Elementos Básicos de UI
      home: 'Inicio',
      dashboard: 'Panel Principal',
      reservations: 'Mis Reservas',
      myBookings: 'Mis Reservas',
      amenities: 'Reservar Amenidades',
      admin: 'Administración',
      profile: 'Perfil',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      ok: 'Aceptar',
      yes: 'Sí',
      no: 'No',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      update: 'Actualizar',
      submit: 'Enviar',
      close: 'Cerrar',
      all: 'Todos',
      none: 'Ninguno',
      unknown: 'Desconocido',
      
      // Navegación
      back: 'Atrás',
      continue: 'Continuar',
      next: 'Siguiente',
      finish: 'Finalizar',
      viewAll: 'Ver Todos',
      
      // Saludos
      goodMorning: 'Buenos Días',
      goodAfternoon: 'Buenas Tardes',
      goodEvening: 'Buenas Noches',
      welcome: 'Bienvenido',
      readyToBook: '¿Listo para reservar tu próxima amenidad?',
      
      // Dashboard
      quickActions: 'Acciones Rápidas',
      quickBook: 'Reserva Rápida',
      recentActivity: 'Actividad Reciente',
      upcomingReservations: 'Próximas Reservas',
      todaysReservations: 'Reservas de Hoy',
      noUpcomingReservations: 'No hay próximas reservas',
      bookAmenityToSee: 'Reserva una amenidad para ver tus reservas aquí',
      pendingReservations: 'Reservas Pendientes',
      totalUsers: 'Total de Usuarios',
      totalReservations: 'Total de Reservas',
      
      // Amenidades
      amenity: 'Amenidad',
      amenityName: 'Nombre de la Amenidad',
      amenityType: 'Tipo de Amenidad',
      amenityDescription: 'Descripción',
      capacity: 'Capacidad',
      operatingHours: 'Horarios de Operación',
      available: 'Disponible',
      unavailable: 'No Disponible',
      bookNow: 'Reservar Ahora',
      bookAmenity: 'Reservar Amenidad',
      chooseAmenity: 'Elegir una Amenidad',
      selectAmenity: 'Seleccionar Amenidad',
      
      // Proceso de Reserva
      selectDate: 'Seleccionar Fecha',
      selectTime: 'Seleccionar Hora',
      selectDateTime: 'Seleccionar Fecha y Hora',
      startTime: 'Hora de Inicio',
      endTime: 'Hora de Fin',
      duration: 'Duración',
      additionalDetails: 'Detalles Adicionales',
      specialRequests: 'Solicitudes Especiales',
      notes: 'Notas',
      confirmReservation: 'Confirmar Reserva',
      confirmBooking: 'Confirmar Reserva',
      bookingSubmitted: 'Reserva Enviada',
      bookingConfirmed: 'Reserva Confirmada',
      reviewBooking: 'Revisar Reserva',
      bookingSummary: 'Resumen de Reserva',
      
      // Fecha y Hora
      date: 'Fecha',
      time: 'Hora',
      today: 'Hoy',
      tomorrow: 'Mañana',
      yesterday: 'Ayer',
      thisWeek: 'Esta Semana',
      nextWeek: 'Próxima Semana',
      
      // Estado de Reserva
      pending: 'Pendiente',
      approved: 'Aprobada',
      confirmed: 'Confirmada',
      denied: 'Denegada',
      rejected: 'Rechazada',
      cancelled: 'Cancelada',
      completed: 'Completada',
      waitingForApproval: 'Esperando Aprobación',
      notApproved: 'No Aprobada',
      
      // Acciones
      approve: 'Aprobar',
      reject: 'Rechazar',
      deny: 'Denegar',
      refresh: 'Actualizar',
      filter: 'Filtrar',
      search: 'Buscar',
      sort: 'Ordenar',
      
      // Específico del Salón Comunitario
      communityLounge: 'Salón Comunitario',
      lounge: 'Salón',
      numberOfVisitors: 'Número de Visitantes',
      numberOfGuests: 'Número de Huéspedes',
      howManyPeople: '¿Cuántas personas asistirán?',
      
      // Detalles de error de reservas consecutivas
      consecutiveWeekendError: 'No se pueden reservar días consecutivos de fin de semana',
      consecutiveBookingDetails: {
        fridayToSaturday: 'No puedes reservar viernes y sábado consecutivamente. Por favor elige fines de semana separados.',
        saturdayToSunday: 'No puedes reservar sábado y domingo consecutivamente. Por favor elige fines de semana separados.',
        fridayToSunday: 'No puedes reservar de viernes a domingo consecutivamente. Por favor elige fines de semana separados.'
      },
      
      // Interfaz de Administración
      adminInterface: {
        userManagement: 'Gestión de Usuarios',
        reservationManagement: 'Gestión de Reservas',
        amenityManagement: 'Gestión de Amenidades',
        systemSettings: 'Configuración del Sistema',
        reports: 'Reportes',
        analytics: 'Análisis'
      }
    }
  };

  // ✅ Error messages (preserved)
  static errorMessages = {
    en: {
      networkError: 'Network connection failed. Please check your internet connection.',
      serverError: 'A server error occurred. Please try again later.',
      authError: 'Authentication failed. Please log in again.',
      validationError: 'Please check your input and try again.',
      permissionError: 'You do not have permission to perform this action.',
      notFoundError: 'The requested resource was not found.',
      conflictError: 'There is a conflict with your request. Please try again.',
      rateLimitError: 'Too many requests. Please wait a moment and try again.',
      maintenanceError: 'System is under maintenance. Please try again later.',
      unknownError: 'An unexpected error occurred. Please try again.',
    },
    es: {
      networkError: 'Falló la conexión de red. Por favor verifica tu conexión a internet.',
      serverError: 'Ocurrió un error del servidor. Por favor intenta más tarde.',
      authError: 'Falló la autenticación. Por favor inicia sesión nuevamente.',
      validationError: 'Por favor verifica tu entrada e intenta nuevamente.',
      permissionError: 'No tienes permisos para realizar esta acción.',
      notFoundError: 'No se encontró el recurso solicitado.',
      conflictError: 'Hay un conflicto con tu solicitud. Por favor intenta nuevamente.',
      rateLimitError: 'Demasiadas solicitudes. Por favor espera un momento e intenta nuevamente.',
      maintenanceError: 'El sistema está en mantenimiento. Por favor intenta más tarde.',
      unknownError: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
    },
  };

  // ✅ Get available languages
  static getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' }
    ];
  }

  // ✅ Set language
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

  // ✅ Get current language
  static async getCurrentLanguage() {
    try {
      const storedLanguage = await AsyncStorage.getItem(this.LANGUAGE_KEY);
      if (storedLanguage && ['en', 'es'].includes(storedLanguage)) {
        this.currentLanguage = storedLanguage;
        return storedLanguage;
      }
      return this.currentLanguage;
    } catch (error) {
      console.error('Error getting current language:', error);
      return this.currentLanguage;
    }
  }

  // ✅ Enhanced getTranslation method with nested key support
  static getTranslation(key, language = 'en') {
    const targetLang = this.translations[language] || this.translations.en;
    
    // Support nested keys (e.g., 'auth.loginFailed')
    const keys = key.split('.');
    let value = targetLang;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    // Fallback to English if translation not found
    if (value === undefined && language !== 'en') {
      return this.getTranslation(key, 'en');
    }
    
    return value || key;
  }

  // ✅ Translate data stored in English to user's language
  static translateData(category, englishValue, language = null) {
    const lang = language || this.currentLanguage;
    
    // If language is English or translation category doesn't exist, return original
    if (lang === 'en' || !this.dataTranslations[category]) {
      return englishValue;
    }

    // Return translated value or original if translation doesn't exist
    return this.dataTranslations[category][englishValue] || englishValue;
  }

  // ✅ Translate server validation errors
  static translateValidationError(englishError, language = null) {
    return this.translateData('validationErrors', englishError, language);
  }

  // ✅ Translate amenity name
  static translateAmenity(englishName, language = null) {
    return this.translateData('amenities', englishName, language);
  }

  // ✅ Translate status
  static translateStatus(englishStatus, language = null) {
    return this.translateData('status', englishStatus, language);
  }

  // ✅ Translate common terms
  static translateCommon(englishTerm, language = null) {
    return this.translateData('common', englishTerm, language);
  }

  // ✅ Smart text translation
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

  // ✅ Static t method for convenience
  static t(key, language = 'en') {
    return this.getTranslation(key, language);
  }

  // ✅ Get error message
  static getErrorMessage(key, language = 'en') {
    return this.errorMessages[language]?.[key] || this.errorMessages.en[key] || key;
  }

  // ✅ Helper method for pluralization
  static pluralize(count, singular, plural, language = 'en') {
    if (language === 'es') {
      return count === 1 ? singular : (plural || singular + 's');
    }
    return count === 1 ? singular : (plural || singular + 's');
  }

  // ✅ Helper method for time duration formatting
  static formatDuration(minutes, language = 'en') {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes}m`;
    } else if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  // ✅ Helper method to get nested translations
  static getNestedTranslation(keyPath, language = 'en') {
    return this.getTranslation(keyPath, language);
  }

  // ✅ Helper method to get pluralized translation
  static getPluralTranslation(key, count, language = 'en') {
    const singular = this.getTranslation(key, language);
    const plural = this.getTranslation(`${key}s`, language) || `${singular}s`;
    
    return count === 1 ? singular : plural;
  }

  // ✅ Helper method for consecutive booking error messages
  static getConsecutiveBookingError(conflictType, language = 'en') {
    const baseKey = 'consecutiveBookingDetails';
    
    switch (conflictType) {
      case 'Friday-Saturday':
        return this.getNestedTranslation(`${baseKey}.fridayToSaturday`, language);
      case 'Saturday-Sunday':
        return this.getNestedTranslation(`${baseKey}.saturdayToSunday`, language);
      case 'Friday-Sunday':
        return this.getNestedTranslation(`${baseKey}.fridayToSunday`, language);
      default:
        return this.getTranslation('consecutiveWeekendError', language);
    }
  }

  // ✅ Helper method for admin interface translations
  static getAdminTranslation(key, language = 'en') {
    return this.getNestedTranslation(`adminInterface.${key}`, language);
  }
}

// ✅ Export for hook usage
export const useLocalization = (language = 'en') => {
  const t = (key) => Localization.getTranslation(key, language);
  const tError = (key) => Localization.getErrorMessage(key, language);
  const tData = (category, value) => Localization.translateData(category, value, language);
  const tSmart = (text) => Localization.smartTranslate(text, language);
  
  return { t, tError, tData, tSmart };
};

// ✅ Helper function to get translation (standalone)
export const getTranslation = (key, language = 'en', fallback = key) => {
  const translations = Localization.translations[language] || Localization.translations.en;
  
  // Support nested keys (e.g., 'consecutiveBookingDetails.fridayToSaturday')
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  return value || fallback;
};

export default Localization;