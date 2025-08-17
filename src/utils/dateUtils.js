export class DateUtils {
  // 🔥 NEW: Costa Rica timezone offset (UTC-6)
  static COSTA_RICA_OFFSET = -6; // UTC-6 hours
  
  // 🔥 NEW: Convert UTC to Costa Rica time
  static toCostaRicaTime(date) {
    const utcDate = new Date(date);
    const costaRicaTime = new Date(utcDate.getTime() + (this.COSTA_RICA_OFFSET * 60 * 60 * 1000));
    return costaRicaTime;
  }

  // 🔥 NEW: Convert Costa Rica time to UTC
  static toUTC(date) {
    const localDate = new Date(date);
    const utcTime = new Date(localDate.getTime() - (this.COSTA_RICA_OFFSET * 60 * 60 * 1000));
    return utcTime;
  }

  static formatDate(date, locale = 'en-US') {
    const d = this.toCostaRicaTime(date);
    return d.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Costa_Rica',
    });
  }

  static formatTime(date, locale = 'en-US') {
    const d = this.toCostaRicaTime(date);
    return d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Costa_Rica',
    });
  }

  static formatDateTime(date, locale = 'en-US') {
    const d = this.toCostaRicaTime(date);
    return d.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Costa_Rica',
    });
  }

  static isToday(date) {
    const d = this.toCostaRicaTime(date);
    const today = this.toCostaRicaTime(new Date());
    return d.toDateString() === today.toDateString();
  }

  static isFuture(date) {
    const d = this.toCostaRicaTime(date);
    const now = this.toCostaRicaTime(new Date());
    return d > now;
  }

  static getDurationText(startTime, endTime, locale = 'en-US') {
    const start = this.toCostaRicaTime(startTime);
    const end = this.toCostaRicaTime(endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (locale === 'es-CR') {
      if (hours === 0) {
        return `${minutes} min`;
      } else if (minutes === 0) {
        return `${hours} h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    } else {
      if (hours === 0) {
        return `${minutes} min`;
      } else if (minutes === 0) {
        return `${hours} hr`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  }

  static getDateString(date) {
    const d = this.toCostaRicaTime(date);
    return d.toISOString().split('T')[0];
  }

  static addDays(date, days) {
    const result = this.toCostaRicaTime(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static getTimeFromDate(date) {
    const d = this.toCostaRicaTime(date);
    return d.toTimeString().slice(0, 5); // HH:MM format
  }

  static combineDateTime(date, time) {
    const costaRicaDateTime = `${date}T${time}:00.000`;
    // Convert back to UTC for API
    const localDate = new Date(costaRicaDateTime);
    return this.toUTC(localDate).toISOString();
  }

  // 🔥 NEW: Get current Costa Rica time
  static nowInCostaRica() {
    return this.toCostaRicaTime(new Date());
  }
}