import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(false);

  const handleSecureTextToggle = () => {
    setIsSecureTextVisible(!isSecureTextVisible);
  };

  const renderIcon = (iconName, onPress, position) => {
    return (
      <TouchableOpacity
        style={[styles.iconContainer, position === 'right' && styles.rightIcon]}
        onPress={onPress}
        disabled={!onPress}
      >
        <Icon 
          name={iconName} 
          size={20} 
          color={COLORS.text.secondary} 
        />
      </TouchableOpacity>
    );
  };

  const containerStyles = [
    styles.inputContainer,
    isFocused && styles.focused,
    error && styles.error,
    disabled && styles.disabled,
  ];

  const textInputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
    inputStyle,
  ];

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={containerStyles}>
        {leftIcon && renderIcon(leftIcon, null, 'left')}
        
        <TextInput
          style={textInputStyles}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.secondary}
          secureTextEntry={secureTextEntry && !isSecureTextVisible}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {secureTextEntry && renderIcon(
          isSecureTextVisible ? 'visibility-off' : 'visibility',
          handleSecureTextToggle,
          'right'
        )}
        
        {rightIcon && !secureTextEntry && renderIcon(rightIcon, onRightIconPress, 'right')}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    minHeight: 48,
  },
  focused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  error: {
    borderColor: COLORS.error,
  },
  disabled: {
    backgroundColor: COLORS.background,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING.xs,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.xs,
  },
  iconContainer: {
    padding: SPACING.sm,
  },
  rightIcon: {
    marginLeft: 'auto',
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});