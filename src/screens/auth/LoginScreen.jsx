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
import { useAuth } from '../../contexts/AuthContext';
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

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🏢</Text>
          </View>
          <Text style={styles.title}>{t('loginTitle')}</Text>
          <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('apartmentUsername')}
            placeholder="e.g., apartment204"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            error={errors.username}
            leftIcon="home"
          />

          <Input
            label={t('password')}
            placeholder={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
            leftIcon="lock"
          />

          <Button
            title={t('signIn')}
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />
        </View>

        {__DEV__ && (
          <View style={styles.quickLogin}>
            <Text style={styles.quickLoginTitle}>Quick Login (Development)</Text>
            <View style={styles.quickLoginButtons}>
              <Button
                title="Admin"
                variant="outline"
                size="small"
                onPress={() => handleQuickLogin('apartment000', 'Eptc-1794')}
                style={styles.quickLoginButton}
              />
              <Button
                title="Apt 101"
                variant="outline"
                size="small"
                onPress={() => handleQuickLogin('apartment101', 'Resident123!')}
                style={styles.quickLoginButton}
              />
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {language === 'en' 
              ? 'Password can only be changed by your building administrator'
              : 'La contraseña solo puede ser cambiada por el administrador del edificio'
            }
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
    padding: SPACING.lg,
  },
  languageToggle: {
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  languageText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
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
    marginTop: SPACING.sm,
  },
  quickLogin: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  quickLoginTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  quickLoginButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickLoginButton: {
    minWidth: 80,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;