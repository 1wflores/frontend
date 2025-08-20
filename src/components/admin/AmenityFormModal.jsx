import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const AMENITY_TYPES = [
  { value: 'jacuzzi', label: 'Jacuzzi', icon: 'hot-tub' },
  { value: 'cold-tub', label: 'Cold Tub', icon: 'ac-unit' },
  { value: 'yoga-deck', label: 'Yoga Deck', icon: 'self-improvement' },
  { value: 'lounge', label: 'Lounge', icon: 'weekend' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export const AmenityFormModal = ({
  visible,
  onClose,
  onSubmit,
  amenity = null, // null for create, amenity object for edit
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'jacuzzi',
    description: '',
    capacity: '1',
    operatingHours: {
      start: '06:00',
      end: '22:00',
      days: [1, 2, 3, 4, 5, 6, 0], // Default to all days
    },
    autoApprovalRules: {
      maxDurationMinutes: 60,
      maxReservationsPerDay: 3,
    },
  });

  const [errors, setErrors] = useState({});

  const isEditing = amenity !== null;

  // Populate form with amenity data when editing
  useEffect(() => {
    if (amenity) {
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

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Capacity validation
    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
    }

    // Operating hours validation
    if (!formData.operatingHours.start || !formData.operatingHours.end) {
      newErrors.operatingHours = 'Operating hours are required';
    }

    // Days validation
    if (formData.operatingHours.days.length === 0) {
      newErrors.days = 'At least one operating day must be selected';
    }

    // Auto approval rules validation
    const maxDuration = parseInt(formData.autoApprovalRules.maxDurationMinutes);
    if (isNaN(maxDuration) || maxDuration < 15 || maxDuration > 480) {
      newErrors.maxDuration = 'Max duration must be between 15 and 480 minutes';
    }

    const maxReservations = parseInt(formData.autoApprovalRules.maxReservationsPerDay);
    if (isNaN(maxReservations) || maxReservations < 1 || maxReservations > 10) {
      newErrors.maxReservations = 'Max reservations must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
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
      <Text style={styles.selectorLabel}>Amenity Type</Text>
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
              color={formData.type === type.value ? COLORS.primary : COLORS.text.secondary} 
            />
            <Text style={[
              styles.typeLabel,
              formData.type === type.value && styles.selectedTypeLabel,
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDaySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Operating Days</Text>
      {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}
      <View style={styles.daysGrid}>
        {DAYS_OF_WEEK.map((day) => (
          <TouchableOpacity
            key={day.value}
            style={[
              styles.dayOption,
              formData.operatingHours.days.includes(day.value) && styles.selectedDay,
            ]}
            onPress={() => toggleDay(day.value)}
          >
            <Text style={[
              styles.dayLabel,
              formData.operatingHours.days.includes(day.value) && styles.selectedDayLabel,
            ]}>
              {day.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
          <Text style={styles.title}>
            {isEditing ? 'Edit Amenity' : 'Create Amenity'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Amenity Name"
              placeholder="e.g., Rooftop Jacuzzi"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              error={errors.name}
              style={styles.input}
            />

            {renderTypeSelector()}

            <Input
              label="Description (Optional)"
              placeholder="Brief description of the amenity..."
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Input
              label="Capacity"
              placeholder="Maximum number of people"
              value={formData.capacity}
              onChangeText={(value) => updateFormData('capacity', value)}
              keyboardType="numeric"
              error={errors.capacity}
              style={styles.input}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Operating Hours</Text>
            {errors.operatingHours && (
              <Text style={styles.errorText}>{errors.operatingHours}</Text>
            )}
            
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Input
                  label="Start Time"
                  placeholder="06:00"
                  value={formData.operatingHours.start}
                  onChangeText={(value) => updateOperatingHours('start', value)}
                />
              </View>
              <View style={styles.timeInput}>
                <Input
                  label="End Time"
                  placeholder="22:00"
                  value={formData.operatingHours.end}
                  onChangeText={(value) => updateOperatingHours('end', value)}
                />
              </View>
            </View>

            {renderDaySelector()}
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Auto-Approval Rules</Text>
            
            <Input
              label="Max Duration (minutes)"
              placeholder="60"
              value={formData.autoApprovalRules.maxDurationMinutes.toString()}
              onChangeText={(value) => updateAutoApprovalRules('maxDurationMinutes', parseInt(value) || 0)}
              keyboardType="numeric"
              error={errors.maxDuration}
              style={styles.input}
            />

            <Input
              label="Max Reservations Per Day"
              placeholder="3"
              value={formData.autoApprovalRules.maxReservationsPerDay.toString()}
              onChangeText={(value) => updateAutoApprovalRules('maxReservationsPerDay', parseInt(value) || 0)}
              keyboardType="numeric"
              error={errors.maxReservations}
              style={styles.input}
            />
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={handleClose}
            style={styles.footerButton}
          />
          <Button
            title={isEditing ? 'Update Amenity' : 'Create Amenity'}
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
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
  input: {
    marginBottom: SPACING.md,
  },
  selectorContainer: {
    marginBottom: SPACING.md,
  },
  selectorLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  selectedType: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  selectedTypeLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  timeInput: {
    flex: 1,
  },
  daysGrid: {
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
    backgroundColor: COLORS.background,
  },
  selectedDay: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  dayLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  selectedDayLabel: {
    color: COLORS.text.inverse,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
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
    marginTop: SPACING.xs / 2,
  },
});