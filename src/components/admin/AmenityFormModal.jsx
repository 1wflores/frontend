import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useLanguage } from '../../contexts/LanguageContext'; // ✅ FIXED: Added language hook
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
  const { language, t } = useLanguage(); // ✅ FIXED: Using language hook
  
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
      maxDurationMinutes: 60,
      maxReservationsPerDay: 3,
    },
  });

  const [errors, setErrors] = useState({});

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
          maxDurationMinutes: amenity.autoApprovalRules?.maxDurationMinutes || 60,
          maxReservationsPerDay: amenity.autoApprovalRules?.maxReservationsPerDay || 3,
        },
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
          maxDurationMinutes: 60,
          maxReservationsPerDay: 3,
        },
      });
    }
    setErrors({});
  }, [amenity, visible]);

  const validateForm = () => {
    const newErrors = {};

    // ✅ FIXED: Using translated validation messages
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    } else if (formData.name.length > 100) {
      newErrors.name = language === 'es' 
        ? 'El nombre debe tener menos de 100 caracteres'
        : 'Name must be less than 100 characters';
    }

    // Capacity validation
    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 100) {
      newErrors.capacity = t('capacityBetween');
    }

    // Operating hours validation
    if (!formData.operatingHours.start || !formData.operatingHours.end) {
      newErrors.operatingHours = t('operatingHoursRequired');
    }

    // Days validation
    if (formData.operatingHours.days.length === 0) {
      newErrors.days = t('atLeastOneDay');
    }

    // Auto approval rules validation
    const maxDuration = parseInt(formData.autoApprovalRules.maxDurationMinutes);
    if (isNaN(maxDuration) || maxDuration < 15 || maxDuration > 480) {
      newErrors.maxDuration = t('durationBetween');
    }

    const maxReservations = parseInt(formData.autoApprovalRules.maxReservationsPerDay);
    if (isNaN(maxReservations) || maxReservations < 1 || maxReservations > 10) {
      newErrors.maxReservations = language === 'es'
        ? 'Las reservas máximas deben estar entre 1 y 10'
        : 'Max reservations must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // ✅ FIXED: Using translated alert messages
      Alert.alert(t('validationError'), t('pleaseFix'));
      return;
    }

    const submitData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      autoApprovalRules: {
        maxDurationMinutes: parseInt(formData.autoApprovalRules.maxDurationMinutes),
        maxReservationsPerDay: parseInt(formData.autoApprovalRules.maxReservationsPerDay),
      },
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateOperatingHours = (field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [field]: value,
      },
    }));
  };

  const updateAutoApprovalRules = (field, value) => {
    setFormData(prev => ({
      ...prev,
      autoApprovalRules: {
        ...prev.autoApprovalRules,
        [field]: value,
      },
    }));
  };

  const toggleDay = (dayValue) => {
    const currentDays = formData.operatingHours.days;
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue].sort();
    
    updateOperatingHours('days', newDays);
  };

  const renderTypeSelector = () => (
    <View style={styles.selectorContainer}>
      {/* ✅ FIXED: Using translated label */}
      <Text style={styles.selectorLabel}>{t('amenityType')}</Text>
      <View style={styles.typeGrid}>
        {AMENITY_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeOption,
              formData.type === type.value && styles.selectedType,
            ]}
            onPress={() => updateFormData('type', type.value)}
          >
            <Icon 
              name={type.icon} 
              size={24} 
              color={formData.type === type.value ? COLORS.white : COLORS.text.primary} 
            />
            {/* ✅ FIXED: Using translated type labels */}
            <Text style={[
              styles.typeLabel,
              formData.type === type.value && styles.selectedTypeLabel,
            ]}>
              {type.label[language]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDaySelector = () => (
    <View style={styles.selectorContainer}>
      {/* ✅ FIXED: Using translated label */}
      <Text style={styles.selectorLabel}>
        {language === 'es' ? 'Días de Operación' : 'Operating Days'}
      </Text>
      <View style={styles.dayGrid}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day.value}
            style={[
              styles.dayOption,
              formData.operatingHours.days.includes(day.value) && styles.selectedDay,
            ]}
            onPress={() => toggleDay(day.value)}
          >
            {/* ✅ FIXED: Using translated day labels */}
            <Text style={[
              styles.dayLabel,
              formData.operatingHours.days.includes(day.value) && styles.selectedDayLabel,
            ]}>
              {day.short[language]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          {/* ✅ FIXED: Using translated title */}
          <Text style={styles.title}>
            {amenity ? t('edit') : t('create')} {t('amenity')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* ✅ FIXED: All form labels now use translations */}
          <Input
            label={t('amenityName')}
            placeholder={language === 'es' ? 'Ej: Jacuzzi Principal' : 'e.g., Main Jacuzzi'}
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            error={errors.name}
          />

          {renderTypeSelector()}

          <Input
            label={t('description')}
            placeholder={language === 'es' 
              ? 'Descripción opcional de la amenidad'
              : 'Optional amenity description'
            }
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            multiline
            numberOfLines={3}
          />

          <Input
            label={t('capacity')}
            placeholder="1"
            value={formData.capacity}
            onChangeText={(value) => updateFormData('capacity', value)}
            keyboardType="numeric"
            error={errors.capacity}
          />

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('operatingHours')}</Text>
            <View style={styles.timeContainer}>
              <Input
                label={language === 'es' ? 'Hora de Inicio' : 'Start Time'}
                placeholder="06:00"
                value={formData.operatingHours.start}
                onChangeText={(value) => updateOperatingHours('start', value)}
                style={styles.timeInput}
              />
              <Input
                label={language === 'es' ? 'Hora de Fin' : 'End Time'}
                placeholder="22:00"
                value={formData.operatingHours.end}
                onChangeText={(value) => updateOperatingHours('end', value)}
                style={styles.timeInput}
              />
            </View>
            {errors.operatingHours && <Text style={styles.errorText}>{errors.operatingHours}</Text>}
          </View>

          {renderDaySelector()}

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('autoApprovalRules')}</Text>
            <Input
              label={`${t('maxDuration')} (${t('minutes')})`}
              placeholder="60"
              value={formData.autoApprovalRules.maxDurationMinutes.toString()}
              onChangeText={(value) => updateAutoApprovalRules('maxDurationMinutes', value)}
              keyboardType="numeric"
              error={errors.maxDuration}
            />
            <Input
              label={t('maxReservationsPerDay')}
              placeholder="3"
              value={formData.autoApprovalRules.maxReservationsPerDay.toString()}
              onChangeText={(value) => updateAutoApprovalRules('maxReservationsPerDay', value)}
              keyboardType="numeric"
              error={errors.maxReservations}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={t('cancel')}
            variant="outline"
            onPress={handleClose}
            style={styles.footerButton}
          />
          <Button
            title={amenity ? t('update') : t('create')}
            onPress={handleSubmit}
            loading={loading}
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
    borderBottomColor: COLORS.border,
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
    width: 32,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  selectorContainer: {
    marginBottom: SPACING.lg,
  },
  selectorLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  selectedTypeLabel: {
    color: COLORS.white,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  dayOption: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
  },
  selectedDayLabel: {
    color: COLORS.white,
  },
  sectionContainer: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  timeInput: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  footerButton: {
    flex: 1,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});