import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { DateUtils } from '../../utils/dateUtils';
import { ValidationUtils } from '../../utils/validationUtils';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const { language, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLanguageToggle = async () => {
    try {
      const newLanguage = language === 'en' ? 'es' : 'en';
      await changeLanguage(newLanguage);
    } catch (error) {
      Alert.alert(
        t('error'),
        language === 'es' 
          ? 'Error al cambiar idioma. Por favor intente de nuevo.'
          : 'Error changing language. Please try again.'
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'es' ? 'Cerrar Sesión' : 'Sign Out',
      language === 'es' ? '¿Está seguro de que desea cerrar sesión?' : 'Are you sure you want to sign out?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: language === 'es' ? 'Cerrar Sesión' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logout();
            } catch (error) {
              Alert.alert(
                t('error'),
                language === 'es' 
                  ? 'Error al cerrar sesión. Por favor intente de nuevo.'
                  : 'Error signing out. Please try again.'
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      language === 'es' ? 'Contactar Soporte' : 'Contact Support',
      language === 'es' 
        ? 'Por favor contacte al administrador del edificio para soporte técnico o cambios de contraseña.'
        : 'Please contact your building administrator for technical support or password changes.',
      [{ text: t('ok') }]
    );
  };

  const handleReservationHistory = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Reservations' } }],
    });
  };

  const handleBookAmenities = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Amenities' } }],
    });
  };

  // Extract apartment number
  const getApartmentNumber = () => {
    return ValidationUtils.extractApartmentNumber(user?.username) || 
           (language === 'es' ? 'Desconocido' : 'Unknown');
  };

  // Get user role display
  const getRoleDisplay = () => {
    if (user?.role === 'admin') {
      return language === 'es' ? 'Administrador' : 'Administrator';
    }
    return language === 'es' ? 'Residente' : 'Resident';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={48} color={COLORS.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {language === 'es' ? 'Apartamento' : 'Apartment'} {getApartmentNumber()}
            </Text>
            <Text style={styles.profileRole}>
              {getRoleDisplay()}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="home" size={20} color={COLORS.text.secondary} />
          <Text style={styles.infoLabel}>
            {language === 'es' ? 'Usuario' : 'Username'}
          </Text>
          <Text style={styles.infoValue}>
            {user?.username || (language === 'es' ? 'No disponible' : 'Not available')}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="security" size={20} color={COLORS.text.secondary} />
          <Text style={styles.infoLabel}>
            {language === 'es' ? 'Rol' : 'Role'}
          </Text>
          <Text style={styles.infoValue}>
            {getRoleDisplay()}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="calendar_today" size={20} color={COLORS.text.secondary} />
          <Text style={styles.infoLabel}>
            {language === 'es' ? 'Miembro Desde' : 'Member Since'}
          </Text>
          <Text style={styles.infoValue}>
            {user?.createdAt ? DateUtils.formatDate(user.createdAt, language) : 
             (language === 'es' ? 'No disponible' : 'Not available')}
          </Text>
        </View>
        
        {user?.lastLogin && (
          <View style={styles.infoRow}>
            <Icon name="access_time" size={20} color={COLORS.text.secondary} />
            <Text style={styles.infoLabel}>
              {language === 'es' ? 'Último Acceso' : 'Last Login'}
            </Text>
            <Text style={styles.infoValue}>
              {DateUtils.formatDateTime(user.lastLogin, language)}
            </Text>
          </View>
        )}
      </Card>

      {/* Language Settings */}
      <Card style={styles.settingsCard}>
        <Text style={styles.cardTitle}>
          {language === 'es' ? 'Configuración de Idioma' : 'Language Settings'}
        </Text>
        
        <TouchableOpacity style={styles.languageRow} onPress={handleLanguageToggle}>
          <Icon name="language" size={24} color={COLORS.primary} />
          <View style={styles.languageContent}>
            <Text style={styles.languageTitle}>
              {language === 'es' ? 'Idioma de la Aplicación' : 'App Language'}
            </Text>
            <Text style={styles.languageSubtitle}>
              {language === 'es' ? 'Cambiar entre Español e Inglés' : 'Switch between Spanish and English'}
            </Text>
          </View>
          <View style={styles.languageToggle}>
            <Text style={styles.currentLanguage}>
              {language === 'es' ? 'Español' : 'English'}
            </Text>
            <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
          </View>
        </TouchableOpacity>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.cardTitle}>
          {language === 'es' ? 'Acciones Rápidas' : 'Quick Actions'}
        </Text>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleReservationHistory}>
          <Icon name="event" size={24} color={COLORS.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              {language === 'es' ? 'Mis Reservas' : 'My Reservations'}
            </Text>
            <Text style={styles.actionSubtitle}>
              {language === 'es' ? 'Ver y gestionar sus reservas' : 'View and manage your bookings'}
            </Text>
          </View>
          <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleBookAmenities}>
          <Icon name="pool" size={24} color={COLORS.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              {language === 'es' ? 'Reservar Amenidades' : 'Book Amenities'}
            </Text>
            <Text style={styles.actionSubtitle}>
              {language === 'es' ? 'Reservar jacuzzi, salón y más' : 'Reserve jacuzzi, lounge, and more'}
            </Text>
          </View>
          <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleContactSupport}>
          <Icon name="help" size={24} color={COLORS.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              {language === 'es' ? 'Ayuda y Soporte' : 'Help & Support'}
            </Text>
            <Text style={styles.actionSubtitle}>
              {language === 'es' ? 'Contactar administración del edificio' : 'Contact building administration'}
            </Text>
          </View>
          <Icon name="chevron_right" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </Card>

      {/* Account Information */}
      <Card style={styles.infoCard}>
        <Text style={styles.cardTitle}>
          {language === 'es' ? 'Información de la Cuenta' : 'Account Information'}
        </Text>
        
        <View style={styles.infoContainer}>
          <Icon name="info" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            {language === 'es' 
              ? 'La contraseña solo puede ser cambiada por el administrador del edificio. Para solicitudes de cambio de contraseña o soporte técnico, contacte directamente a la administración.'
              : 'Password can only be changed by your building administrator. For password change requests or technical support, please contact building administration directly.'
            }
          </Text>
        </View>
      </Card>

      {/* Sign Out */}
      <Card style={styles.signOutCard}>
        <Button
          title={language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
          onPress={handleLogout}
          loading={loggingOut}
          variant="outline"
          leftIcon="logout"
          style={styles.signOutButton}
        />
      </Card>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          {language === 'es' ? 'Versión' : 'Version'} 1.0.0
        </Text>
        <Text style={styles.versionSubtext}>
          {language === 'es' ? 'Sistema de Reservas de Amenidades' : 'Amenity Reservation System'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileCard: {
    margin: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  profileRole: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  infoLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  settingsCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  actionsCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  infoCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  signOutCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  languageContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  languageTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  languageSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLanguage: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  actionContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  actionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginLeft: SPACING.sm,
  },
  signOutButton: {
    borderColor: COLORS.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  versionSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
  },
});

export default ProfileScreen;