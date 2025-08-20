import { apiClient } from './apiClient';

/**
 * Amenity API Service
 * Handles all amenity-related API calls
 */
class AmenityService {
  /**
   * Get all amenities
   */
  async getAllAmenities() {
    try {
      const response = await apiClient.get('/api/amenities');
      return response.data;
    } catch (error) {
      console.error('Get all amenities error:', error);
      throw error;
    }
  }

  /**
   * Get amenity by ID
   */
  async getAmenityById(id) {
    try {
      const response = await apiClient.get(`/api/amenities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get amenity by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new amenity
   */
  async createAmenity(amenityData) {
    try {
      const response = await apiClient.post('/api/amenities', amenityData);
      return response.data;
    } catch (error) {
      console.error('Create amenity error:', error);
      throw error;
    }
  }

  /**
   * Update existing amenity
   */
  async updateAmenity(id, updateData) {
    try {
      const response = await apiClient.put(`/api/amenities/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update amenity error:', error);
      throw error;
    }
  }

  /**
   * Delete amenity (soft delete)
   */
  async deleteAmenity(id) {
    try {
      const response = await apiClient.delete(`/api/amenities/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete amenity error:', error);
      throw error;
    }
  }

  /**
   * Get reservations for a specific amenity
   */
  async getAmenityReservations(amenityId) {
    try {
      const response = await apiClient.get(`/api/reservations/amenity/${amenityId}`);
      return response.data;
    } catch (error) {
      console.error('Get amenity reservations error:', error);
      throw error;
    }
  }

  /**
   * Update amenity status (active/maintenance)
   */
  async updateAmenityStatus(id, isActive, maintenanceNotes = '') {
    try {
      const updateData = {
        isActive,
        ...(maintenanceNotes && { maintenanceNotes }),
        updatedAt: new Date().toISOString(),
      };
      
      const response = await apiClient.put(`/api/amenities/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update amenity status error:', error);
      throw error;
    }
  }

  /**
   * Get amenity availability for a specific date
   */
  async getAmenityAvailability(amenityId, date, duration = 60) {
    try {
      const response = await apiClient.get(`/api/amenities/${amenityId}/availability`, {
        params: { date, duration }
      });
      return response.data;
    } catch (error) {
      console.error('Get amenity availability error:', error);
      throw error;
    }
  }

  /**
   * Validate amenity form data
   */
  validateAmenityData(data) {
    const errors = {};

    // Required fields
    if (!data.name || !data.name.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    if (!data.type) {
      errors.type = 'Type is required';
    } else if (!['jacuzzi', 'cold-tub', 'yoga-deck', 'lounge'].includes(data.type)) {
      errors.type = 'Invalid amenity type';
    }

    // Capacity validation
    const capacity = parseInt(data.capacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 100) {
      errors.capacity = 'Capacity must be between 1 and 100';
    }

    // Operating hours validation
    if (!data.operatingHours) {
      errors.operatingHours = 'Operating hours are required';
    } else {
      if (!data.operatingHours.start || !data.operatingHours.end) {
        errors.operatingHours = 'Start and end times are required';
      }

      if (!data.operatingHours.days || data.operatingHours.days.length === 0) {
        errors.days = 'At least one operating day must be selected';
      }
    }

    // Auto approval rules validation
    if (data.autoApprovalRules) {
      const maxDuration = parseInt(data.autoApprovalRules.maxDurationMinutes);
      if (isNaN(maxDuration) || maxDuration < 15 || maxDuration > 480) {
        errors.maxDuration = 'Max duration must be between 15 and 480 minutes';
      }

      const maxReservations = parseInt(data.autoApprovalRules.maxReservationsPerDay);
      if (isNaN(maxReservations) || maxReservations < 1 || maxReservations > 10) {
        errors.maxReservations = 'Max reservations must be between 1 and 10';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format amenity data for API submission
   */
  formatAmenityData(formData) {
    return {
      name: formData.name.trim(),
      type: formData.type,
      description: formData.description?.trim() || '',
      capacity: parseInt(formData.capacity),
      operatingHours: {
        start: formData.operatingHours.start,
        end: formData.operatingHours.end,
        days: formData.operatingHours.days.sort(), // Sort days array
      },
      autoApprovalRules: {
        maxDurationMinutes: parseInt(formData.autoApprovalRules.maxDurationMinutes),
        maxReservationsPerDay: parseInt(formData.autoApprovalRules.maxReservationsPerDay),
      },
      specialRequirements: formData.specialRequirements || {},
    };
  }
}

export const amenityService = new AmenityService();