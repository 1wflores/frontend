// Enhanced ApiErrorTranslator.js with better error handling and translation

import { Localization } from './localization';

/**
 * Enhanced utility class to translate API error messages and handle various error scenarios
 */
export class ApiErrorTranslator {
  
  /**
   * Translate a single error message with improved logic
   * @param {string} errorMessage - The error message in English
   * @param {string} language - Target language ('en' or 'es')
   * @returns {string} - Translated error message
   */
  static translateError(errorMessage, language = null) {
    if (!errorMessage) return errorMessage;
    
    const targetLang = language || Localization.currentLanguage;
    
    // If already in English and target is English, return as-is
    if (targetLang === 'en') {
      return errorMessage;
    }
    
    // First try direct validation error translation
    const validationTranslation = Localization.translateValidationError(errorMessage, targetLang);
    if (validationTranslation !== errorMessage) {
      return validationTranslation;
    }
    
    // Then try smart translation for other content
    return Localization.smartTranslate(errorMessage, targetLang);
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
   * Enhanced API response error translation
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
    
    // Handle data.message (nested message)
    if (translated.data?.message) {
      translated.data.message = this.translateError(translated.data.message, language);
    }
    
    return translated;
  }

  /**
   * Enhanced error extraction and translation from various error sources
   * @param {Error|Object|string} error - Error object, API response, or string
   * @param {string} language - Target language ('en' or 'es')
   * @returns {string} - Translated error message
   */
  static extractAndTranslateError(error, language = null) {
    let errorMessage = '';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.response?.data?.message) {
      // Axios error with API response message
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.error) {
      // Alternative API error format
      errorMessage = error.response.data.error;
    } else if (error?.response?.data) {
      // Try to extract any error from response data
      const responseData = error.response.data;
      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData.errors && Array.isArray(responseData.errors)) {
        errorMessage = responseData.errors[0];
      }
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
    const targetLang = language || Localization.currentLanguage;
    
    const statusKeyMap = {
      400: 'validationError',
      401: 'authError',
      403: 'permissionError',
      404: 'notFoundError',
      409: 'conflictError',
      422: 'validationError',
      429: 'rateLimitError',
      500: 'serverError',
      502: 'serverError',
      503: 'maintenanceError',
      504: 'networkError',
    };
    
    const errorKey = statusKeyMap[statusCode];
    if (errorKey) {
      return Localization.getTranslation(`errors.${errorKey}`, targetLang);
    }
    
    return Localization.getTranslation('errors.unknownError', targetLang);
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

  /**
   * Enhanced error handler for common authentication scenarios
   * @param {Error} error - Error object from authentication request
   * @param {string} language - Target language ('en' or 'es')
   * @returns {Object} - Structured error response with title and message
   */
  static handleAuthError(error, language = null) {
    const targetLang = language || Localization.currentLanguage;
    
    let title = Localization.getTranslation('auth.loginFailed', targetLang);
    let message = '';
    
    if (error?.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Invalid credentials
          if (error.response.data?.message) {
            message = this.translateError(error.response.data.message, targetLang);
          } else {
            message = Localization.getTranslation('auth.invalidCredentials', targetLang);
          }
          break;
          
        case 429:
          // Rate limited
          message = Localization.getTranslation('errors.rateLimitError', targetLang);
          break;
          
        case 500:
        case 502:
        case 503:
          // Server errors
          message = Localization.getTranslation('errors.serverError', targetLang);
          break;
          
        default:
          message = this.extractAndTranslateError(error, targetLang);
      }
    } else if (error?.message) {
      // Network or other errors
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        message = Localization.getTranslation('errors.networkError', targetLang);
      } else {
        message = this.translateError(error.message, targetLang);
      }
    } else {
      // Fallback
      message = Localization.getTranslation('errors.unknownError', targetLang);
    }
    
    return {
      title,
      message,
      originalError: error
    };
  }

  /**
   * Utility method to create user-friendly error messages for network requests
   * @param {Error} error - Error from network request
   * @param {string} operation - Description of what operation failed (e.g., 'login', 'booking')
   * @param {string} language - Target language ('en' or 'es')
   * @returns {Object} - Formatted error with title and message
   */
  static createUserFriendlyError(error, operation = 'operation', language = null) {
    const targetLang = language || Localization.currentLanguage;
    
    // For authentication operations, use specialized handler
    if (operation === 'login' || operation === 'auth') {
      return this.handleAuthError(error, targetLang);
    }
    
    let title = Localization.getTranslation('common.error', targetLang);
    let message = '';
    
    if (error?.response?.status) {
      message = this.getStatusCodeMessage(error.response.status, targetLang);
    } else if (error?.message) {
      message = this.translateError(error.message, targetLang);
    } else {
      message = Localization.getTranslation('errors.unknownError', targetLang);
    }
    
    return {
      title,
      message,
      originalError: error
    };
  }
}