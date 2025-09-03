// src/components/admin/AmenityFormModal.jsx - ENHANCED to prevent lounge auto-approval

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const AMENITY_TYPES = [
  { value: 'jacuzzi', icon: 'hot_tub', label: { en: 'Jacuzzi', es: 'Jacuzzi' } },
  { value: 'cold-tub', icon: 'ac_unit', label: { en: 'Cold Tub', es: 'Tina Fría' } },
  { value: 'yoga-deck', icon: 'self_improvement', label: { en: 'Yoga Deck', es: 'Terraza de Yoga' } },
  { value: 'lounge', icon: 'weekend', label: { en: 'Community Lounge', es: 'Salón Comunitario' } },
];

const DAYS = [
  { value: 0, label: { en: 'Sunday', es: 'Domingo' }, short: { en: 'Sun', es: 'Dom' } },
  { value: 1, label: { en: 'Monday', es: 'Lunes' }, short: { en: 'Mon', es: 'Lun' } },
  { value: 2, label: { en: 'Tuesday', es: 'Martes' }, short: { en: 'Tue', es: 'Mar' } },
  { value: 3, label: { en: 'Wednesday', es: 'Miércoles' }, short: { en: 'Wed', es: 'Mié' } },
  { value: 4, label: { en: 'Thursday', es: 'Jueves' }, short: { en: 'Thu', es: 'Jue' } },
  { value: 5, label: { en: 'Friday', es: 'Viernes' }, short: { en: 'Fri', es: 'Vie' } },
  { value: 6, label: { en: 'Saturday', es: 'Sábado' }, short: { en: 'Sat', es: 'Sáb' } },
];

