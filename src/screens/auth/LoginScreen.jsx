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
// ✅ FIXED: Correct import path
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
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
      Alert.alert(
        t('loginFailed'),
        error.response?.data?.error || t('invalidCredentials'),
        [{ text: t('ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
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
            {language === 'es' ? 'Bienvenido' : 'Welcome'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'es' 
              ? 'Inicia sesión para reservar amenidades'
              : 'Sign in to book amenities'}
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Input
            label={language === 'es' ? 'Usuario' : 'Username'}
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={language === 'es' ? 'apartment123' : 'apartment123'}
            leftIcon="person"
          />

          <Input
            label={language === 'es' ? 'Contraseña' : 'Password'}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            placeholder={language === 'es' ? 'Tu contraseña' : 'Your password'}
            leftIcon="lock"
          />

          <Button
            title={language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
        </View>

        {/* Quick Login Section for Testing */}
        {__DEV__ && (
          <View style={styles.quickLogin}>
            <Text style={styles.quickLoginTitle}>
              {language === 'es' ? 'Acceso Rápido (Solo Desarrollo)' : 'Quick Login (Dev Only)'}
            </Text>
            <View style={styles.quickLoginButtons}>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => handleQuickLogin('admin', 'Admin123!')}
              >
                <Text style={styles.quickButtonText}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => handleQuickLogin('apartment204', 'Resident123!')}
              >
                <Text style={styles.quickButtonText}>
                  {language === 'es' ? 'Residente' : 'Resident'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {language === 'es' 
              ? '¿Necesitas ayuda? Contacta al administrador'
              : 'Need help? Contact your administrator'}
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
  quickLogin: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  quickLoginTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.warning,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  quickLoginButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.warning,
    borderRadius: 6,
    minWidth: 80,
  },
  quickButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
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