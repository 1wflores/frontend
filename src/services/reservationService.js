// src/services/reservationService.js - UPDATED VERSION

import { apiClient } from './apiClient';
import { ValidationUtils } from '../utils/validationUtils';

export class ReservationService {
  async createReservation(reservationData) {
    try {
      // 🔥 NEW: Get user's existing reservations to check for approval logic
      const userReservationsResponse = await this.getUserReservations();
      const userReservations = userReservationsResponse.reservations || userReservationsResponse || [];

      // 🔥 NEW: Determine if this reservation needs approval
      const needsApproval = ValidationUtils.needsApproval(reservationData, userReservations);
      
      // Add approval status to reservation data
      const enhancedReservationData = {
        ...reservationData,
        requiresApproval: needsApproval
      };

      const response = await apiClient.post('/api/reservations', enhancedReservationData);
      return response.data.data.reservation;
    } catch (error) {
      throw error;
    }
  }

  // ✅ UPDATED: Simplified getUserReservations - backend now handles filtering
  async getUserReservations(filters = {}) {
    try {
      console.log('📥 ReservationService: Getting user reservations with filters:', filters);
      
      const response = await apiClient.get('/api/reservations/user', { params: filters });
      
      console.log('📊 ReservationService: Raw API response:', response);
      
      // ✅ ENHANCED: Handle different response structures
      let reservations = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          reservations = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          reservations = response.data.data;
        } else if (response.data.reservations && Array.isArray(response.data.reservations)) {
          reservations = response.data.reservations;
        } else if (response.data.data && response.data.data.reservations && Array.isArray(response.data.data.reservations)) {
          reservations = response.data.data.reservations;
        }
      }
      
      console.log(`📊 ReservationService: Processed ${reservations.length} reservations`);
      console.log(`ℹ️  Note: Backend now filters reservations based on user role - residents only get upcoming reservations`);
      
