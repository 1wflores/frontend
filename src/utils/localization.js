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
      grillUsage: 'Grill Usage',
      depositRequired: 'deposit required',
      specialNotes: 'Special Notes (Optional)',
      specialRequests: 'Special Requests',
      anySpecialRequests: 'Any special requests or notes',
      bookingDetails: 'Booking Details',
      reservationSummary: 'Reservation Summary',
      
      // Confirmation Screen
      bookingConfirmed: 'Booking Confirmed!',
      bookingSubmitted: 'Booking Submitted!',
      reservationConfirmed: 'Your amenity reservation is confirmed and ready.',
      reservationSubmitted: 'Your reservation has been submitted for admin approval.',
      bookingId: 'Booking ID',
      reservationDetails: 'Reservation Details',
      apartment: 'Apartment',
      amenity: 'Amenity',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      visitors: 'Visitors',
      included: 'Included',
      specialNotes: 'Special Notes',
      whatsNext: 'What\'s Next?',
      pendingApproval: 'Pending Approval',
      reservationRequiresApproval: 'Your reservation requires admin approval. You\'ll receive a notification once it\'s reviewed.',
      usuallyTakes: 'This usually takes less than 24 hours. You can check the status in your reservations.',
      
      // Status Messages & Actions
      success: 'Success!',
      error: 'Error',
      loading: 'Loading...',
      invalidDate: 'Invalid Date',
      selectFutureDate: 'Please select a future date',
      invalidInput: 'Invalid Input',
      somethingWentWrong: 'Something went wrong',
      pleaseTryAgain: 'Please try again',
      noDataAvailable: 'No data available',
      
      // Time & Dates
      minutes: 'minutes',
      hours: 'hours',
      autoApproved: 'Auto-approved',
      needsApproval: 'Needs approval',
      underMaintenance: 'Under Maintenance',
      
      // Common Actions
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      refresh: 'Refresh',
      retry: 'Retry',
      viewDetails: 'View Details',
      bookNow: 'Book Now',
      selectSlot: 'Select Slot',
      
      // Admin General
      adminDashboard: 'Admin Dashboard',
      manageBuilding: 'Manage your building amenities',
      userManagement: 'User Management',
      reservationManagement: 'Reservation Management', 
      amenityManagement: 'Amenity Management',
      createUser: 'Create User',
      viewPending: 'View Pending',
      maintenance: 'Maintenance',
      totalUsers: 'Total Users',
      pendingApprovals: 'Pending Approvals',
      activeBookings: 'Active Bookings',
      availableAmenities: 'Available Amenities',
      adminRestrictions: 'Admin Account Restrictions',
      adminRestrictionsNote: 'As an administrator, you can only make maintenance reservations for amenities. Regular amenity bookings are restricted to ensure fair access for residents.',
      
      // Admin Forms
      amenityType: 'Amenity Type',
      amenityName: 'Amenity Name',
      description: 'Description',
      capacity: 'Capacity',
      operatingHours: 'Operating Hours',
      autoApprovalRules: 'Auto Approval Rules',
      maxDuration: 'Max Duration',
      maxReservationsPerDay: 'Max Reservations Per Day',
      specialRequirements: 'Special Requirements',
      
      // Validation Messages
      validationError: 'Validation Error',
      validationFailed: 'Validation failed',
      pleaseFix: 'Please fix the errors in the form',
      fieldRequired: 'This field is required',
      invalidFormat: 'Invalid format',
      nameRequired: 'Name is required',
      capacityBetween: 'Capacity must be between 1 and 100',
      durationBetween: 'Duration must be between 15 and 480 minutes',
      operatingHoursRequired: 'Operating hours are required',
      atLeastOneDay: 'At least one operating day must be selected',
      
      // Errors
      networkError: 'Network Error',
      checkInternet: 'Please check your internet connection and try again.',
      sessionExpired: 'Session Expired',
      loginAgain: 'Please log in again.',
      reservationNotFound: 'Reservation Not Found',
      reservationNotFoundDesc: 'We couldn\'t find your reservation. Please check your bookings or try again.',
      invalidRequest: 'Invalid Request',
      noReservationId: 'No reservation ID was provided. Please try booking again.',
      
      // Reservation States
      waitingForApproval: 'Waiting for approval',
      confirmed: 'Confirmed',
      notApproved: 'Not approved',
      cancelled: 'Cancelled',
      completed: 'Completed',
      
      // Filter & Search
      upcoming: 'Upcoming',
      all: 'All',
      approved: 'Approved',
      denied: 'Denied',
      noUpcomingReservationsTitle: 'No Upcoming Reservations',
      noMatchingReservations: 'No Matching Reservations',
      noReservationsFound: 'No reservations found for',
      oldReservationsHidden: 'Old reservations are automatically hidden to keep your list organized.',
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
      viewAll: 'Ver Todo',
      upcomingReservations: 'Próximas Reservas',
      recentActivity: 'Actividad Reciente',
      quickActions: 'Acciones Rápidas',
      bookAmenity: 'Reservar Amenidad',
      myBookings: 'Mis Reservas',
      noUpcomingReservations: 'No hay próximas reservas',
      bookAmenityToSee: 'Reserve una amenidad para ver sus reservas aquí',
      
      // Booking Process
      selectDate: 'Seleccionar Fecha',
      selectTime: 'Seleccionar Hora',
      additionalDetails: 'Detalles Adicionales',
      confirmReservation: 'Confirmar Reserva',
      chooseWhenToUse: 'Elija cuándo le gustaría usar',
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
      grillUsage: 'Uso de Parrilla',
      depositRequired: 'depósito requerido',
      specialNotes: 'Notas Especiales (Opcional)',
      specialRequests: 'Solicitudes Especiales',
      anySpecialRequests: 'Cualquier solicitud especial o notas',
      bookingDetails: 'Detalles de la Reserva',
      reservationSummary: 'Resumen de la Reserva',
      
      // Confirmation Screen
      bookingConfirmed: '¡Reserva Confirmada!',
      bookingSubmitted: '¡Reserva Enviada!',
      reservationConfirmed: 'Su reserva de amenidad está confirmada y lista.',
      reservationSubmitted: 'Su reserva ha sido enviada para aprobación del administrador.',
      bookingId: 'ID de Reserva',
      reservationDetails: 'Detalles de la Reserva',
      apartment: 'Apartamento',
      amenity: 'Amenidad',
      date: 'Fecha',
      time: 'Hora',
      duration: 'Duración',
      visitors: 'Visitantes',
      included: 'Incluido',
      specialNotes: 'Notas Especiales',
      whatsNext: '¿Qué Sigue?',
      pendingApproval: 'Aprobación Pendiente',
      reservationRequiresApproval: 'Su reserva requiere aprobación del administrador. Recibirá una notificación una vez que sea revisada.',
      usuallyTakes: 'Esto usualmente toma menos de 24 horas. Puede verificar el estado en sus reservas.',
      
      // Status Messages & Actions
      success: '¡Éxito!',
      error: 'Error',
      loading: 'Cargando...',
      invalidDate: 'Fecha Inválida',
      selectFutureDate: 'Por favor seleccione una fecha futura',
      invalidInput: 'Entrada Inválida',
      somethingWentWrong: 'Algo salió mal',
      pleaseTryAgain: 'Por favor intente de nuevo',
      noDataAvailable: 'No hay datos disponibles',
      
      // Time & Dates
      minutes: 'minutos',
      hours: 'horas',
      autoApproved: 'Auto-aprobado',
      needsApproval: 'Necesita aprobación',
      underMaintenance: 'En Mantenimiento',
      
      // Common Actions
      ok: 'OK',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      update: 'Actualizar',
      refresh: 'Actualizar',
      retry: 'Reintentar',
      viewDetails: 'Ver Detalles',
      bookNow: 'Reservar Ahora',
      selectSlot: 'Seleccionar Horario',
      
      // Admin General
      adminDashboard: 'Panel de Administrador',
      manageBuilding: 'Administre las amenidades del edificio',
      userManagement: 'Gestión de Usuarios',
      reservationManagement: 'Gestión de Reservas',
      amenityManagement: 'Gestión de Amenidades',
      createUser: 'Crear Usuario',
      viewPending: 'Ver Pendientes',
      maintenance: 'Mantenimiento',
      totalUsers: 'Total de Usuarios',
      pendingApprovals: 'Aprobaciones Pendientes',
      activeBookings: 'Reservas Activas',
      availableAmenities: 'Amenidades Disponibles',
      adminRestrictions: 'Restricciones de Cuenta de Administrador',
      adminRestrictionsNote: 'Como administrador, solo puede hacer reservas de mantenimiento para amenidades. Las reservas regulares de amenidades están restringidas para garantizar acceso justo para los residentes.',
      
      // Admin Forms
      amenityType: 'Tipo de Amenidad',
      amenityName: 'Nombre de la Amenidad',
      description: 'Descripción',
      capacity: 'Capacidad',
      operatingHours: 'Horarios de Operación',
      autoApprovalRules: 'Reglas de Aprobación Automática',
      maxDuration: 'Duración Máxima',
      maxReservationsPerDay: 'Máximo de Reservas por Día',
      specialRequirements: 'Requisitos Especiales',
      
      // Validation Messages
      validationError: 'Error de Validación',
      validationFailed: 'Validación fallida',
      pleaseFix: 'Por favor corrija los errores en el formulario',
      fieldRequired: 'Este campo es requerido',
      invalidFormat: 'Formato inválido',
      nameRequired: 'El nombre es requerido',
      capacityBetween: 'La capacidad debe estar entre 1 y 100',
      durationBetween: 'La duración debe estar entre 15 y 480 minutos',
      operatingHoursRequired: 'Los horarios de operación son requeridos',
      atLeastOneDay: 'Al menos un día de operación debe ser seleccionado',
      
      // Errors
      networkError: 'Error de Red',
      checkInternet: 'Por favor verifique su conexión a internet e intente de nuevo.',
      sessionExpired: 'Sesión Expirada',
      loginAgain: 'Por favor inicie sesión de nuevo.',
      reservationNotFound: 'Reserva No Encontrada',
      reservationNotFoundDesc: 'No pudimos encontrar su reserva. Por favor verifique sus reservas o intente de nuevo.',
      invalidRequest: 'Solicitud Inválida',
      noReservationId: 'No se proporcionó ID de reserva. Por favor intente reservar de nuevo.',
      
      // Reservation States
      waitingForApproval: 'Esperando aprobación',
      confirmed: 'Confirmado',
      notApproved: 'No aprobado',
      cancelled: 'Cancelado',
      completed: 'Completado',
      
      // Filter & Search
      upcoming: 'Próximas',
      all: 'Todas',
      approved: 'Aprobadas',
      denied: 'Denegadas',
      noUpcomingReservationsTitle: 'Sin Próximas Reservas',
      noMatchingReservations: 'Sin Reservas Coincidentes',
      noReservationsFound: 'No se encontraron reservas para',
      oldReservationsHidden: 'Las reservas antiguas se ocultan automáticamente para mantener su lista organizada.',
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