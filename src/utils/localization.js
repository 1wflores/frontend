import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 ENHANCED: Complete Localization system for Spanish/English with comprehensive translations
export class Localization {
  static LANGUAGE_KEY = 'app_language';
  static currentLanguage = 'en'; // Default to English

  // 🔥 ENHANCED: Data translation mappings (English to Spanish)
  static dataTranslations = {
    // Amenity names (stored in English, displayed in Spanish)
    amenities: {
      'Jacuzzi': 'Jacuzzi',
      'Cold Tub': 'Tina Fría',
      'Yoga Deck': 'Terraza de Yoga',
      'Community Lounge': 'Salón Comunitario',
      'Rooftop Terrace': 'Terraza en Azotea',
      'Gym': 'Gimnasio',
      'Pool': 'Piscina',
      'BBQ Area': 'Área de Barbacoa',
      'Conference Room': 'Sala de Conferencias',
      'Game Room': 'Sala de Juegos',
    },
    
    // Amenity types
    amenityTypes: {
      'jacuzzi': 'jacuzzi',
      'cold-tub': 'tina-fría',
      'yoga-deck': 'terraza-yoga',
      'lounge': 'salón',
      'terrace': 'terraza',
      'gym': 'gimnasio',
      'pool': 'piscina',
      'bbq': 'barbacoa',
      'conference': 'conferencia',
      'game-room': 'sala-juegos',
    },

    // Status messages
    status: {
      'pending': 'Pendiente',
      'approved': 'Aprobado',
      'denied': 'Denegado',
      'cancelled': 'Cancelado',
      'completed': 'Completado',
    },

    // Days of week
    days: {
      'Sunday': 'Domingo',
      'Monday': 'Lunes',
      'Tuesday': 'Martes',
      'Wednesday': 'Miércoles', 
      'Thursday': 'Jueves',
      'Friday': 'Viernes',
      'Saturday': 'Sábado',
      'Sun': 'Dom',
      'Mon': 'Lun',
      'Tue': 'Mar',
      'Wed': 'Mié',
      'Thu': 'Jue',
      'Fri': 'Vie',
      'Sat': 'Sáb',
    },

    // Months
    months: {
      'January': 'Enero',
      'February': 'Febrero', 
      'March': 'Marzo',
      'April': 'Abril',
      'May': 'Mayo',
      'June': 'Junio',
      'July': 'Julio',
      'August': 'Agosto',
      'September': 'Septiembre',
      'October': 'Octubre',
      'November': 'Noviembre',
      'December': 'Diciembre',
    },

    // Common terms
    common: {
      'Auto-approved': 'Auto-aprobado',
      'Needs approval': 'Necesita aprobación',
      'Grill usage requested': 'Uso de parrilla solicitado',
      'visitors': 'visitantes',
      'minutes': 'minutos',
      'hours': 'horas',
      'deposit required': 'depósito requerido',
      'people': 'personas',
      'person': 'persona',
      'guests': 'huéspedes',
      'guest': 'huésped',
    },

    // 🔥 NEW: Server validation error translations
    validationErrors: {
      'Name is required': 'El nombre es requerido',
      'Capacity must be between 1 and 100': 'La capacidad debe estar entre 1 y 100',
      'Start time must be in the future': 'La hora de inicio debe ser en el futuro',
      'End time must be after start time': 'La hora de fin debe ser después del inicio',
      'Reservation cannot exceed 8 hours': 'La reserva no puede exceder 8 horas',
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

  // 🔥 ENHANCED: Complete UI Translation strings
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
      
      // Booking Process
      selectDate: 'Select Date',
      selectTime: 'Select Time',
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
      numberOfVisitors: 'Number of Visitors',
      numberOfGuests: 'Number of Guests',
      howManyPeople: 'How many people will be attending?',
      includeYourself: 'Include yourself in the count',
      willYouUseGrill: 'Will you use the grill?',
      grillUsage: 'Grill Usage',
      additionalDeposit: 'Additional deposit may be required',
      specialRequests: 'Special Requests or Notes',
      optionalNotes: 'Any special requests? (Optional)',
      reservationSummary: 'Reservation Summary',
      
      // Status & Actions
      confirmed: 'Confirmed',
      waitingForApproval: 'Waiting for Approval',
      notApproved: 'Not Approved',
      cancelled: 'Cancelled',
      completed: 'Completed',
      autoApproved: 'Auto Approved',
      needsApproval: 'Needs Approval',
      approve: 'Approve',
      deny: 'Deny',
      cancel: 'Cancel',
      edit: 'Edit',
      view: 'View',
      viewDetails: 'View Details',
      
      // Common Actions & States
      save: 'Save',
      ok: 'OK',
      yes: 'Yes',
      no: 'No',
      delete: 'Delete',
      next: 'Next',
      submit: 'Submit',
      confirm: 'Confirm',
      activate: 'Activate',
      deactivate: 'Deactivate',
      loading: 'Loading',
      error: 'Error',
      success: 'Success',
      active: 'Active',
      inactive: 'Inactive',
      required: 'Required',
      fieldRequired: 'This field is required',
      invalidRequest: 'Invalid Request',
      
      // Profile Screen
      memberSince: 'Member Since',
      lastLogin: 'Last Login',
      languageSettings: 'Language Settings',
      appLanguage: 'App Language',
      switchLanguages: 'Switch between Spanish and English',
      quickActions: 'Quick Actions',
      myReservations: 'My Reservations',
      viewManageBookings: 'View and manage your bookings',
      contactSupport: 'Contact Support',
      technicalSupport: 'For technical support or password changes, please contact your building administrator',
      signOut: 'Sign Out',
      confirmSignOut: 'Are you sure you want to sign out?',
      
      // Admin Screens
      userManagement: 'User Management',
      reservationManagement: 'Reservation Management',
      amenityManagement: 'Amenity Management',
      createUser: 'Create User',
      bulkCreate: 'Bulk Create',
      totalUsers: 'Total Users',
      activeUsers: 'Active',
      administrators: 'Admins',
      residents: 'Residents',
      administrator: 'Administrator',
      resident: 'Resident',
      
      // Error Messages
      noReservationFound: 'No reservation found',
      noUsersFound: 'No users found',
      noAmenitiesFound: 'No amenities found',
      networkError: 'Network error. Please check your connection.',
      unexpectedError: 'An unexpected error occurred',
      
      // Misc
      specialNotes: 'Special Notes',
      operatingHours: 'Operating Hours',
      capacity: 'Capacity',
      maintenanceMode: 'Under Maintenance',
      unavailable: 'Unavailable',
      version: 'Version',
      buildInfo: 'Build Information',
    },
    es: {
      // Navigation & General
      dashboard: 'Panel',
      reservations: 'Mis Reservas',
      amenities: 'Reservar Amenidades',
      profile: 'Perfil',
      admin: 'Administrador',
      home: 'Inicio',
      
      // Login Screen
      loginTitle: 'Reserva de Amenidades',
      loginSubtitle: 'Inicia sesión con tus credenciales de apartamento',
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
      readyToBook: '¿Listo para reservar tu próxima amenidad?',
      today: 'Hoy',
      pending: 'Pendientes',
      thisWeek: 'Esta Semana',
      available: 'Disponibles',
      todaysReservations: 'Reservas de Hoy',
      quickBook: 'Reserva Rápida',
      viewAll: 'Ver Todas',
      upcomingReservations: 'Próximas Reservas',
      recentActivity: 'Actividad Reciente',
      quickActions: 'Acciones Rápidas',
      bookAmenity: 'Reservar Amenidad',
      myBookings: 'Mis Reservas',
      noUpcomingReservations: 'No hay próximas reservas',
      bookAmenityToSee: 'Reserva una amenidad para ver tus reservas aquí',
      
      // Booking Process
      selectDate: 'Seleccionar Fecha',
      selectTime: 'Seleccionar Hora',
      additionalDetails: 'Detalles Adicionales',
      confirmReservation: 'Confirmar Reserva',
      chooseWhenToUse: 'Elige cuándo quieres usar',
      loungeWarning: 'El salón requiere reserva con 24 horas de anticipación',
      availableSlotsFor: 'Horarios disponibles para',
      selectedTime: 'Hora Seleccionada',
      changeTime: 'Cambiar Hora',
      back: 'Atrás',
      continue: 'Continuar',
      review: 'Revisar',
      confirmBooking: 'Confirmar Reserva',
      numberOfVisitors: 'Número de Visitantes',
      numberOfGuests: 'Número de Huéspedes',
      howManyPeople: '¿Cuántas personas asistirán?',
      includeYourself: 'Inclúyete en el conteo',
      willYouUseGrill: '¿Usarás la parrilla?',
      grillUsage: 'Uso de Parrilla',
      additionalDeposit: 'Puede requerirse depósito adicional',
      specialRequests: 'Solicitudes Especiales o Notas',
      optionalNotes: '¿Alguna solicitud especial? (Opcional)',
      reservationSummary: 'Resumen de Reserva',
      
      // Status & Actions
      confirmed: 'Confirmado',
      waitingForApproval: 'Esperando Aprobación',
      notApproved: 'No Aprobado',
      cancelled: 'Cancelado',
      completed: 'Completado',
      autoApproved: 'Auto Aprobado',
      needsApproval: 'Necesita Aprobación',
      approve: 'Aprobar',
      deny: 'Denegar',
      cancel: 'Cancelar',
      edit: 'Editar',
      view: 'Ver',
      viewDetails: 'Ver Detalles',
      
      // Common Actions & States
      save: 'Guardar',
      ok: 'OK',
      yes: 'Sí',
      no: 'No',
      delete: 'Eliminar',
      next: 'Siguiente',
      submit: 'Enviar',
      confirm: 'Confirmar',
      activate: 'Activar',
      deactivate: 'Desactivar',
      loading: 'Cargando',
      error: 'Error',
      success: 'Éxito',
      active: 'Activo',
      inactive: 'Inactivo',
      required: 'Requerido',
      fieldRequired: 'Este campo es requerido',
      invalidRequest: 'Solicitud Inválida',
      
      // Profile Screen
      memberSince: 'Miembro Desde',
      lastLogin: 'Último Acceso',
      languageSettings: 'Configuración de Idioma',
      appLanguage: 'Idioma de la Aplicación',
      switchLanguages: 'Cambiar entre Español e Inglés',
      quickActions: 'Acciones Rápidas',
      myReservations: 'Mis Reservas',
      viewManageBookings: 'Ver y gestionar tus reservas',
      contactSupport: 'Contactar Soporte',
      technicalSupport: 'Para soporte técnico o cambios de contraseña, contacta al administrador del edificio',
      signOut: 'Cerrar Sesión',
      confirmSignOut: '¿Está seguro de que desea cerrar sesión?',
      
      // Admin Screens
      userManagement: 'Gestión de Usuarios',
      reservationManagement: 'Gestión de Reservas',
      amenityManagement: 'Gestión de Amenidades',
      createUser: 'Crear Usuario',
      bulkCreate: 'Crear en Lote',
      totalUsers: 'Total Usuarios',
      activeUsers: 'Activos',
      administrators: 'Administradores',
      residents: 'Residentes',
      administrator: 'Administrador',
      resident: 'Residente',
      
      // Error Messages
      noReservationFound: 'No se encontró la reserva',
      noUsersFound: 'No se encontraron usuarios',
      noAmenitiesFound: 'No se encontraron amenidades',
      networkError: 'Error de red. Por favor verifica tu conexión.',
      unexpectedError: 'Ocurrió un error inesperado',
      
      // Misc
      specialNotes: 'Notas Especiales',
      operatingHours: 'Horarios de Operación',
      capacity: 'Capacidad',
      maintenanceMode: 'En Mantenimiento',
      unavailable: 'No Disponible',
      version: 'Versión',
      buildInfo: 'Información de Compilación',
    }
  };

  // Get current language
  static async getCurrentLanguage() {
    try {
      const language = await AsyncStorage.getItem(this.LANGUAGE_KEY);
      this.currentLanguage = language || 'en';
      return this.currentLanguage;
    } catch (error) {
      console.error('Error getting language:', error);
      return 'en';
    }
  }

  // Set language
  static async setLanguage(language) {
    try {
      await AsyncStorage.setItem(this.LANGUAGE_KEY, language);
      this.currentLanguage = language;
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }

  // Get UI translation
  static t(key, language = null) {
    const lang = language || this.currentLanguage;
    return this.translations[lang]?.[key] || this.translations.en[key] || key;
  }

  // 🔥 ENHANCED: Translate data stored in English to user's language
  static translateData(category, englishValue, language = null) {
    const lang = language || this.currentLanguage;
    
    // If language is English or translation category doesn't exist, return original
    if (lang === 'en' || !this.dataTranslations[category]) {
      return englishValue;
    }

    // Return translated value or original if translation doesn't exist
    return this.dataTranslations[category][englishValue] || englishValue;
  }

  // 🔥 NEW: Translate server validation errors
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

  // 🔥 ENHANCED: Smart text translation - handles mixed content including validation errors
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
}