// Updated LoginScreen.jsx with proper error handling and translation

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { ApiErrorTranslator } from '../../utils/apiErrorTranslator'; // ✅ Added proper error translation
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { t, language, changeLanguage } = useLanguage();

  const validateForm = () => {
    const newErrors = {};

    const usernameValidation = ValidationUtils.validateApartmentUsername(username);
    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.error;
    }

    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await login({ username: username.trim().toLowerCase(), password });
    } catch (error) {
      console.error('Login error:', error);
      
      // ✅ IMPROVED: Better error handling with proper translation
      let errorMessage = '';
      let errorTitle = t('auth.loginFailed');

      // Extract and translate the error message from the server
      if (error.response?.data?.message) {
        // Server provided a specific error message
        errorMessage = ApiErrorTranslator.translateError(error.response.data.message, language);
      } else if (error.response?.status === 401) {
        // Unauthorized - likely invalid credentials
        errorMessage = t('auth.invalidCredentials');
      } else if (error.response?.status >= 500) {
        // Server error
        errorMessage = t('errors.serverError');
      } else if (!error.response) {
        // Network error
        errorMessage = t('errors.networkError');
      } else {
        // Fallback to a generic error message
        errorMessage = t('errors.unknownError');
      }

      // ✅ IMPROVED: Better error dialog with proper styling
      Alert.alert(
        errorTitle,
        errorMessage,
        [
          { 
            text: t('common.ok'), 
            style: 'default'
          }
        ],
        { 
          cancelable: false 
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = async () => {
    const newLanguage = language === 'en' ? 'es' : 'en';
    await changeLanguage(newLanguage);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Language Toggle */}
        <View style={styles.languageToggle}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
            <Icon name="language" size={20} color={COLORS.primary} />
            <Text style={styles.languageText}>
              {language === 'en' ? 'Español' : 'English'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('auth.welcome')}
          </Text>
          <Text style={styles.subtitle}>
            {t('auth.loginSubtitle')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            placeholder={t('auth.usernamePlaceholder')}
            leftIcon="home"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder={t('auth.passwordPlaceholder')}
            leftIcon="lock"
            secureTextEntry
          />

          <Button
            title={t('auth.signIn')}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('auth.needHelp')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  languageToggle: {
    position: 'absolute',
    top: 50,
    right: SPACING.lg,
    zIndex: 1,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  languageText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
    marginTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: SPACING.xl,
  },
  loginButton: {
    marginTop: SPACING.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl * 2,
    paddingBottom: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default LoginScreen;