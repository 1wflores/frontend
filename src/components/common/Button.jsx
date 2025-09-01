import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconSize,
}) => {
  const getIconSize = () => {
    if (iconSize) return iconSize;
    
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 18;
      case 'large':
        return 20;
      default:
        return 18;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return COLORS.text.inverse;
      case 'secondary':
        return COLORS.text.primary;
      case 'outline':
        return COLORS.primary;
      default:
        return COLORS.text.inverse;
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Add size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'medium':
        baseStyle.push(styles.medium);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
    }
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    // Add variant styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        break;
      case 'danger':
        baseStyle.push(styles.danger);
        break;
    }
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    // Add size text styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'medium':
        baseStyle.push(styles.mediumText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
    }
    
    // Add variant text styles
    switch (variant) {
      case 'primary':
      case 'danger':
        baseStyle.push(styles.whiteText);
        break;
      case 'secondary':
        baseStyle.push(styles.darkText);
        break;
      case 'outline':
        baseStyle.push(styles.primaryText);
        break;
    }
    
    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          color={variant === 'outline' ? COLORS.primary : COLORS.text.inverse} 
          size="small" 
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {leftIcon && (
          <Icon 
            name={leftIcon} 
            size={getIconSize()} 
            color={getIconColor()} 
            style={styles.leftIcon}
          />
        )}
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        {rightIcon && (
          <Icon 
            name={rightIcon} 
            size={getIconSize()} 
            color={getIconColor()} 
            style={styles.rightIcon}
          />
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 52,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.background,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  disabled: {
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.md,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },
  whiteText: {
    color: COLORS.text.inverse,
  },
  darkText: {
    color: COLORS.text.primary,
  },
  primaryText: {
    color: COLORS.primary,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
});