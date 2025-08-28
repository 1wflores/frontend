// src/hooks/useReservationEdit.js - COMPLETE FILE WITH LOUNGE SUPPORT

import { useState } from 'react';
import { reservationService } from '../services/reservationService';
import { amenityService } from '../services/amenityService';
import { useLanguage } from '../contexts/LanguageContext';
import { Alert } from 'react-native';

export const useReservationEdit = () => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update reservation with lounge support
  const updateReservation = async (reservationId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedReservation = await reservationService.updateReservation(
        reservationId,
        updateData
      );
      
      setLoading(false);
      return updatedReservation;
    } catch (err) {
      console.error('Error updating reservation:', err);
      setError(err.message);
      setLoading(false);
      
      // Show error alert
      Alert.alert(
        t('error') || 'Error',
        err.message || (language === 'es' 
          ? 'Error al actualizar la reserva' 
          : 'Failed to update reservation')
      );
      
      throw err;
    }
  };

  // Check if reservation can be edited
  const canEditReservation = (reservation) => {
    // Check if reservation exists
    if (!reservation) return false;
    
    // Check status
    const editableStatuses = ['pending', 'approved', 'confirmed'];
    if (!editableStatuses.includes(reservation.status)) return false;
    
    // Check if reservation is in the future
    const now = new Date();
    const startTime = new Date(reservation.startTime);
    if (startTime <= now) return false;
    
    return true;
  };

  // Check if amenity is a lounge
  const isLoungeAmenity = async (amenityId) => {
    try {
      const amenity = await amenityService.getAmenityById(amenityId);
      return amenity?.type === 'lounge' || 
             amenity?.name?.toLowerCase().includes('lounge');
    } catch (error) {
      console.error('Error checking amenity type:', error);
      return false;
    }
  };

  // Validate time change
  const validateTimeChange = (oldReservation, newStartTime, newEndTime) => {
    // Ensure new times are in the future
    const now = new Date();
    const start = new Date(newStartTime);
    
    if (start <= now) {
      return {
        isValid: false,
        error: language === 'es' 
          ? 'La nueva hora debe ser en el futuro'
          : 'The new time must be in the future'
      };
    }
    
    // Ensure end time is after start time
    const end = new Date(newEndTime);
    if (end <= start) {
      return {
        isValid: false,
        error: language === 'es'
          ? 'La hora de fin debe ser después de la hora de inicio'
          : 'End time must be after start time'
      };
    }
    
    // Check if duration is reasonable (max 8 hours)
    const durationMs = end - start;
    const maxDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    
    if (durationMs > maxDuration) {
      return {
        isValid: false,
        error: language === 'es'
          ? 'La duración máxima es de 8 horas'
          : 'Maximum duration is 8 hours'
      };
    }
    
    return { isValid: true };
  };

  // Validate lounge-specific fields
  const validateLoungeFields = (visitorCount, maxCapacity = 20) => {
    const count = parseInt(visitorCount);
    
    if (isNaN(count) || count < 1) {
      return {
        isValid: false,
        error: language === 'es' 
          ? 'El número de visitantes debe ser al menos 1' 
          : 'Number of visitors must be at least 1'
      };
    }
    
    if (count > maxCapacity) {
      return {
        isValid: false,
        error: language === 'es' 
          ? `Máximo ${maxCapacity} visitantes permitidos` 
          : `Maximum ${maxCapacity} visitors allowed`
      };
    }
    
    return { isValid: true };
  };

  // Check if changes were made
  const hasChanges = (original, updated) => {
    // Check basic fields
    if (
      original.startTime !== updated.startTime ||
      original.endTime !== updated.endTime ||
      (original.notes || '') !== (updated.notes || '')
    ) {
      return true;
    }
    
    // Check lounge-specific fields if applicable
    if (updated.visitorCount !== undefined || updated.willUseGrill !== undefined) {
      if (
        (original.visitorCount || 1) !== (updated.visitorCount || 1) ||
        (original.willUseGrill || false) !== (updated.willUseGrill || false)
      ) {
        return true;
      }
    }
    
    return false;
  };

  // Format changes for display
  const formatChanges = (original, updated) => {
    const changes = [];
    
    // Time changes
    if (original.startTime !== updated.startTime || original.endTime !== updated.endTime) {
      changes.push({
        field: language === 'es' ? 'Horario' : 'Time',
        oldValue: `${formatTime(original.startTime)} - ${formatTime(original.endTime)}`,
        newValue: `${formatTime(updated.startTime)} - ${formatTime(updated.endTime)}`
      });
    }
    
    // Visitor count changes
    if (updated.visitorCount !== undefined && 
        (original.visitorCount || 1) !== updated.visitorCount) {
      changes.push({
        field: language === 'es' ? 'Visitantes' : 'Visitors',
        oldValue: (original.visitorCount || 1).toString(),
        newValue: updated.visitorCount.toString()
      });
    }
    
    // Grill usage changes
    if (updated.willUseGrill !== undefined && 
        (original.willUseGrill || false) !== updated.willUseGrill) {
      changes.push({
        field: language === 'es' ? 'Uso de parrilla' : 'Grill usage',
        oldValue: original.willUseGrill 
          ? (language === 'es' ? 'Sí' : 'Yes')
          : (language === 'es' ? 'No' : 'No'),
        newValue: updated.willUseGrill
          ? (language === 'es' ? 'Sí' : 'Yes')
          : (language === 'es' ? 'No' : 'No')
      });
    }
    
    // Notes changes
    if ((original.notes || '') !== (updated.notes || '')) {
      changes.push({
        field: language === 'es' ? 'Notas' : 'Notes',
        oldValue: original.notes || (language === 'es' ? 'Sin notas' : 'No notes'),
        newValue: updated.notes || (language === 'es' ? 'Sin notas' : 'No notes')
      });
    }
    
    return changes;
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Prepare update data with proper validation
  const prepareUpdateData = (reservation, changes) => {
    const updateData = {
      amenityId: reservation.amenityId, // Keep same amenity
      startTime: changes.startTime || reservation.startTime,
      endTime: changes.endTime || reservation.endTime,
      notes: changes.notes !== undefined ? changes.notes : reservation.notes,
      specialRequests: changes.notes !== undefined ? changes.notes : reservation.notes
    };
    
    // Add lounge-specific fields if applicable
    if (changes.visitorCount !== undefined) {
      updateData.visitorCount = parseInt(changes.visitorCount);
    }
    
    if (changes.willUseGrill !== undefined) {
      updateData.willUseGrill = changes.willUseGrill;
    }
    
    return updateData;
  };

  return {
    updateReservation,
    canEditReservation,
    isLoungeAmenity,
    validateTimeChange,
    validateLoungeFields,
    hasChanges,
    formatChanges,
    prepareUpdateData,
    loading,
    error
  };
};

export default useReservationEdit;