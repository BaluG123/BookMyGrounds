import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    if (isOutline || isText) return 'transparent';
    if (variant === 'secondary') return theme.colors.secondary;
    return theme.colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textMuted;
    if (isOutline || isText) {
      return theme.colors.primary;
    }
    return theme.colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        isOutline && styles.outline,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}>
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  text: {
    ...theme.typography.bodyM,
    fontWeight: '600',
  },
});
