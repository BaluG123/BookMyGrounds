import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
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
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isOutline = variant === 'outline';
  const isText = variant === 'text';
  const isSecondary = variant === 'secondary';

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    if (isText) return 'transparent';
    if (isOutline) return theme.colors.surface;
    if (isSecondary) return theme.colors.surfaceDark;
    return theme.colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textSoft;
    if (isText) return theme.colors.textMain;
    if (isOutline) return theme.colors.primaryDark;
    return theme.colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        !disabled && !isText && theme.shadows.soft,
        isOutline && styles.outline,
        isText && styles.textOnly,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.88}>
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    borderRadius: theme.borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  textOnly: {
    minHeight: 40,
    paddingHorizontal: 0,
    alignItems: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    marginRight: 10,
  },
  text: {
    ...theme.typography.bodyM,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
