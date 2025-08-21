import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { apiClient } from '../../services/apiClient';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const UserCreationModal = ({ visible, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'resident'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'resident'
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.role === 'resident' && !formData.username.match(/^apartment\d+$/i)) {
      newErrors.username = 'Resident username must be in format: apartment + number (e.g., apartment204)';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation
    const passwordValidation = ValidationUtils.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const userData = {
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        role: formData.role
      };

      const response = await apiClient.post('/api/auth/users', userData);

      if (response.data.success) {
        Alert.alert(
          'Success',
          `User "${userData.username}" created successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                onUserCreated(response.data.data.user);
                handleClose();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Create user error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));
    setShowPassword(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const roleOptions = [
    { value: 'resident', label: 'Resident', icon: 'home' },
    { value: 'admin', label: 'Administrator', icon: 'admin-panel-settings' }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New User</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.formCard}>
            {/* Username Input */}
            <Input
              label="Username"
              placeholder="Enter username"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="person"
            />

            {/* Role Selection */}
            <Text style={styles.sectionLabel}>User Role</Text>
            <View style={styles.roleContainer}>
              {roleOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.roleButton,
                    formData.role === option.value && styles.selectedRoleButton
                  ]}
                  onPress={() => handleInputChange('role', option.value)}
                >
                  <Icon
                    name={option.icon}
                    size={24}
                    color={formData.role === option.value ? COLORS.text.inverse : COLORS.text.secondary}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === option.value && styles.selectedRoleText
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Username Format Helper */}
            {formData.role === 'resident' && (
              <View style={styles.helperContainer}>
                <Icon name="info" size={16} color={COLORS.text.secondary} />
                <Text style={styles.helperText}>
                  Resident usernames must be in format: apartment + number (e.g., apartment204)
                </Text>
              </View>
            )}

            {/* Password Input */}
            <View style={styles.passwordSection}>
              <Input
                label="Password"
                placeholder="Enter password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={errors.password}
                secureTextEntry={!showPassword}
                leftIcon="lock"
                rightIcon={showPassword ? 'visibility-off' : 'visibility'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
              
              <Button
                title="Generate Strong Password"
                onPress={generateStrongPassword}
                variant="outline"
                size="small"
                leftIcon="auto-fix-high"
                style={styles.generateButton}
              />
            </View>

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock"
            />

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <Text style={styles.requirementText}>• At least 8 characters</Text>
              <Text style={styles.requirementText}>• Include uppercase and lowercase letters</Text>
              <Text style={styles.requirementText}>• Include at least one number</Text>
              <Text style={styles.requirementText}>• Include at least one special character</Text>
            </View>
          </Card>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <Button
            title="Cancel"
            onPress={handleClose}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title="Create User"
            onPress={handleCreateUser}
            loading={loading}
            style={styles.footerButton}
            leftIcon="person-add"
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
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
  formCard: {
    padding: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  selectedRoleButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  roleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  selectedRoleText: {
    color: COLORS.text.inverse,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.info + '10',
    borderRadius: 6,
  },
  helperText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
    flex: 1,
    lineHeight: 18,
  },
  passwordSection: {
    marginTop: SPACING.sm,
  },
  generateButton: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  requirementsContainer: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  requirementsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  requirementText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});