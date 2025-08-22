// Enhanced DateUtils with proper Spanish/English translations
export class DateUtils {
  
  // Format date with language support
  static formatDate(dateInput, language = 'en') {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    try {
      if (language === 'es') {
        // Use Spanish locale
        return date.toLocaleDateString('es-ES', options);
      } else {
        // Use English locale
        return date.toLocaleDateString('en-US', options);
      }
    } catch (error) {
      console.warn('Error formatting date with locale, falling back to manual formatting:', error);
      return this.formatDateManually(date, language);
    }
  }

  // Manual date formatting as fallback
  static formatDateManually(date, language = 'en') {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthNames = {
      en: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      es: [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ]
    };
    
    const monthName = monthNames[language][month];
    
    if (language === 'es') {
      return `${day} de ${monthName} de ${year}`;
    } else {
      return `${monthName} ${day}, ${year}`;
    }
  }

  // Format short date (e.g., "Aug 22, 2025" or "22 ago 2025")
  static formatShortDate(dateInput, language = 'en') {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    try {
      if (language === 'es') {
        return date.toLocaleDateString('es-ES', options);
      } else {
        return date.toLocaleDateString('en-US', options);
      }
    } catch (error) {
      return this.formatShortDateManually(date, language);
    }
  }

  // Manual short date formatting
  static formatShortDateManually(date, language = 'en') {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const shortMonthNames = {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    };
    
    const monthName = shortMonthNames[language][month];
    
    if (language === 'es') {
      return `${day} ${monthName} ${year}`;
    } else {
      return `${monthName} ${day}, ${year}`;
    }
  }

  // Format time (e.g., "2:30 PM" or "14:30")
  static formatTime(dateInput, use24Hour = false, language = 'en') {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    if (use24Hour) {
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    
    try {
      const timeOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      
      if (language === 'es') {
        // Spanish time format
        const timeStr = date.toLocaleTimeString('es-ES', timeOptions);
        // Replace AM/PM with Spanish equivalents
        return timeStr.replace('AM', 'AM').replace('PM', 'PM');
      } else {
        return date.toLocaleTimeString('en-US', timeOptions);
      }
    } catch (error) {
      return this.formatTimeManually(date);
    }
  }

  // Manual time formatting
  static formatTimeManually(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutesStr} ${ampm}`;
  }

  // Format date and time together
  static formatDateTime(dateInput, language = 'en') {
    if (!dateInput) return '';
    
    const date = this.formatDate(dateInput, language);
    const time = this.formatTime(dateInput, false, language);
    
    if (language === 'es') {
      return `${date} a las ${time}`;
    } else {
      return `${date} at ${time}`;
    }
  }

  // Format relative time (e.g., "2 hours ago", "hace 2 horas")
  static formatRelativeTime(dateInput, language = 'en') {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (language === 'es') {
      if (diffSecs < 60) return 'hace unos segundos';
      if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
      if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
      if (diffDays < 7) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
      return this.formatShortDate(dateInput, language);
    } else {
      if (diffSecs < 60) return 'a few seconds ago';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      return this.formatShortDate(dateInput, language);
    }
  }

  // Format day of week
  static formatDayOfWeek(dateInput, language = 'en') {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const options = { weekday: 'long' };
    
    try {
      if (language === 'es') {
        return date.toLocaleDateString('es-ES', options);
      } else {
        return date.toLocaleDateString('en-US', options);
      }
    } catch (error) {
      return this.formatDayOfWeekManually(date, language);
    }
  }

  // Manual day of week formatting
  static formatDayOfWeekManually(date, language = 'en') {
    const dayNames = {
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    };
    
    return dayNames[language][date.getDay()];
  }

  // Format for calendar display
  static formatForCalendar(dateInput, language = 'en') {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today, tomorrow, or yesterday
    if (this.isSameDay(date, today)) {
      return language === 'es' ? 'Hoy' : 'Today';
    } else if (this.isSameDay(date, tomorrow)) {
      return language === 'es' ? 'Mañana' : 'Tomorrow';
    } else if (this.isSameDay(date, yesterday)) {
      return language === 'es' ? 'Ayer' : 'Yesterday';
    }
    
    // Check if it's this week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    if (date >= startOfWeek && date <= endOfWeek) {
      return this.formatDayOfWeek(date, language);
    }
    
    // Return formatted date
    return this.formatShortDate(date, language);
  }

  // Check if two dates are the same day
  static isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Format duration between two dates
  static formatDuration(startDate, endDate, language = 'en') {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
    
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      if (remainingMins > 0) {
        if (language === 'es') {
          return `${diffHours} hora${diffHours !== 1 ? 's' : ''} y ${remainingMins} minuto${remainingMins !== 1 ? 's' : ''}`;
        } else {
          return `${diffHours} hour${diffHours !== 1 ? 's' : ''} and ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
        }
      } else {
        if (language === 'es') {
          return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
        } else {
          return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
        }
      }
    } else {
      if (language === 'es') {
        return `${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
      } else {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
      }
    }
  }

  // Get date for ISO string (YYYY-MM-DD)
  static toISODateString(dateInput) {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  }

  // Parse date from various formats
  static parseDate(dateString) {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  // Format for API submission (ISO format)
  static formatForAPI(dateInput) {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString();
  }

  // Get start of day
  static getStartOfDay(dateInput) {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Get end of day
  static getEndOfDay(dateInput) {
    const date = new Date(dateInput);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  // Check if date is today
  static isToday(dateInput) {
    const date = new Date(dateInput);
    const today = new Date();
    return this.isSameDay(date, today);
  }

  // Check if date is in the future
  static isFuture(dateInput) {
    const date = new Date(dateInput);
    const now = new Date();
    return date > now;
  }

  // Check if date is in the past
  static isPast(dateInput) {
    const date = new Date(dateInput);
    const now = new Date();
    return date < now;
  }

  // Add days to a date
  static addDays(dateInput, days) {
    const date = new Date(dateInput);
    date.setDate(date.getDate() + days);
    return date;
  }

  // Add hours to a date
  static addHours(dateInput, hours) {
    const date = new Date(dateInput);
    date.setHours(date.getHours() + hours);
    return date;
  }

  // Get formatted time range
  static formatTimeRange(startDate, endDate, language = 'en') {
    const startTime = this.formatTime(startDate, false, language);
    const endTime = this.formatTime(endDate, false, language);
    
    if (language === 'es') {
      return `${startTime} - ${endTime}`;
    } else {
      return `${startTime} - ${endTime}`;
    }
  }

  // ADDED: Missing getDateString method for compatibility
  static getDateString(dateInput) {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  }

  // ADDED: Missing getCurrentDateString method for compatibility  
  static getCurrentDateString() {
    return this.getDateString(new Date());
  }

  // ADDED: Missing getTimeString method for compatibility
  static getTimeString(dateInput) {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[1].split('.')[0]; // Returns HH:mm:ss format
  }

  // ADDED: Missing createDateFromString method for compatibility
  static createDateFromString(dateString, timeString = '00:00:00') {
    if (!dateString) return null;
    
    const combinedString = `${dateString}T${timeString}`;
    const date = new Date(combinedString);
    
    return isNaN(date.getTime()) ? null : date;
  }

  // ADDED: Missing formatDateForInput method for compatibility (for HTML date inputs)
  static formatDateForInput(dateInput) {
    return this.getDateString(dateInput);
  }

  // ADDED: Missing formatTimeForInput method for compatibility (for HTML time inputs)
  static formatTimeForInput(dateInput) {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }
}