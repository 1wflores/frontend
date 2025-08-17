import { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../services/reservationService';

export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserReservations = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reservationService.getUserReservations(filters);
      setReservations(response.reservations);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch reservations';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (reservationData) => {
    try {
      setLoading(true);
      setError(null);
      
      const reservation = await reservationService.createReservation(reservationData);
      
      // Refresh reservations list
      await fetchUserReservations();
      
      return reservation;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create reservation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUserReservations]);

  const cancelReservation = useCallback(async (reservationId) => {
    try {
      setLoading(true);
      setError(null);
      
      await reservationService.cancelReservation(reservationId);
      
      // Refresh reservations list
      await fetchUserReservations();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to cancel reservation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUserReservations]);

  const getAvailableSlots = useCallback(async (amenityId, date) => {
    try {
      setError(null);
      return await reservationService.getAvailableSlots(amenityId, date);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch available slots';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchUserReservations();
  }, [fetchUserReservations]);

  return {
    reservations,
    loading,
    error,
    createReservation,
    cancelReservation,
    getAvailableSlots,
    fetchUserReservations,
  };
};