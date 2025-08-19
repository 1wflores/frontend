import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

export const useAmenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAmenities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/amenities');
      setAmenities(response.data.data.amenities);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch amenities';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // FIX: Empty dependency array since fetchAmenities doesn't depend on any external values

  const getAmenityById = useCallback(async (amenityId) => {
    try {
      const response = await apiClient.get(`/api/amenities/${amenityId}`);
      return response.data.data.amenity;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to fetch amenity');
    }
  }, []);

  const getAmenitiesByType = useCallback(async (type) => {
    try {
      const response = await apiClient.get(`/api/amenities/type/${type}`);
      return response.data.data.amenities;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to fetch amenities by type');
    }
  }, []);

  // FIX: Only run once on mount, not when fetchAmenities changes
  useEffect(() => {
    fetchAmenities();
  }, []); // Empty dependency array - only run once on mount

  return {
    amenities,
    loading,
    error,
    fetchAmenities,
    getAmenityById,
    getAmenitiesByType,
  };
};