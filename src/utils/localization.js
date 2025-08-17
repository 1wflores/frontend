import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 NEW: Localization system for Spanish/English with data translation
export class Localization {
  static LANGUAGE_KEY = 'app_language';
  static currentLanguage = 'en'; // Default to English

  // 🔥 NEW: Data translation mappings (English to Spanish)
  static dataTranslations = {
    // Amenity names (stored in English, displayed in Spanish)
    amenities: {
      'Jacuzzi': 'Jacuzzi',
      'Cold Tub': 'Tina Fría',
      'Yoga Deck': 'Terraza de Yoga',
      'Community Lounge': 'Salón Comunitario',
    },
    
    // Amenity types
    amenityTypes: {
      'jacuzzi': 'jacuzzi',
      'cold-tub': 'tina-fría',
      'yoga-deck': 'terraza-yoga',
      'lounge': 'salón',
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
    }
  };

  // 🔥 UI Translation strings (existing)
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
      
      // Dashboard
      goodMorning: 'Good morning',
      goodAfternoon: 'Good afternoon', 
      goodEvening: 'Good evening',
      readyToBook: 'Ready to book your next amenity?',
      today: 'Today',
      pending: 'Pending',
      thisWeek: 'This Week',
      available: 'Available',
      todaysReservations: "Today's Reservations",
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
      howManyPeople: 'How many people will attend?',
      grillUsage: 'Grill Usage',
      depositRequired: 'deposit required',
      specialNotes: 'Special Notes (Optional)',
      anySpecialRequests: 'Any special requests or notes',
      
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
      whatsNext: "What's Next?",
      pendingApproval: 'Pending Approval',
      reservationRequiresApproval: 'Your reservation requires admin approval. You\'ll receive a notification once it\'s reviewed.',
      usuallyTakes: 'This usually takes less than 24 hours. You can check the status in your reservations.',
      
      // Status Messages
      success: 'Success!',
      error: 'Error',
      loading: 'Loading...',
      invalidDate: 'Invalid Date',
      selectFutureDate: 'Please select a future date',
      invalidInput: 'Invalid Input',
      
      // Time & Dates
      minutes: 'minutes',
      hours: 'hours',
      autoApproved: 'Auto-approved',
      needsApproval: 'Needs approval',
      
      // Admin
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
      
      // Errors
      networkError: 'Network Error',
      checkInternet: 'Please check your internet connection and try again.',
      sessionExpired: 'Session Expired',
      loginAgain: 'Please log in again.',
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
      howManyPeople: '¿Cuántas personas asistirán?',
      grillUsage: 'Uso de Parrilla',
      depositRequired: 'depósito requerido',
      specialNotes: 'Notas Especiales (Opcional)',
      anySpecialRequests: 'Cualquier solicitud especial o notas',
      
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
      
      // Status Messages
      success: '¡Éxito!',
      error: 'Error',
      loading: 'Cargando...',
      invalidDate: 'Fecha Inválida',
      selectFutureDate: 'Por favor seleccione una fecha futura',
      invalidInput: 'Entrada Inválida',
      
      // Time & Dates
      minutes: 'minutos',
      hours: 'horas',
      autoApproved: 'Auto-aprobado',
      needsApproval: 'Necesita aprobación',
      
      // Admin
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
      
      // Errors
      networkError: 'Error de Red',
      checkInternet: 'Por favor verifique su conexión a internet e intente de nuevo.',
      sessionExpired: 'Sesión Expirada',
      loginAgain: 'Por favor inicie sesión de nuevo.',
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

  // 🔥 NEW: Translate data stored in English to user's language
  static translateData(category, englishValue, language = null) {
    const lang = language || this.currentLanguage;
    
    // If language is English or translation category doesn't exist, return original
    if (lang === 'en' || !this.dataTranslations[category]) {
      return englishValue;
    }

    // Return translated value or original if translation doesn't exist
    return this.dataTranslations[category][englishValue] || englishValue;
  }

  // 🔥 NEW: Translate amenity name
  static translateAmenity(englishName, language = null) {
    return this.translateData('amenities', englishName, language);
  }

  // 🔥 NEW: Translate status
  static translateStatus(englishStatus, language = null) {
    return this.translateData('status', englishStatus, language);
  }

  // 🔥 NEW: Translate common terms
  static translateCommon(englishTerm, language = null) {
    return this.translateData('common', englishTerm, language);
  }

  // 🔥 NEW: Smart text translation - handles mixed content
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