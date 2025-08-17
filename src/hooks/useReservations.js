import { useState, useCallback, useRef, useEffect } from 'react';
import { reservationService } from '../services/reservationService';
import { useAuth } from '../contexts/AuthContext';
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

  const fetchUserReservations = useCallback(async (forceRefresh = false) => {
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
      
      const response = await reservationService.getUserReservations({
        signal: abortController.current.signal
      });
      
      const userReservations = response.reservations || [];
      
      // Update cache
      cache.current.set(cacheKey, {
        data: userReservations,
        timestamp: Date.now()
      });
      
      setReservations(userReservations);
      return userReservations;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('Error fetching reservations:', err);
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
      
      const response = await reservationService.createReservation(reservationData);
      
      // Invalidate cache
      cache.current.clear();
      
      // Refresh reservations
      await fetchUserReservations(true);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserReservations]);

  const cancelReservation = useCallback(async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      
      await reservationService.cancelReservation(reservationId);
      
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
      setError(err.message);
      // Revert optimistic update
      await fetchUserReservations(true);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserReservations]);

  // Debounced search for admin panel
  const searchReservations = useCallback(
    debounce(async (query) => {
      try {
        setLoading(true);
        const results = await reservationService.searchReservations(query);
        setReservations(results.reservations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchUserReservations,
    createReservation,
    cancelReservation,
    searchReservations,
    clearCache,
  };
};