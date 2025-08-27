// src/hooks/useReservations.js - UPDATED VERSION

import { useState, useCallback, useRef } from 'react';
import { reservationService } from '../services/reservationService';

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache and abort controller refs
  const cache = useRef(new Map());
  const abortController = useRef(null);

  const getCacheKey = useCallback((filters = {}) => {
    return JSON.stringify(filters);
  }, []);

  const fetchUserReservations = useCallback(async (forceRefresh = false, filters = {}) => {
    const cacheKey = getCacheKey(filters);
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = cache.current.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('📋 Using cached user reservations');
        setReservations(cached.data);
        return cached.data;
      }
    }

    // Cancel previous request if it exists
    if (abortController.current) {
      abortController.current.abort();
    }

    // Create new abort controller
    abortController.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching user reservations with filters:', filters);
      
      const response = await reservationService.getUserReservations(filters);
      
      // Handle different response structures
      let userReservations = [];
      if (response && response.reservations && Array.isArray(response.reservations)) {
        userReservations = response.reservations;
      } else if (Array.isArray(response)) {
        userReservations = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        userReservations = response.data;
      }
      
      // ✅ IMPORTANT: Always ensure we have an array
      userReservations = userReservations || [];
      
      console.log(`✅ Loaded ${userReservations.length} user reservations successfully`);
      console.log(`ℹ️  Backend filtering: Residents only receive upcoming reservations, admins receive all data`);
      
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
      
      // Optimistic update - remove from current list
      setReservations(prev => prev.filter(r => r.id !== reservationId));
      
      // Invalidate cache
      cache.current.clear();
      
      // Refresh to get updated data from backend
      setTimeout(() => {
        fetchUserReservations(true);
      }, 500);
      
    } catch (err) {
      console.error('❌ Error cancelling reservation:', err);
      setError(err.message || 'Failed to cancel reservation');
      
      // Revert optimistic update by refreshing
      await fetchUserReservations(true);
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserReservations]);

  // ✅ NEW: Admin-specific methods
  const fetchAllReservations = useCallback(async (forceRefresh = false, filters = {}) => {
    const cacheKey = `all_${getCacheKey(filters)}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = cache.current.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('📋 Using cached all reservations');
        setReservations(cached.data);
        return cached.data;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching all reservations (admin) with filters:', filters);
      
      const response = await reservationService.getAllReservations(filters);
      
      let allReservations = [];
      if (response && response.reservations && Array.isArray(response.reservations)) {
        allReservations = response.reservations;
      } else if (Array.isArray(response)) {
        allReservations = response;
      }
      
      allReservations = allReservations || [];
      
      console.log(`✅ Loaded ${allReservations.length} total reservations (admin view)`);
      
      // Update cache
      cache.current.set(cacheKey, {
        data: allReservations,
        timestamp: Date.now()
      });
      
      setReservations(allReservations);
      return allReservations;
    } catch (err) {
      console.error('❌ Error fetching all reservations:', err);
      setError(err.message || 'Failed to fetch reservations');
      return [];
    } finally {
      setLoading(false);
    }
  }, [getCacheKey]);

  const approveReservation = useCallback(async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('✅ Approving reservation:', reservationId);
      
      const updatedReservation = await reservationService.approveReservation(reservationId);
      
      console.log('✅ Reservation approved successfully:', updatedReservation);
      
      // Optimistic update
      setReservations(prev => 
        prev.map(r => 
          r.id === reservationId 
            ? { ...r, status: 'approved', updatedAt: new Date().toISOString() }
            : r
        )
      );
      
      // Invalidate cache
      cache.current.clear();
      
      return updatedReservation;
    } catch (err) {
      console.error('❌ Error approving reservation:', err);
      setError(err.message || 'Failed to approve reservation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const denyReservation = useCallback(async (reservationId, denialReason) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('❌ Denying reservation:', reservationId, 'Reason:', denialReason);
      
      const updatedReservation = await reservationService.denyReservation(reservationId, denialReason);
      
      console.log('✅ Reservation denied successfully:', updatedReservation);
      
      // Optimistic update
      setReservations(prev => 
        prev.map(r => 
          r.id === reservationId 
            ? { ...r, status: 'denied', rejectionReason: denialReason, updatedAt: new Date().toISOString() }
            : r
        )
      );
      
      // Invalidate cache
      cache.current.clear();
      
      return updatedReservation;
    } catch (err) {
      console.error('❌ Error denying reservation:', err);
      setError(err.message || 'Failed to deny reservation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailableSlots = useCallback(async (amenityId, date, duration = 60) => {
    try {
      console.log('📅 Getting available slots:', { amenityId, date, duration });
      
      const slots = await reservationService.getAvailableSlots(amenityId, date, duration);
      
      console.log(`✅ Found ${slots.length} available slots`);
      
      return slots;
    } catch (err) {
      console.error('❌ Error getting available slots:', err);
      throw err;
    }
  }, []);

  // ✅ NEW: Clear cache utility
  const clearCache = useCallback(() => {
    console.log('🗑️ Clearing reservations cache');
    cache.current.clear();
  }, []);

  // ✅ NEW: Get cached data
  const getCachedReservations = useCallback((filters = {}) => {
    const cacheKey = getCacheKey(filters);
    const cached = cache.current.get(cacheKey);
    return cached?.data || null;
  }, [getCacheKey]);

  return {
    // Data
    reservations,
    loading,
    error,
    
    // User methods
    fetchUserReservations,
    createReservation,
    cancelReservation,
    getAvailableSlots,
    
    // Admin methods
    fetchAllReservations,
    approveReservation,
    denyReservation,
    
    // Utilities
    clearCache,
    getCachedReservations,
  };
};