      // ✅ IMPORTANT: Return consistent structure
      return {
        reservations: reservations,
        total: reservations.length
      };
    } catch (error) {
      console.error('❌ ReservationService: getUserReservations error:', error);
      
      // ✅ ENHANCED: Better error handling for different scenarios
      if (error.response?.status === 404) {
        // No reservations found - return empty array instead of error
        console.log('ℹ️ ReservationService: User has no reservations yet');
        return {
          reservations: [],
          total: 0
        };
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your permissions.');
      }
      throw error;
    }
  }

  async getAvailableSlots(amenityId, date, duration = 60) {
    try {
      console.log('📥 ReservationService: Getting available slots:', { amenityId, date, duration });
      
      const response = await apiClient.get('/api/reservations/available-slots', {
        params: { 
          amenityId, 
          date, 
          duration 
        }
      });
      
      console.log('📊 ReservationService: Available slots response:', response.data);
      
      return response.data.data.slots || response.data.slots || [];
    } catch (error) {
      console.error('❌ ReservationService: getAvailableSlots error:', error);
      throw error;
    }
  }

  async cancelReservation(reservationId) {
    try {
      console.log('📥 ReservationService: Cancelling reservation:', reservationId);
      
      const response = await apiClient.delete(`/api/reservations/${reservationId}`);
      
      console.log('✅ ReservationService: Reservation cancelled:', response.data);
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ ReservationService: cancelReservation error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Reservation not found');
      } else if (error.response?.status === 403) {
        throw new Error('Cannot cancel this reservation');
      }
      throw error;
    }
  }

  // 🔥 ADMIN METHODS

  // ✅ UPDATED: getAllReservations for admin use
  async getAllReservations(filters = {}) {
    try {
      console.log('📥 ReservationService: Getting all reservations with filters:', filters);
      
      const response = await apiClient.get('/api/reservations', { params: filters });
      
      console.log('📊 ReservationService: All reservations response:', response.data);
      
      // ✅ ENHANCED: Handle different response structures
      let reservations = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          reservations = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          reservations = response.data.data;
        } else if (response.data.reservations && Array.isArray(response.data.reservations)) {
          reservations = response.data.reservations;
        } else if (response.data.data && response.data.data.reservations && Array.isArray(response.data.data.reservations)) {
          reservations = response.data.data.reservations;
        }
      }
      
      console.log(`📊 ReservationService: Processed ${reservations.length} total reservations`);
      
      return {
        reservations: reservations,
        total: reservations.length
      };
    } catch (error) {
      console.error('❌ ReservationService: getAllReservations error:', error);
      
      // ✅ ENHANCED: Better error handling
      if (error.response?.status === 404) {
        // No reservations found - return empty array
        return {
          reservations: [],
          total: 0
        };
      }
      throw error;
    }
  }

  // ✅ UPDATED: Admin approval methods
  async approveReservation(reservationId) {
    try {
      console.log('📥 ReservationService: Approving reservation:', reservationId);
      
      const response = await apiClient.patch(`/api/reservations/${reservationId}/status`, {
        status: 'approved'
      });
      
      console.log('✅ ReservationService: Reservation approved:', response.data);
      
      return response.data.data.reservation;
    } catch (error) {
      console.error('❌ ReservationService: approveReservation error:', error);
      throw error;
    }
  }

  async denyReservation(reservationId, denialReason) {
    try {
      console.log('📥 ReservationService: Denying reservation:', reservationId, 'Reason:', denialReason);
      
      const response = await apiClient.patch(`/api/reservations/${reservationId}/status`, {
        status: 'denied',
        denialReason
      });
      
      console.log('✅ ReservationService: Reservation denied:', response.data);
      
      return response.data.data.reservation;
    } catch (error) {
      console.error('❌ ReservationService: denyReservation error:', error);
      throw error;
    }
  }

  async updateReservationStatus(reservationId, status, denialReason = null) {
    try {
      console.log('📥 ReservationService: Updating reservation status:', { reservationId, status, denialReason });
      
      const payload = { status };
      
      // Only include denialReason if it has a value to avoid validation issues
      if (denialReason && denialReason.trim()) {
        payload.denialReason = denialReason;
      }
      
      const response = await apiClient.patch(`/api/reservations/${reservationId}/status`, payload);
      
      console.log('✅ ReservationService: Status updated:', response.data);
      
      return response.data.data.reservation;
    } catch (error) {
      console.error('❌ ReservationService: updateReservationStatus error:', error);
      throw error;
    }
  }

  // 🔥 NEW: Admin maintenance reservations
  async createMaintenanceReservation(maintenanceData) {
    try {
      console.log('📥 ReservationService: Creating maintenance reservation:', maintenanceData);
      
      const response = await apiClient.post('/api/reservations/maintenance', maintenanceData);
      
      console.log('✅ ReservationService: Maintenance reservation created:', response.data);
      
      return response.data.data.reservation;
    } catch (error) {
      console.error('❌ ReservationService: createMaintenanceReservation error:', error);
      throw error;
    }
  }

  // ✅ NEW: Search reservations (if backend supports it)
  async searchReservations(query) {
    try {
      console.log('📥 ReservationService: Searching reservations:', query);
      
      const response = await apiClient.get('/api/reservations/search', {
        params: { q: query }
      });
      
      console.log('📊 ReservationService: Search results:', response.data);
      
      // Return consistent structure
      const reservations = response.data.data?.reservations || response.data.reservations || response.data || [];
      return {
        reservations: reservations,
        total: reservations.length
      };
    } catch (error) {
      console.error('❌ ReservationService: searchReservations error:', error);
      
      // If search endpoint doesn't exist, fall back to getAllReservations
      if (error.response?.status === 404) {
        console.log('ℹ️ Search endpoint not available, using getAllReservations');
        return await this.getAllReservations();
      }
      throw error;
    }
  }

  // ✅ NEW: Get reservation by ID
  async getReservationById(reservationId) {
    try {
      console.log('📥 ReservationService: Getting reservation by ID:', reservationId);
      
      const response = await apiClient.get(`/api/reservations/${reservationId}`);
      
      console.log('📊 ReservationService: Reservation details:', response.data);
      
      return response.data.data.reservation;
    } catch (error) {
      console.error('❌ ReservationService: getReservationById error:', error);
      throw error;
    }
  }

  // ✅ NEW: Get reservations by amenity (admin only)
  async getReservationsByAmenity(amenityId, startDate, endDate) {
    try {
      console.log('📥 ReservationService: Getting reservations by amenity:', { amenityId, startDate, endDate });
      
      const response = await apiClient.get(`/api/reservations/amenity/${amenityId}`, {
        params: { startDate, endDate }
      });
      
      console.log('📊 ReservationService: Amenity reservations:', response.data);
      
      const reservations = response.data.data?.reservations || response.data.reservations || [];
      return {
        reservations: reservations,
        total: reservations.length
      };
    } catch (error) {
      console.error('❌ ReservationService: getReservationsByAmenity error:', error);
      throw error;
    }
  }

  // ✅ NEW: Health check
  async getReservationHealth() {
    try {
      console.log('📥 ReservationService: Getting reservation system health');
      
      const response = await apiClient.get('/api/reservations/health');
      
      console.log('📊 ReservationService: Health status:', response.data);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ ReservationService: getReservationHealth error:', error);
      throw error;
    }
  }
}

export const reservationService = new ReservationService();