export const AmenityFormModal = ({
  visible,
  onClose,
  onSubmit,
  amenity = null,
  loading = false,
}) => {
  const { language, t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'jacuzzi',
    description: '',
    capacity: '1',
    operatingHours: {
      start: '06:00',
      end: '22:00',
      days: [1, 2, 3, 4, 5, 6, 0],
    },
    autoApprovalRules: {
      enabled: true, // NEW: Track if auto-approval is enabled
      maxDurationMinutes: 60,
      maxReservationsPerDay: 3,
    },
    requiresApproval: false, // NEW: Explicit approval requirement flag
  });

  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]); // NEW: Track configuration warnings

  // Helper function to check if current type is lounge
  const isLounge = formData.type === 'lounge';

  useEffect(() => {
    if (visible && amenity) {
      // Edit mode - populate form
      setFormData({
        name: amenity.name || '',
        type: amenity.type || 'jacuzzi',
        description: amenity.description || '',
        capacity: amenity.capacity?.toString() || '1',
        operatingHours: {
          start: amenity.operatingHours?.start || '06:00',
          end: amenity.operatingHours?.end || '22:00',
          days: amenity.operatingHours?.days || [1, 2, 3, 4, 5, 6, 0],
        },
        autoApprovalRules: {
          enabled: amenity.autoApprovalRules ? true : false,
          maxDurationMinutes: amenity.autoApprovalRules?.maxDurationMinutes || 60,
          maxReservationsPerDay: amenity.autoApprovalRules?.maxReservationsPerDay || 3,
        },
        requiresApproval: amenity.requiresApproval !== undefined ? amenity.requiresApproval : false,
      });
    } else {
      // Reset form for create
      setFormData({
        name: '',
        type: 'jacuzzi',
        description: '',
        capacity: '1',
        operatingHours: {
          start: '06:00',
          end: '22:00',
          days: [1, 2, 3, 4, 5, 6, 0],
        },
        autoApprovalRules: {
          enabled: true,
          maxDurationMinutes: 60,
          maxReservationsPerDay: 3,
        },
        requiresApproval: false,
      });
    }
    setErrors({});
    setWarnings([]);
  }, [amenity, visible]);

  // NEW: Update approval settings when type changes
  useEffect(() => {
    if (isLounge) {
      // **CRITICAL: Force lounge to always require approval**
      setFormData(prev => ({
        ...prev,
        requiresApproval: true,
        autoApprovalRules: {
          ...prev.autoApprovalRules,
          enabled: false // Disable auto-approval for lounge
        }
      }));
      
      // Set warning for lounge configuration
      setWarnings([
        language === 'es' 
          ? 'El Salón Comunitario siempre requiere aprobación del administrador y no puede tener auto-aprobación habilitada.'
          : 'Community Lounge always requires administrator approval and cannot have auto-approval enabled.'
      ]);
    } else {
      // Clear warnings for non-lounge amenities
      setWarnings([]);
    }
  }, [isLounge, language]);

  const validateForm = () => {
    const newErrors = {};
    const newWarnings = [];

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired') || (language === 'es' ? 'El nombre es requerido' : 'Name is required');
    } else if (formData.name.length > 100) {
      newErrors.name = language === 'es' 
        ? 'El nombre debe tener menos de 100 caracteres'
        : 'Name must be less than 100 characters';
    }

    // Capacity validation
    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 100) {
      newErrors.capacity = t('capacityBetween') || (language === 'es' 
        ? 'La capacidad debe estar entre 1 y 100'
        : 'Capacity must be between 1 and 100');
    }

    // Operating hours validation
    if (!formData.operatingHours.start || !formData.operatingHours.end) {
      newErrors.operatingHours = t('operatingHoursRequired') || (language === 'es' 
        ? 'Los horarios de operación son requeridos'
        : 'Operating hours are required');
    }

    // Days validation
    if (formData.operatingHours.days.length === 0) {
      newErrors.days = t('atLeastOneDay') || (language === 'es' 
        ? 'Debe seleccionar al menos un día'
        : 'Must select at least one day');
    }

    // **NEW: Lounge-specific validation**
    if (isLounge) {
      // Ensure lounge always requires approval
      if (!formData.requiresApproval) {
        newErrors.requiresApproval = language === 'es' 
          ? 'El Salón Comunitario debe requerir aprobación'
          : 'Community Lounge must require approval';
      }

      // Ensure lounge doesn't have auto-approval enabled
      if (formData.autoApprovalRules.enabled) {
        newErrors.autoApproval = language === 'es' 
          ? 'El Salón Comunitario no puede tener auto-aprobación habilitada'
          : 'Community Lounge cannot have auto-approval enabled';
      }

      // Warn about recommended max duration
      const maxDuration = parseInt(formData.autoApprovalRules.maxDurationMinutes);
      if (maxDuration > 240) {
        newWarnings.push(language === 'es' 
          ? 'Duración máxima recomendada para el Salón Comunitario es de 4 horas (240 minutos)'
          : 'Recommended maximum duration for Community Lounge is 4 hours (240 minutes)');
      }

      // Recommend capacity for lounge
      if (capacity < 15 || capacity > 25) {
        newWarnings.push(language === 'es' 
          ? 'Capacidad recomendada para el Salón Comunitario es entre 15-25 personas'
          : 'Recommended capacity for Community Lounge is 15-25 people');
      }
    } else {
      // Auto approval rules validation for non-lounge amenities
      if (formData.autoApprovalRules.enabled) {
        const maxDuration = parseInt(formData.autoApprovalRules.maxDurationMinutes);
        if (isNaN(maxDuration) || maxDuration < 15 || maxDuration > 480) {
          newErrors.maxDuration = t('durationBetween') || (language === 'es' 
            ? 'La duración debe estar entre 15 y 480 minutos'
            : 'Duration must be between 15 and 480 minutes');
        }

        const maxReservations = parseInt(formData.autoApprovalRules.maxReservationsPerDay);
        if (isNaN(maxReservations) || maxReservations < 1 || maxReservations > 10) {
          newErrors.maxReservations = language === 'es'
            ? 'Las reservas máximas por día deben estar entre 1 y 10'
            : 'Max reservations per day must be between 1 and 10';
        }
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert(
        t('validationError') || (language === 'es' ? 'Error de Validación' : 'Validation Error'),
        language === 'es' 
          ? 'Por favor corrige los errores antes de continuar'
          : 'Please fix the errors before continuing'
      );
      return;
    }

    // **CRITICAL: Final validation for lounge settings**
    let finalFormData = { ...formData };
    
    if (isLounge) {
      // Force lounge configuration
      finalFormData.requiresApproval = true;
      finalFormData.autoApprovalRules = null; // Remove auto-approval rules entirely for lounge
      
      console.log('🏛️ Forcing lounge configuration:', {
        requiresApproval: true,
        autoApprovalRules: null
      });
    } else {
      // For non-lounge amenities, prepare auto-approval rules if enabled
      if (finalFormData.autoApprovalRules.enabled) {
        finalFormData.autoApprovalRules = {
          maxDurationMinutes: parseInt(finalFormData.autoApprovalRules.maxDurationMinutes),
          maxReservationsPerDay: parseInt(finalFormData.autoApprovalRules.maxReservationsPerDay),
        };
      } else {
        finalFormData.autoApprovalRules = null;
        finalFormData.requiresApproval = true;
      }
    }

    // Clean up the enabled flag (it's not part of the API)
    if (finalFormData.autoApprovalRules) {
      delete finalFormData.autoApprovalRules.enabled;
    }

    // Convert capacity to number
    finalFormData.capacity = parseInt(finalFormData.capacity);

    console.log('📝 Submitting amenity form with final data:', finalFormData);
    onSubmit(finalFormData);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const toggleDay = (dayValue) => {
    const currentDays = formData.operatingHours.days;
    const updatedDays = currentDays.includes(dayValue)
      ? currentDays.filter(day => day !== dayValue)
      : [...currentDays, dayValue].sort((a, b) => a - b);
    
    updateNestedFormData('operatingHours', 'days', updatedDays);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.title}>
            {amenity 
              ? (t('editAmenity') || (language === 'es' ? 'Editar Amenidad' : 'Edit Amenity'))
              : (t('createAmenity') || (language === 'es' ? 'Crear Amenidad' : 'Create Amenity'))
            }
          </Text>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Warnings Section */}
          {warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              {warnings.map((warning, index) => (
                <View key={index} style={styles.warningItem}>
                  <Icon name="warning" size={20} color={COLORS.warning} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'es' ? 'Información Básica' : 'Basic Information'}
            </Text>
            
            <Input
              label={t('amenityName') || (language === 'es' ? 'Nombre de la Amenidad' : 'Amenity Name')}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder={language === 'es' ? 'Ingrese el nombre' : 'Enter name'}
              error={errors.name}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t('amenityType') || (language === 'es' ? 'Tipo de Amenidad' : 'Amenity Type')}
              </Text>
              <View style={styles.typeSelector}>
                {AMENITY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      formData.type === type.value && styles.selectedTypeOption,
                      type.value === 'lounge' && styles.loungeTypeOption
                    ]}
                    onPress={() => updateFormData('type', type.value)}
                  >
                    <Icon 
                      name={type.icon} 
                      size={20} 
                      color={formData.type === type.value ? COLORS.white : COLORS.text.secondary} 
                    />
                    <Text style={[
                      styles.typeLabel,
                      formData.type === type.value && styles.selectedTypeLabel
                    ]}>
                      {type.label[language]}
                    </Text>
                    {type.value === 'lounge' && (
                      <View style={styles.specialBadge}>
                        <Text style={styles.specialBadgeText}>
                          {language === 'es' ? 'ESPECIAL' : 'SPECIAL'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label={t('description') || (language === 'es' ? 'Descripción' : 'Description')}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder={language === 'es' ? 'Descripción de la amenidad' : 'Amenity description'}
              multiline
              numberOfLines={3}
            />

            <Input
              label={t('capacity') || (language === 'es' ? 'Capacidad' : 'Capacity')}
              value={formData.capacity}
              onChangeText={(value) => updateFormData('capacity', value)}
              placeholder="1"
              keyboardType="numeric"
              error={errors.capacity}
            />
          </View>

          {/* Operating Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('operatingHours') || (language === 'es' ? 'Horarios de Operación' : 'Operating Hours')}
            </Text>

            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Input
                  label={language === 'es' ? 'Hora de Inicio' : 'Start Time'}
                  value={formData.operatingHours.start}
                  onChangeText={(value) => updateNestedFormData('operatingHours', 'start', value)}
                  placeholder="08:00"
                />
              </View>
              <View style={styles.timeInput}>
                <Input
                  label={language === 'es' ? 'Hora de Fin' : 'End Time'}
                  value={formData.operatingHours.end}
                  onChangeText={(value) => updateNestedFormData('operatingHours', 'end', value)}
                  placeholder="22:00"
                />
              </View>
            </View>

            {errors.operatingHours && (
              <Text style={styles.errorText}>{errors.operatingHours}</Text>
            )}

            <Text style={styles.label}>
              {language === 'es' ? 'Días Disponibles' : 'Available Days'}
            </Text>
            <View style={styles.daysSelector}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayOption,
                    formData.operatingHours.days.includes(day.value) && styles.selectedDayOption
                  ]}
                  onPress={() => toggleDay(day.value)}
                >
                  <Text style={[
                    styles.dayText,
                    formData.operatingHours.days.includes(day.value) && styles.selectedDayText
                  ]}>
                    {day.short[language]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {errors.days && (
              <Text style={styles.errorText}>{errors.days}</Text>
            )}
          </View>

          {/* Approval Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'es' ? 'Configuración de Aprobación' : 'Approval Settings'}
            </Text>

            {/* **NEW: Special notice for lounge** */}
            {isLounge && (
              <View style={styles.loungeNotice}>
                <Icon name="admin_panel_settings" size={24} color={COLORS.warning} />
                <View style={styles.loungeNoticeContent}>
                  <Text style={styles.loungeNoticeTitle}>
                    {language === 'es' 
                      ? 'Configuración Especial del Salón' 
                      : 'Special Lounge Configuration'}
                  </Text>
                  <Text style={styles.loungeNoticeText}>
                    {language === 'es' 
                      ? 'El Salón Comunitario siempre requiere aprobación del administrador. La auto-aprobación está deshabilitada para asegurar un uso apropiado.'
                      : 'The Community Lounge always requires administrator approval. Auto-approval is disabled to ensure appropriate usage.'}
                  </Text>
                </View>
              </View>
            )}

            {/* Manual Approval Toggle */}
            <View style={styles.switchContainer}>
              <View style={styles.switchLabel}>
                <Text style={styles.label}>
                  {language === 'es' ? 'Requiere Aprobación Manual' : 'Requires Manual Approval'}
                </Text>
                <Text style={styles.helperText}>
                  {language === 'es' 
                    ? 'Las reservas necesitarán aprobación del administrador'
                    : 'Reservations will need administrator approval'}
                </Text>
              </View>
              <Switch
                value={formData.requiresApproval}
                onValueChange={(value) => {
                  if (isLounge) {
                    // Don't allow disabling approval for lounge
                    return;
                  }
                  updateFormData('requiresApproval', value);
                  if (value) {
                    // If enabling manual approval, disable auto-approval
                    updateNestedFormData('autoApprovalRules', 'enabled', false);
                  }
                }}
                disabled={isLounge} // Disable toggle for lounge
                trackColor={{ 
                  false: COLORS.text.secondary, 
                  true: isLounge ? COLORS.warning : COLORS.success 
                }}
                thumbColor={formData.requiresApproval ? COLORS.white : COLORS.white}
              />
            </View>

            {errors.requiresApproval && (
              <Text style={styles.errorText}>{errors.requiresApproval}</Text>
            )}

            {/* Auto-Approval Settings */}
            {!isLounge && (
              <>
                <View style={styles.switchContainer}>
                  <View style={styles.switchLabel}>
                    <Text style={styles.label}>
                      {language === 'es' ? 'Habilitar Auto-aprobación' : 'Enable Auto-approval'}
                    </Text>
                    <Text style={styles.helperText}>
                      {language === 'es' 
                        ? 'Aprobar reservas automáticamente si cumplen los criterios'
                        : 'Automatically approve reservations that meet criteria'}
                    </Text>
                  </View>
                  <Switch
                    value={formData.autoApprovalRules.enabled}
                    onValueChange={(value) => {
                      updateNestedFormData('autoApprovalRules', 'enabled', value);
                      if (value) {
                        // If enabling auto-approval, disable manual approval
                        updateFormData('requiresApproval', false);
                      }
                    }}
                    trackColor={{ false: COLORS.text.secondary, true: COLORS.primary }}
                  />
                </View>

                {formData.autoApprovalRules.enabled && (
                  <View style={styles.autoApprovalSettings}>
                    <Input
                      label={language === 'es' ? 'Duración Máxima (minutos)' : 'Maximum Duration (minutes)'}
                      value={formData.autoApprovalRules.maxDurationMinutes.toString()}
                      onChangeText={(value) => updateNestedFormData('autoApprovalRules', 'maxDurationMinutes', parseInt(value) || 0)}
                      placeholder="60"
                      keyboardType="numeric"
                      error={errors.maxDuration}
                    />

                    <Input
                      label={language === 'es' ? 'Máx. Reservas por Día' : 'Max Reservations per Day'}
                      value={formData.autoApprovalRules.maxReservationsPerDay.toString()}
                      onChangeText={(value) => updateNestedFormData('autoApprovalRules', 'maxReservationsPerDay', parseInt(value) || 0)}
                      placeholder="3"
                      keyboardType="numeric"
                      error={errors.maxReservations}
                    />
                  </View>
                )}

                {errors.autoApproval && (
                  <Text style={styles.errorText}>{errors.autoApproval}</Text>
                )}
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={t('cancel') || (language === 'es' ? 'Cancelar' : 'Cancel')}
            onPress={onClose}
            variant="secondary"
            style={styles.footerButton}
          />
          
          <Button
            title={amenity 
              ? (t('updateAmenity') || (language === 'es' ? 'Actualizar' : 'Update'))
              : (t('createAmenity') || (language === 'es' ? 'Crear' : 'Create'))
            }
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.footerButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border?.light || '#E0E0E0',
    backgroundColor: COLORS.surface,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40, // Same width as close button to center title
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  warningsContainer: {
    marginBottom: SPACING.md,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.background?.error || '#FFEBEE',
    borderRadius: 8,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeOption: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border?.light || '#E0E0E0',
    position: 'relative',
  },
  selectedTypeOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  loungeTypeOption: {
    borderColor: COLORS.warning,
    borderWidth: 2,
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  selectedTypeLabel: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  specialBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.warning,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  specialBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  timeInput: {
    flex: 1,
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  dayOption: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border?.light || '#E0E0E0',
  },
  selectedDayOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  loungeNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  loungeNoticeContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  loungeNoticeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  loungeNoticeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  switchLabel: {
    flex: 1,
    marginRight: SPACING.md,
  },
  autoApprovalSettings: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border?.light || '#E0E0E0',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default AmenityFormModal;