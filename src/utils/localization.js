// src/utils/localization.js - ENHANCED VERSION preserving ALL existing functionality

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
      'Unauthorized': 'No autorizado',
      'Forbidden': 'Prohibido',
      'Internal server error': 'Error interno del servidor',
      // **NEW: Consecutive booking error messages**
      'Cannot book consecutive weekend days': 'No se pueden reservar días consecutivos de fin de semana',
      'You already have a reservation that conflicts with this request': 'Ya tienes una reserva que entra en conflicto con esta solicitud',
      'Consecutive weekend bookings are not allowed': 'No se permiten reservas consecutivas de fin de semana',
      'The selected time slot conflicts with an existing reservation': 'El horario seleccionado entra en conflicto con una reserva existente',
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
      // **NEW: Day names for consecutive booking messages**
      'Friday': 'Viernes',
      'Saturday': 'Sábado',
      'Sunday': 'Domingo',
      'Monday': 'Lunes',
      'Tuesday': 'Martes',
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
    },
  };

  // ✅ ENHANCED: Main translations with new consecutive booking and approval messages
  static translations = {
    en: {
      // Basic UI Elements
      home: 'Home',
      reservations: 'My Bookings',
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
      
      // Navigation
      back: 'Back',
      continue: 'Continue',
      next: 'Next',
      finish: 'Finish',
      
      // Dashboard
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      quickActions: 'Quick Actions',
      recentActivity: 'Recent Activity',
      upcomingReservations: 'Upcoming Reservations',
      todaysReservations: 'Today\'s Reservations',
      noUpcomingReservations: 'No upcoming reservations',
      bookAmenityToSee: 'Book an amenity to see your reservations here',
      
      // Amenities
      amenity: 'Amenity',
      amenities: 'Amenities',
      amenityName: 'Amenity Name',
      amenityType: 'Amenity Type',
      amenityDescription: 'Description',
      capacity: 'Capacity',
      operatingHours: 'Operating Hours',
      available: 'Available',
      unavailable: 'Unavailable',
      bookNow: 'Book Now',
      bookAmenity: 'Book Amenity',
      
      // Booking Process
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      selectDateTime: 'Select Date & Time',
      startTime: 'Start Time',
      endTime: 'End Time',
      duration: 'Duration',
      additionalDetails: 'Additional Details',
      confirmReservation: 'Confirm Reservation',
      confirmBooking: 'Confirm Booking',
      bookingSubmitted: 'Booking Submitted',
      bookingConfirmed: 'Booking Confirmed',
      
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
      
      // Actions
      approve: 'Approve',
      reject: 'Reject',
      deny: 'Deny',
      
      // Community Lounge Specific
      communityLounge: 'Community Lounge',
      lounge: 'Lounge',
      numberOfVisitors: 'Number of Visitors',
      numberOfGuests: 'Number of Guests',
      howManyPeople: 'How many people will be attending?',
      maximumPeople: 'Maximum',
      people: 'people',
      person: 'person',
      visitors: 'visitors',
      visitor: 'visitor',
      willUseGrill: 'Will Use Grill',
      grillUsage: 'Grill Usage',
      grillUsageNote: 'Additional fees apply for grill usage',
      additionalFeesApply: 'Additional fees apply',
      
      // **NEW: Consecutive Booking Messages**
      consecutiveBookingNotAllowed: 'Consecutive Bookings Not Allowed',
      consecutiveWeekendError: 'Consecutive weekend bookings are not allowed for the Community Lounge',
      weekendBookingRestriction: 'Weekend booking restrictions apply',
      fridaySaturdayConflict: 'You cannot book both Friday and Saturday',
      saturdaySundayConflict: 'You cannot book both Saturday and Sunday',
      fridaySundayConflict: 'You cannot book both Friday and Sunday',
      existingWeekendBooking: 'You already have a weekend booking on',
      chooseAlternativeDate: 'Please choose an alternative date',
      consecutiveBookingDetails: {
        fridayToSaturday: 'You cannot book Friday and Saturday consecutively',
        saturdayToSunday: 'You cannot book Saturday and Sunday consecutively',
        fridayToSunday: 'You cannot book Friday and Sunday (skipping Saturday)',
        weekendRestrictionExplanation: 'The Community Lounge does not allow consecutive weekend day bookings to ensure fair access for all residents',
        alternativeSuggestion: 'Please select a different date or consider booking during weekdays',
        existingBookingDetails: 'You already have a reservation on',
        conflictResolution: 'To book this date, please first cancel your existing weekend reservation'
      },
      
      // **NEW: Approval Messages**
      requiresAdminApproval: 'Requires Administrator Approval',
      alwaysRequiresApproval: 'Always requires approval',
      autoApprovalEnabled: 'Auto-approval enabled',
      adminApprovalRequired: 'Administrator approval required',
      loungeApprovalNotice: 'Community Lounge bookings always require administrator approval',
      pendingApproval: 'Pending administrator approval',
      approvedAutomatically: 'Approved automatically',
      
      // **NEW: Admin Management Messages**
      administrationPanel: 'Administration Panel',
      reservationManagement: 'Reservation Management',
      pendingRequests: 'Pending Requests',
      allReservations: 'All Reservations',
      todayReservations: 'Today\'s Reservations',
      loungeReservations: 'Lounge Reservations',
      firstSubmitted: 'First Submitted',
      submissionOrder: 'Submission Order',
      chronologicalOrder: 'Requests are shown in chronological order',
      multipleRequestsToday: 'Multiple requests today',
      firstOfDay: 'First of day',
      adminInterface: {
        pendingApprovals: 'Pending Approvals',
        requiresImmediateAttention: 'Requires Immediate Attention',
        chronologicalListing: 'Listed in chronological order (oldest first)',
        sameDayRequests: 'Same day requests',
        multipleRequestsNotice: 'Multiple requests submitted today',
        approvalWorkflow: 'Approval Workflow',
        batchActions: 'Batch Actions',
        filterByStatus: 'Filter by Status',
        filterByAmenity: 'Filter by Amenity',
        sortByDate: 'Sort by Date',
        requestDetails: 'Request Details',
        userInformation: 'User Information',
        bookingInformation: 'Booking Information',
        approvalHistory: 'Approval History',
        adminNotes: 'Admin Notes',
        decisionRequired: 'Decision Required',
        processRequest: 'Process Request'
      },
      
      // **NEW: Time and Date Restrictions**
      advanceBookingRequired: 'Advance Booking Required',
      twentyFourHourNotice: '24-hour advance booking required',
      insufficientAdvanceNotice: 'Insufficient advance notice',
      minimumAdvanceBooking: 'Minimum advance booking time not met',
      advanceBookingNotice: 'This amenity requires advance booking',
      
      // **NEW: Validation Messages**
      bookingNotAllowed: 'Booking Not Allowed',
      validationError: 'Validation Error',
      timeConflict: 'Time slot conflict',
      operatingHoursViolation: 'Outside operating hours',
      capacityExceeded: 'Capacity exceeded',
      invalidTimeRange: 'Invalid time range',
      pastDateSelected: 'Cannot book for past dates',
      
      // **NEW: Requirements and Rules**
      bookingRequirements: 'Booking Requirements',
      loungeRequirements: 'Community Lounge Requirements',
      bookingRules: 'Booking Rules',
      importantNotice: 'Important Notice',
      pleaseNote: 'Please note',
      restrictions: 'Restrictions',
      
      // Notes and Comments
      notes: 'Notes',
      specialRequests: 'Special Requests',
      additionalInformation: 'Additional Information',
      optional: 'Optional',
      
      // Form Validation
      required: 'Required',
      invalid: 'Invalid',
      tooLong: 'Too long',
      tooShort: 'Too short',
      mustBeNumber: 'Must be a number',
      mustBePositive: 'Must be positive',
      
      // Success Messages
      reservationCreated: 'Reservation created successfully',
      reservationUpdated: 'Reservation updated successfully',
      reservationCancelled: 'Reservation cancelled successfully',
      reservationApproved: 'Reservation approved successfully',
      reservationRejected: 'Reservation rejected successfully',
      
      // Error Messages
      reservationFailed: 'Failed to create reservation',
      updateFailed: 'Failed to update reservation',
      deleteFailed: 'Failed to delete reservation',
      loadingFailed: 'Failed to load data',
      networkError: 'Network error',
      serverError: 'Server error',
      unknownError: 'Unknown error occurred',
      
      // Confirmation Messages
      confirmApproval: 'Confirm Approval',
      confirmRejection: 'Confirm Rejection',
      confirmCancellation: 'Confirm Cancellation',
      confirmDeletion: 'Confirm Deletion',
      areYouSure: 'Are you sure?',
      cannotBeUndone: 'This action cannot be undone',
      
      // Time Formatting
      submitted: 'submitted',
      submittedOn: 'submitted on',
      submittedAgo: 'submitted ago',
      createdAt: 'created at',
      updatedAt: 'updated at',
      
      // Empty States
      noReservations: 'No reservations',
      noAmenities: 'No amenities available',
      noResults: 'No results found',
      emptyList: 'List is empty',
      noDataAvailable: 'No data available',
    },
    
    es: {
      // Basic UI Elements
      home: 'Inicio',
      reservations: 'Mis Reservas',
      amenities: 'Reservar Amenidades',
      admin: 'Administración',
      profile: 'Perfil',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      ok: 'OK',
      yes: 'Sí',
      no: 'No',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      update: 'Actualizar',
      submit: 'Enviar',
      close: 'Cerrar',
      
      // Navigation
      back: 'Atrás',
      continue: 'Continuar',
      next: 'Siguiente',
      finish: 'Finalizar',
      
      // Dashboard
      welcome: 'Bienvenido',
      dashboard: 'Panel Principal',
      quickActions: 'Acciones Rápidas',
      recentActivity: 'Actividad Reciente',
      upcomingReservations: 'Próximas Reservas',
      todaysReservations: 'Reservas de Hoy',
      noUpcomingReservations: 'No hay próximas reservas',
      bookAmenityToSee: 'Reserva una amenidad para ver tus reservas aquí',
      
      // Amenities
      amenity: 'Amenidad',
      amenities: 'Amenidades',
      amenityName: 'Nombre de la Amenidad',
      amenityType: 'Tipo de Amenidad',
      amenityDescription: 'Descripción',
      capacity: 'Capacidad',
      operatingHours: 'Horarios de Operación',
      available: 'Disponible',
      unavailable: 'No Disponible',
      bookNow: 'Reservar Ahora',
      bookAmenity: 'Reservar Amenidad',
      
      // Booking Process
      selectDate: 'Seleccionar Fecha',
      selectTime: 'Seleccionar Hora',
      selectDateTime: 'Seleccionar Fecha y Hora',
      startTime: 'Hora de Inicio',
      endTime: 'Hora de Fin',
      duration: 'Duración',
      additionalDetails: 'Detalles Adicionales',
      confirmReservation: 'Confirmar Reserva',
      confirmBooking: 'Confirmar Reserva',
      bookingSubmitted: 'Reserva Enviada',
      bookingConfirmed: 'Reserva Confirmada',
      
      // Date and Time
      date: 'Fecha',
      time: 'Hora',
      today: 'Hoy',
      tomorrow: 'Mañana',
      yesterday: 'Ayer',
      thisWeek: 'Esta Semana',
      nextWeek: 'Próxima Semana',
      
      // Reservation Status
      pending: 'Pendiente',
      approved: 'Aprobada',
      confirmed: 'Confirmada',
      denied: 'Denegada',
      rejected: 'Rechazada',
      cancelled: 'Cancelada',
      completed: 'Completada',
      
      // Actions
      approve: 'Aprobar',
      reject: 'Rechazar',
      deny: 'Denegar',
      
      // Community Lounge Specific
      communityLounge: 'Salón Comunitario',
      lounge: 'Salón',
      numberOfVisitors: 'Número de Visitantes',
      numberOfGuests: 'Número de Huéspedes',
      howManyPeople: '¿Cuántas personas asistirán?',
      maximumPeople: 'Máximo',
      people: 'personas',
      person: 'persona',
      visitors: 'visitantes',
      visitor: 'visitante',
      willUseGrill: 'Usará Parrilla',
      grillUsage: 'Uso de Parrilla',
      grillUsageNote: 'Se aplican tarifas adicionales por el uso de la parrilla',
      additionalFeesApply: 'Se aplican tarifas adicionales',
      
      // **NEW: Consecutive Booking Messages**
      consecutiveBookingNotAllowed: 'Reservas Consecutivas No Permitidas',
      consecutiveWeekendError: 'No se permiten reservas consecutivas de fin de semana para el Salón Comunitario',
      weekendBookingRestriction: 'Se aplican restricciones de reserva de fin de semana',
      fridaySaturdayConflict: 'No puedes reservar viernes y sábado',
      saturdaySundayConflict: 'No puedes reservar sábado y domingo',
      fridaySundayConflict: 'No puedes reservar viernes y domingo',
      existingWeekendBooking: 'Ya tienes una reserva de fin de semana el',
      chooseAlternativeDate: 'Por favor elige una fecha alternativa',
      consecutiveBookingDetails: {
        fridayToSaturday: 'No puedes reservar viernes y sábado consecutivamente',
        saturdayToSunday: 'No puedes reservar sábado y domingo consecutivamente',
        fridayToSunday: 'No puedes reservar viernes y domingo (saltando sábado)',
        weekendRestrictionExplanation: 'El Salón Comunitario no permite reservas consecutivas de días de fin de semana para asegurar acceso justo para todos los residentes',
        alternativeSuggestion: 'Por favor selecciona una fecha diferente o considera reservar durante días laborales',
        existingBookingDetails: 'Ya tienes una reserva el',
        conflictResolution: 'Para reservar esta fecha, por favor primero cancela tu reserva existente de fin de semana'
      },
      
      // **NEW: Approval Messages**
      requiresAdminApproval: 'Requiere Aprobación del Administrador',
      alwaysRequiresApproval: 'Siempre requiere aprobación',
      autoApprovalEnabled: 'Auto-aprobación habilitada',
      adminApprovalRequired: 'Se requiere aprobación del administrador',
      loungeApprovalNotice: 'Las reservas del Salón Comunitario siempre requieren aprobación del administrador',
      pendingApproval: 'Pendiente de aprobación del administrador',
      approvedAutomatically: 'Aprobado automáticamente',
      
      // **NEW: Admin Management Messages**
      administrationPanel: 'Panel de Administración',
      reservationManagement: 'Gestión de Reservas',
      pendingRequests: 'Solicitudes Pendientes',
      allReservations: 'Todas las Reservas',
      todayReservations: 'Reservas de Hoy',
      loungeReservations: 'Reservas del Salón',
      firstSubmitted: 'Primera Enviada',
      submissionOrder: 'Orden de Envío',
      chronologicalOrder: 'Las solicitudes se muestran en orden cronológico',
      multipleRequestsToday: 'Múltiples solicitudes hoy',
      firstOfDay: 'Primera del día',
      adminInterface: {
        pendingApprovals: 'Aprobaciones Pendientes',
        requiresImmediateAttention: 'Requiere Atención Inmediata',
        chronologicalListing: 'Listado en orden cronológico (más antiguo primero)',
        sameDayRequests: 'Solicitudes del mismo día',
        multipleRequestsNotice: 'Múltiples solicitudes enviadas hoy',
        approvalWorkflow: 'Flujo de Aprobación',
        batchActions: 'Acciones en Lote',
        filterByStatus: 'Filtrar por Estado',
        filterByAmenity: 'Filtrar por Amenidad',
        sortByDate: 'Ordenar por Fecha',
        requestDetails: 'Detalles de la Solicitud',
        userInformation: 'Información del Usuario',
        bookingInformation: 'Información de la Reserva',
        approvalHistory: 'Historial de Aprobaciones',
        adminNotes: 'Notas del Administrador',
        decisionRequired: 'Decisión Requerida',
        processRequest: 'Procesar Solicitud'
      },
      
      // **NEW: Time and Date Restrictions**
      advanceBookingRequired: 'Reserva Anticipada Requerida',
      twentyFourHourNotice: 'Se requiere reserva con 24 horas de anticipación',
      insufficientAdvanceNotice: 'Aviso anticipado insuficiente',
      minimumAdvanceBooking: 'Tiempo mínimo de reserva anticipada no cumplido',
      advanceBookingNotice: 'Esta amenidad requiere reserva anticipada',
      
      // **NEW: Validation Messages**
      bookingNotAllowed: 'Reserva No Permitida',
      validationError: 'Error de Validación',
      timeConflict: 'Conflicto de horario',
      operatingHoursViolation: 'Fuera del horario de operación',
      capacityExceeded: 'Capacidad excedida',
      invalidTimeRange: 'Rango de tiempo inválido',
      pastDateSelected: 'No se puede reservar para fechas pasadas',
      
      // **NEW: Requirements and Rules**
      bookingRequirements: 'Requisitos de Reserva',
      loungeRequirements: 'Requisitos del Salón Comunitario',
      bookingRules: 'Reglas de Reserva',
      importantNotice: 'Aviso Importante',
      pleaseNote: 'Por favor nota',
      restrictions: 'Restricciones',
      
      // Notes and Comments
      notes: 'Notas',
      specialRequests: 'Solicitudes Especiales',
      additionalInformation: 'Información Adicional',
      optional: 'Opcional',
      
      // Form Validation
      required: 'Requerido',
      invalid: 'Inválido',
      tooLong: 'Demasiado largo',
      tooShort: 'Demasiado corto',
      mustBeNumber: 'Debe ser un número',
      mustBePositive: 'Debe ser positivo',
      
      // Success Messages
      reservationCreated: 'Reserva creada exitosamente',
      reservationUpdated: 'Reserva actualizada exitosamente',
      reservationCancelled: 'Reserva cancelada exitosamente',
      reservationApproved: 'Reserva aprobada exitosamente',
      reservationRejected: 'Reserva rechazada exitosamente',
      
      // Error Messages
      reservationFailed: 'Error al crear la reserva',
      updateFailed: 'Error al actualizar la reserva',
      deleteFailed: 'Error al eliminar la reserva',
      loadingFailed: 'Error al cargar los datos',
      networkError: 'Error de red',
      serverError: 'Error del servidor',
      unknownError: 'Ocurrió un error desconocido',
      
      // Confirmation Messages
      confirmApproval: 'Confirmar Aprobación',
      confirmRejection: 'Confirmar Rechazo',
      confirmCancellation: 'Confirmar Cancelación',
      confirmDeletion: 'Confirmar Eliminación',
      areYouSure: '¿Estás seguro?',
      cannotBeUndone: 'Esta acción no se puede deshacer',
      
      // Time Formatting
      submitted: 'enviado',
      submittedOn: 'enviado el',
      submittedAgo: 'enviado hace',
      createdAt: 'creado el',
      updatedAt: 'actualizado el',
      
      // Empty States
      noReservations: 'No hay reservas',
      noAmenities: 'No hay amenidades disponibles',
      noResults: 'No se encontraron resultados',
      emptyList: 'La lista está vacía',
      noDataAvailable: 'No hay datos disponibles',
    }
  };

  // ✅ PRESERVED: Error messages (unchanged)
  static errorMessages = {
    en: {
      networkError: 'Network connection failed. Please check your internet connection.',
      serverError: 'Server error occurred. Please try again later.',
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

  // ✅ PRESERVED: Set language (unchanged)
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

  // ✅ PRESERVED: Get current language (unchanged)
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

  // ✅ PRESERVED: Get translation (unchanged)
  static getTranslation(key, language = 'en') {
    return this.translations[language]?.[key] || this.translations.en[key] || key;
  }

  // ✅ PRESERVED: Translate data stored in English to user's language (unchanged)
  static translateData(category, englishValue, language = null) {
    const lang = language || this.currentLanguage;
    
    // If language is English or translation category doesn't exist, return original
    if (lang === 'en' || !this.dataTranslations[category]) {
      return englishValue;
    }

    // Return translated value or original if translation doesn't exist
    return this.dataTranslations[category][englishValue] || englishValue;
  }

  // ✅ PRESERVED: Translate server validation errors (unchanged)
  static translateValidationError(englishError, language = null) {
    return this.translateData('validationErrors', englishError, language);
  }

  // ✅ PRESERVED: Translate amenity name (unchanged)
  static translateAmenity(englishName, language = null) {
    return this.translateData('amenities', englishName, language);
  }

  // ✅ PRESERVED: Translate status (unchanged)
  static translateStatus(englishStatus, language = null) {
    return this.translateData('status', englishStatus, language);
  }

  // ✅ PRESERVED: Translate common terms (unchanged)
  static translateCommon(englishTerm, language = null) {
    return this.translateData('common', englishTerm, language);
  }

  // ✅ PRESERVED: Smart text translation (unchanged)
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

  // ✅ PRESERVED: Get available languages (unchanged)
  static getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' }
    ];
  }

  // ✅ PRESERVED: Get error message (unchanged)
  static getErrorMessage(key, language = 'en') {
    return this.errorMessages[language]?.[key] || this.errorMessages.en[key] || key;
  }

  // ✅ PRESERVED: Helper method for pluralization (unchanged)
  static pluralize(count, singular, plural, language = 'en') {
    if (language === 'es') {
      return count === 1 ? singular : (plural || singular + 's');
    }
    return count === 1 ? singular : (plural || singular + 's');
  }

  // ✅ PRESERVED: Helper method for time duration formatting (unchanged)
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

  // ✅ NEW: Helper method to get nested translations (for admin interface messages)
  static getNestedTranslation(keyPath, language = 'en') {
    const keys = keyPath.split('.');
    let value = this.translations[language] || this.translations.en;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }
    
    return value || keyPath;
  }

  // ✅ NEW: Helper method to get pluralized translation
  static getPluralTranslation(key, count, language = 'en') {
    const singular = this.getTranslation(key, language);
    const plural = this.getTranslation(`${key}s`, language) || `${singular}s`;
    
    return count === 1 ? singular : plural;
  }

  // ✅ NEW: Helper method for consecutive booking error messages
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

  // ✅ NEW: Helper method for admin interface translations
  static getAdminTranslation(key, language = 'en') {
    return this.getNestedTranslation(`adminInterface.${key}`, language);
  }
}

// ✅ PRESERVED: Export for hook usage (unchanged)
export const useLocalization = (language = 'en') => {
  const t = (key) => Localization.getTranslation(key, language);
  const tError = (key) => Localization.getErrorMessage(key, language);
  const tData = (category, value) => Localization.translateData(category, value, language);
  const tSmart = (text) => Localization.smartTranslate(text, language);
  
  return { t, tError, tData, tSmart };
};

// ✅ NEW: Helper function to get translation (standalone)
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