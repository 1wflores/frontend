// src/utils/dateUtils.js - ENHANCED VERSION WITH FIXED FORMATTING

export class DateUtils {
  
  // ✅ FIXED: Enhanced formatDate with proper format parameter support
  static formatDate(dateInput, formatOrLanguage = 'en') {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    // Handle YYYY-MM-DD format specifically for API
    if (formatOrLanguage === 'YYYY-MM-DD') {
      return this.toISODateString(date);
    }
    
    // Handle DD/MM/YYYY format
    if (formatOrLanguage === 'DD/MM/YYYY') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    // Handle MM/DD/YYYY format
    if (formatOrLanguage === 'MM/DD/YYYY') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }
    
    // Default language-based formatting
    const language = formatOrLanguage;
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    try {
      if (language === 'es') {
        return date.toLocaleDateString('es-ES', options);
      } else {
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
        const timeStr = date.toLocaleTimeString('es-ES', timeOptions);
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
      const dayNames = {
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
      };
      return dayNames[language][date.getDay()];
    }
  }

  // Format contextual date (Today, Tomorrow, etc.)
  static formatContextualDate(dateInput, language = 'en') {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
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

  // ✅ FIXED: Get date for ISO string (YYYY-MM-DD)
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

  // ✅ ENHANCED: Better future date checking with timezone consideration
  static isFuture(dateInput) {
    if (!dateInput) return false;
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return false;
    
    const now = new Date();
    
    // Add small buffer for timezone differences and processing delays
    const buffer = 60000; // 1 minute buffer
    return date.getTime() > (now.getTime() - buffer);
  }

  // Check if date is in the past
  static isPast(dateInput) {
    return !this.isFuture(dateInput) && !this.isToday(dateInput);
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

  // ✅ ADDED: Missing compatibility methods
  
  // Get date string in YYYY-MM-DD format (alias for toISODateString)
  static getDateString(dateInput) {
    return this.toISODateString(dateInput);
  }

  // Get current date string in YYYY-MM-DD format
  static getCurrentDateString() {
    return this.getDateString(new Date());
  }

  // Get time string in HH:MM:SS format
  static getTimeString(dateInput) {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[1].split('.')[0]; // Returns HH:mm:ss format
  }

  // Create date from string components
  static createDateFromString(dateString, timeString = '00:00:00') {
    if (!dateString) return null;
    
    const combinedString = `${dateString}T${timeString}`;
    const date = new Date(combinedString);
    
    return isNaN(date.getTime()) ? null : date;
  }

  // Format date for HTML date inputs (YYYY-MM-DD)
  static formatDateForInput(dateInput) {
    return this.getDateString(dateInput);
  }

  // Format time for HTML time inputs (HH:MM)
  static formatTimeForInput(dateInput) {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  // ✅ FIXED: Utility method to handle different date format parameters
  static formatDateWithPattern(dateInput, pattern, language = 'en') {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    switch (pattern) {
      case 'YYYY-MM-DD':
        return this.toISODateString(date);
      case 'DD/MM/YYYY':
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        const dayUS = date.getDate().toString().padStart(2, '0');
        const monthUS = (date.getMonth() + 1).toString().padStart(2, '0');
        const yearUS = date.getFullYear();
        return `${monthUS}/${dayUS}/${yearUS}`;
      case 'relative':
        return this.formatRelativeTime(date, language);
      case 'contextual':
        return this.formatContextualDate(date, language);
      case 'short':
        return this.formatShortDate(date, language);
      case 'long':
      default:
        return this.formatDate(date, language);
    }
  }

  // ✅ ENHANCED: Better timezone handling
  static convertToUserTimezone(dateInput, userTimezone = null) {
    if (!dateInput) return null;
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    
    if (userTimezone) {
      try {
        return new Date(date.toLocaleString("en-US", { timeZone: userTimezone }));
      } catch (error) {
        console.warn('Invalid timezone provided, using local timezone:', error);
      }
    }
    
    return date;
  }

  // ✅ UTILITY: Get time difference in minutes
  static getTimeDifferenceInMinutes(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    return Math.floor((end - start) / (1000 * 60));
  }

  // ✅ UTILITY: Check if date is within a range
  static isDateInRange(dateToCheck, startDate, endDate) {
    if (!dateToCheck || !startDate || !endDate) return false;
    
    const check = new Date(dateToCheck);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(check.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) return false;
    
    return check >= start && check <= end;
  }

  // ✅ UTILITY: Get week start and end dates
  static getWeekRange(dateInput) {
    if (!dateInput) return null;
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday as start
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday as end
    endOfWeek.setHours(23, 59, 59, 999);
    
    return {
      start: startOfWeek,
      end: endOfWeek
    };
  }

  // ✅ UTILITY: Get month range
  static getMonthRange(dateInput) {
    if (!dateInput) return null;
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    return {
      start: startOfMonth,
      end: endOfMonth
    };
  }

  // ✅ DEBUG: Log date for debugging
  static debugDate(dateInput, label = 'Debug Date') {
    console.log(`${label}:`, {
      input: dateInput,
      parsed: new Date(dateInput),
      iso: this.formatForAPI(dateInput),
      local: this.formatDate(dateInput),
      isValid: !isNaN(new Date(dateInput).getTime())
    });
  }
}