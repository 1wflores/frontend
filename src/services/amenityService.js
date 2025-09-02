// src/services/amenityService.js - FIXED VERSION

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
      
      // FIX: Extract amenities from response.data.data.amenities
      if (response.data && response.data.success) {
        return {
          success: true,
          data: {
            amenities: response.data.data.amenities || []
          }
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Get all amenities error:', error);
      throw error;
    }
  }

  /**
   * Get amenity by ID
   * FIX: Return the actual amenity object, not the API wrapper
   */
  async getAmenityById(id) {
    try {
      console.log('🔍 AmenityService: Getting amenity by ID:', id);
      
      const response = await apiClient.get(`/api/amenities/${id}`);
      
      console.log('📦 AmenityService: Raw API response:', response.data);
      
      // FIX: Extract the actual amenity object from the response
      if (response.data && response.data.success && response.data.data && response.data.data.amenity) {
        const amenity = response.data.data.amenity;
        console.log('✅ AmenityService: Extracted amenity:', amenity);
        return amenity;
      }
      
      // Handle case where response structure is different
      if (response.data && !response.data.success) {
        throw new Error(response.data.message || 'Amenity not found');
      }
      
      console.warn('⚠️ AmenityService: Unexpected response structure:', response.data);
      return null;
    } catch (error) {
      console.error('❌ AmenityService: Get amenity by ID error:', error);
      
      // If it's a 404, return null instead of throwing
      if (error.response && error.response.status === 404) {
        return null;
      }
      
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
        updatedAt: new Date().toISOString()
      };
      
      const response = await apiClient.put(`/api/amenities/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update amenity status error:', error);
      throw error;
    }
  }

  /**
   * Validate amenity data before submission
   */
  validateAmenityData(amenityData) {
    const errors = {};
    
    if (!amenityData.name || amenityData.name.trim().length === 0) {
      errors.name = 'Name is required';
    }
    
    if (!amenityData.type) {
      errors.type = 'Type is required';
    }
    
    if (!amenityData.capacity || amenityData.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1';
    }
    
    if (!amenityData.operatingHours) {
      errors.operatingHours = 'Operating hours are required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format amenity data for API submission
   */
  formatAmenityData(amenityData) {
    return {
      name: amenityData.name?.trim(),
      type: amenityData.type,
      description: amenityData.description?.trim() || '',
      capacity: parseInt(amenityData.capacity),
      operatingHours: amenityData.operatingHours,
      autoApprovalRules: amenityData.autoApprovalRules || {
        maxDurationMinutes: 60,
        maxReservationsPerDay: 3
      },
      specialRequirements: amenityData.specialRequirements || {},
      isActive: amenityData.isActive !== undefined ? amenityData.isActive : true
    };
  }
}

// Export a singleton instance
export const amenityService = new AmenityService();
export default amenityService;