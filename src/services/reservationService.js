import { apiClient } from './apiClient';
import { ValidationUtils } from '../utils/validationUtils';

export class ReservationService {
  async createReservation(reservationData) {
    try {
      // 🔥 NEW: Get user's existing reservations to check for approval logic
      const userReservationsResponse = await this.getUserReservations();
      const userReservations = userReservationsResponse.reservations || [];

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

  async getUserReservations(filters = {}) {
    try {
      const response = await apiClient.get('/api/reservations/user', { params: filters });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getReservationById(reservationId) {
    try {
      const response = await apiClient.get(`/api/reservations/${reservationId}`);
      return response.data.data.reservation;
    } catch (error) {
      throw error;
    }
  }

  async getAvailableSlots(amenityId, date) {
    try {
      const response = await apiClient.get('/api/reservations/available-slots', {
        params: { amenityId, date }
      });
      return response.data.data.slots;
    } catch (error) {
      throw error;
    }
  }

  async cancelReservation(reservationId) {
    try {
      const response = await apiClient.delete(`/api/reservations/${reservationId}`);
      return response.data.data.reservation;
    } catch (error) {
      throw error;
    }
  }

  // 🔥 ADMIN METHODS
  async getAllReservations(filters = {}) {
    try {
      const response = await apiClient.get('/api/reservations', { params: filters });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async approveReservation(reservationId) {
    try {
      const response = await apiClient.patch(`/api/reservations/${reservationId}/approve`);
      return response.data.data.reservation;
    } catch (error) {
      throw error;
    }
  }

  async denyReservation(reservationId, denialReason) {
    try {
      const response = await apiClient.patch(`/api/reservations/${reservationId}/deny`, {
        denialReason
      });
      return response.data.data.reservation;
    } catch (error) {
      throw error;
    }
  }

  async updateReservationStatus(reservationId, status, denialReason = null) {
    try {
      const response = await apiClient.patch(`/api/reservations/${reservationId}/status`, {
        status,
        denialReason
      });
      return response.data.data.reservation;
    } catch (error) {
      throw error;
    }
  }

  // 🔥 NEW: Admin maintenance reservations
  async createMaintenanceReservation(maintenanceData) {
    try {
      const response = await apiClient.post('/api/reservations/maintenance', maintenanceData);
      return response.data.data.reservation;
    } catch (error) {
      throw error;
    }
  }
}

export const reservationService = new ReservationService();