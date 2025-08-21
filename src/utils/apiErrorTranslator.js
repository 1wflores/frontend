// src/utils/apiErrorTranslator.js
import { Localization } from './localization';

/**
 * Utility class to translate API error messages from English to user's language
 */
export class ApiErrorTranslator {
  
  /**
   * Translate a single error message
   * @param {string} errorMessage - The error message in English
   * @param {string} language - Target language ('en' or 'es')
   * @returns {string} - Translated error message
   */
  static translateError(errorMessage, language = null) {
    if (!errorMessage) return errorMessage;
    
    // Try to translate using validation errors mapping first
    const translated = Localization.translateValidationError(errorMessage, language);
    
    // If not found in validation errors, try smart translate
    if (translated === errorMessage) {
      return Localization.smartTranslate(errorMessage, language);
    }
    
    return translated;
  }

  /**
   * Translate an array of error messages
   * @param {Array} errors - Array of error objects or strings
   * @param {string} language - Target language ('en' or 'es')
   * @returns {Array} - Array of translated errors
   */
  static translateErrors(errors, language = null) {
    if (!Array.isArray(errors)) return errors;
    
    return errors.map(error => {
      if (typeof error === 'string') {
        return this.translateError(error, language);
      }
      
      if (typeof error === 'object' && error.message) {
        return {
          ...error,
          message: this.translateError(error.message, language)
        };
      }
      
      return error;
    });
  }

  /**
   * Translate API response errors
   * @param {Object} apiResponse - API response object
   * @param {string} language - Target language ('en' or 'es')
   * @returns {Object} - API response with translated errors
   */
  static translateApiResponse(apiResponse, language = null) {
    if (!apiResponse) return apiResponse;
    
    const translated = { ...apiResponse };
    
    // Translate main message
    if (translated.message) {
      translated.message = this.translateError(translated.message, language);
    }
    
    // Translate error array
    if (translated.errors) {
      translated.errors = this.translateErrors(translated.errors, language);
    }
    
    // Translate error field (single error)
    if (translated.error) {
      translated.error = this.translateError(translated.error, language);
    }
    
    return translated;
  }

  /**
   * Extract and translate error message from various error sources
   * @param {Error|Object|string} error - Error object, API response, or string
   * @param {string} language - Target language ('en' or 'es')
   * @returns {string} - Translated error message
   */
  static extractAndTranslateError(error, language = null) {
    let errorMessage = '';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.response?.data?.message) {
      // Axios error with API response
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      // Alternative API error format
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      // Standard Error object
      errorMessage = error.message;
    } else if (error?.error) {
      // Simple error object
      errorMessage = error.error;
    } else {
      // Fallback for unknown error formats
      errorMessage = String(error);
    }
    
    return this.translateError(errorMessage, language);
  }

  /**
   * Get user-friendly error message for common HTTP status codes
   * @param {number} statusCode - HTTP status code
   * @param {string} language - Target language ('en' or 'es')
   * @returns {string} - User-friendly error message
   */
  static getStatusCodeMessage(statusCode, language = null) {
    const lang = language || Localization.currentLanguage;
    
    const statusMessages = {
      en: {
        400: 'Invalid request. Please check your input and try again.',
        401: 'Unauthorized. Please log in again.',
        403: 'Access denied. You don\'t have permission to perform this action.',
        404: 'The requested resource was not found.',
        409: 'Conflict. The resource already exists or cannot be modified.',
        422: 'Invalid data provided. Please check your input.',
        429: 'Too many requests. Please wait and try again.',
        500: 'Server error. Please try again later.',
        502: 'Service temporarily unavailable. Please try again later.',
        503: 'Service temporarily unavailable. Please try again later.',
        504: 'Request timeout. Please try again.',
      },
      es: {
        400: 'Solicitud inválida. Por favor verifique su entrada e intente de nuevo.',
        401: 'No autorizado. Por favor inicie sesión de nuevo.',
        403: 'Acceso denegado. No tiene permisos para realizar esta acción.',
        404: 'El recurso solicitado no fue encontrado.',
        409: 'Conflicto. El recurso ya existe o no puede ser modificado.',
        422: 'Datos inválidos proporcionados. Por favor verifique su entrada.',
        429: 'Demasiadas solicitudes. Por favor espere e intente de nuevo.',
        500: 'Error del servidor. Por favor intente más tarde.',
        502: 'Servicio temporalmente no disponible. Por favor intente más tarde.',
        503: 'Servicio temporalmente no disponible. Por favor intente más tarde.',
        504: 'Tiempo de espera agotado. Por favor intente de nuevo.',
      }
    };
    
    return statusMessages[lang]?.[statusCode] || statusMessages.en[statusCode] || 'An unexpected error occurred.';
  }

  /**
   * Handle and translate form validation errors from API
   * @param {Object} validationErrors - Validation errors object from API
   * @param {string} language - Target language ('en' or 'es')
   * @returns {Object} - Translated validation errors
   */
  static translateValidationErrors(validationErrors, language = null) {
    if (!validationErrors || typeof validationErrors !== 'object') {
      return validationErrors;
    }
    
    const translated = {};
    
    Object.keys(validationErrors).forEach(field => {
      const fieldErrors = validationErrors[field];
      
      if (Array.isArray(fieldErrors)) {
        translated[field] = fieldErrors.map(error => this.translateError(error, language));
      } else if (typeof fieldErrors === 'string') {
        translated[field] = this.translateError(fieldErrors, language);
      } else {
        translated[field] = fieldErrors;
      }
    });
    
    return translated;
  }
}