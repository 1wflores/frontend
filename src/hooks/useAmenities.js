import { useState, useCallback } from 'react';
import { amenityService } from '../services/amenityService';

export const useAmenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all amenities
   */
  const fetchAmenities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await amenityService.getAllAmenities();
      
      if (response.success) {
        setAmenities(response.data.amenities || []);
      } else {
        throw new Error(response.message || 'Failed to fetch amenities');
      }
    } catch (err) {
      console.error('Fetch amenities error:', err);
      setError(err.message || 'Failed to load amenities');
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get amenity by ID
   */
  const getAmenityById = useCallback(async (id) => {
    try {
      setError(null);
      const response = await amenityService.getAmenityById(id);
      
      if (response.success) {
        return response.data.amenity;
      } else {
        throw new Error(response.message || 'Amenity not found');
      }
    } catch (err) {
      console.error('Get amenity by ID error:', err);
      setError(err.message || 'Failed to load amenity');
      return null;
    }
  }, []);

  /**
   * Create new amenity
   */
  const createAmenity = useCallback(async (amenityData) => {
    try {
      setError(null);
      
      // Validate data
      const validation = amenityService.validateAmenityData(amenityData);
      if (!validation.isValid) {
        throw new Error('Invalid amenity data: ' + Object.values(validation.errors).join(', '));
      }

      // Format data for API
      const formattedData = amenityService.formatAmenityData(amenityData);
      
      const response = await amenityService.createAmenity(formattedData);
      
      if (response.success) {
        // Add new amenity to local state
        setAmenities(prev => [...prev, response.data.amenity]);
        return response.data.amenity;
      } else {
        throw new Error(response.message || 'Failed to create amenity');
      }
    } catch (err) {
      console.error('Create amenity error:', err);
      setError(err.message || 'Failed to create amenity');
      throw err;
    }
  }, []);

  /**
   * Update existing amenity
   */
  const updateAmenity = useCallback(async (id, updateData) => {
    try {
      setError(null);
      
      // Validate data
      const validation = amenityService.validateAmenityData(updateData);
      if (!validation.isValid) {
        throw new Error('Invalid amenity data: ' + Object.values(validation.errors).join(', '));
      }

      // Format data for API
      const formattedData = amenityService.formatAmenityData(updateData);
      
      const response = await amenityService.updateAmenity(id, formattedData);
      
      if (response.success) {
        // Update amenity in local state
        setAmenities(prev => 
          prev.map(amenity => 
            amenity.id === id ? response.data.amenity : amenity
          )
        );
        return response.data.amenity;
      } else {
        throw new Error(response.message || 'Failed to update amenity');
      }
    } catch (err) {
      console.error('Update amenity error:', err);
      setError(err.message || 'Failed to update amenity');
      throw err;
    }
  }, []);

  /**
   * Delete amenity (soft delete)
   */
  const deleteAmenity = useCallback(async (id) => {
    try {
      setError(null);
      
      const response = await amenityService.deleteAmenity(id);
      
      if (response.success) {
        // Remove amenity from local state
        setAmenities(prev => prev.filter(amenity => amenity.id !== id));
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete amenity');
      }
    } catch (err) {
      console.error('Delete amenity error:', err);
      setError(err.message || 'Failed to delete amenity');
      throw err;
    }
  }, []);

  /**
   * Update amenity status (active/maintenance)
   */
  const updateAmenityStatus = useCallback(async (id, isActive, maintenanceNotes = '') => {
    try {
      setError(null);
      
      const response = await amenityService.updateAmenityStatus(id, isActive, maintenanceNotes);
      
      if (response.success) {
        // Update amenity status in local state
        setAmenities(prev => 
          prev.map(amenity => 
            amenity.id === id 
              ? { ...amenity, isActive, maintenanceNotes, updatedAt: new Date().toISOString() }
              : amenity
          )
        );
        return response.data.amenity;
      } else {
        throw new Error(response.message || 'Failed to update amenity status');
      }
    } catch (err) {
      console.error('Update amenity status error:', err);
      setError(err.message || 'Failed to update amenity status');
      throw err;
    }
  }, []);

  /**
   * Get amenity availability
   */
  const getAmenityAvailability = useCallback(async (amenityId, date, duration = 60) => {
    try {
      setError(null);
      
      const response = await amenityService.getAmenityAvailability(amenityId, date, duration);
      
      if (response.success) {
        return response.data.availability;
      } else {
        throw new Error(response.message || 'Failed to get availability');
      }
    } catch (err) {
      console.error('Get amenity availability error:', err);
      setError(err.message || 'Failed to get availability');
      return null;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh amenities (alias for fetchAmenities)
   */
  const refreshAmenities = useCallback(async () => {
    await fetchAmenities();
  }, [fetchAmenities]);

  return {
    // State
    amenities,
    loading,
    error,
    
    // Actions
    fetchAmenities,
    getAmenityById,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    updateAmenityStatus,
    getAmenityAvailability,
    refreshAmenities,
    clearError,
    
    // Computed values
    activeAmenities: amenities.filter(a => a.isActive),
    maintenanceAmenities: amenities.filter(a => !a.isActive),
    totalAmenities: amenities.length,
  };
};