// src/hooks/useReservations.js - FIXED VERSION

import { useState, useCallback, useRef, useEffect } from 'react';
import { reservationService } from '../services/reservationService';
import { useAuth } from './useAuth';
import debounce from 'lodash.debounce';

export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  // Cache management
  const cache = useRef(new Map());
  const cacheTimeout = useRef(5 * 60 * 1000); // 5 minutes
  const abortController = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const getCacheKey = useCallback((type = 'user') => {
    return `${type}-${user?.id}-${new Date().toDateString()}`;
  }, [user]);

  // ✅ FIXED: Enhanced fetchUserReservations with better error handling
  const fetchUserReservations = useCallback(async (forceRefresh = false, filters = {}) => {
    const cacheKey = getCacheKey('user');
    
    // Check cache first
    if (!forceRefresh && cache.current.has(cacheKey)) {
      const cached = cache.current.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTimeout.current) {
        setReservations(cached.data);
        return cached.data;
      }
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching user reservations with filters:', filters);
      
      const response = await reservationService.getUserReservations({
        ...filters,
        signal: abortController.current.signal
      });
      
      console.log('📊 User reservations API response:', response);
      
      // ✅ ENHANCED: Handle different response structures gracefully
      let userReservations = [];
      if (response) {
        if (Array.isArray(response)) {
          userReservations = response;
        } else if (response.reservations && Array.isArray(response.reservations)) {
          userReservations = response.reservations;
        } else if (response.data && Array.isArray(response.data)) {
          userReservations = response.data;
        }
      }
      
      // ✅ IMPORTANT: Always ensure we have an array
      userReservations = userReservations || [];
      
      console.log(`✅ Loaded ${userReservations.length} user reservations successfully`);
      
      // Update cache
      cache.current.set(cacheKey, {
        data: userReservations,
        timestamp: Date.now()
      });
      
      setReservations(userReservations);
      return userReservations;
    } catch (err) {
      console.error('❌ Error fetching user reservations:', err);
      
      if (err.name !== 'AbortError') {
        // ✅ ENHANCED: Better error handling for different scenarios
        if (err.response?.status === 404 || err.message.includes('not found')) {
          // User has no reservations - this is normal, not an error
          console.log('ℹ️ User has no reservations yet');
          setReservations([]);
          setError(null);
          return [];
        } else if (err.response?.status === 401) {
          // Authentication error
          setError('Please log in again');
        } else if (err.response?.status === 500) {
          // Server error
          setError('Server error occurred. Please try again later.');
        } else {
          // Generic error
          setError(err.message || 'Failed to fetch reservations');
        }
      }
      return [];
    } finally {
      setLoading(false);
      abortController.current = null;
    }
  }, [getCacheKey]);

  const createReservation = useCallback(async (reservationData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Creating reservation:', reservationData);
      
      const response = await reservationService.createReservation(reservationData);
      
      console.log('✅ Reservation created successfully:', response);
      
      // Invalidate cache
      cache.current.clear();
      
      // Refresh reservations
      await fetchUserReservations(true);
      
      return response;
    } catch (err) {
      console.error('❌ Error creating reservation:', err);
      setError(err.message || 'Failed to create reservation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserReservations]);

  const cancelReservation = useCallback(async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('❌ Cancelling reservation:', reservationId);
      
      await reservationService.cancelReservation(reservationId);
      
      console.log('✅ Reservation cancelled successfully');
      
      // Optimistic update
      setReservations(prev => 
        prev.map(r => 
          r.id === reservationId 
            ? { ...r, status: 'cancelled' }
            : r
        )
      );
      
      // Invalidate cache
      cache.current.clear();
      
      // Refresh in background
      fetchUserReservations(true);
      
      return true;
    } catch (err) {
      console.error('❌ Error cancelling reservation:', err);
      setError(err.message || 'Failed to cancel reservation');
      // Revert optimistic update
      await fetchUserReservations(true);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserReservations]);

  // ✅ ENHANCED: getAvailableSlots with better error handling
  const getAvailableSlots = useCallback(async (amenityId, date) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Getting available slots:', { amenityId, date });
      
      const slots = await reservationService.getAvailableSlots(amenityId, date);
      
      console.log('✅ Available slots loaded:', slots);
      
      return slots || [];
    } catch (err) {
      console.error('❌ Error fetching available slots:', err);
      setError(err.message || 'Failed to fetch available slots');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search for admin panel
  const searchReservations = useCallback(
    debounce(async (query) => {
      try {
        setLoading(true);
        console.log('🔍 Searching reservations:', query);
        
        const results = await reservationService.searchReservations(query);
        const searchResults = results?.reservations || results || [];
        
        console.log('🔍 Search results:', searchResults);
        
        setReservations(searchResults);
      } catch (err) {
        console.error('❌ Error searching reservations:', err);
        setError(err.message || 'Failed to search reservations');
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchUserReservations,
    createReservation,
    cancelReservation,
    getAvailableSlots,
    searchReservations,
    clearCache,
    clearError, // ✅ NEW: Allow manual error clearing
  };
};