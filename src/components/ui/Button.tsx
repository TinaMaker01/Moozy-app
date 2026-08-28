import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { borderRadius, typography } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  icon?: React.ReactNode;
}

/**
 * The one button component every screen should use, so spacing, radius,
 * touch-target size and theming stay consistent instead of each screen
 * hand-rolling its own TouchableOpacity + Text pair.
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  loading = false,
  icon,
  style,
  disabled,
  accessibilityLabel,
  ...rest
}) => {
  const { colors } = useTheme();

  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
      ? colors.surfaceCard
      : 'transparent';
  const textColor = variant === 'primary' ? '#FFFFFF' : colors.text;
  const borderColor =
    variant === 'ghost' ? 'transparent' : variant === 'secondary' ? colors.border : colors.primary;
  const isDisabled = disabled || loading;
  const opacity = isDisabled ? 0.5 : 1;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[styles.base, { backgroundColor, borderColor, opacity }, style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[typography.bodySmall, styles.label, { color: textColor }]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    minHeight: 44, // meets the ~44dp minimum recommended touch target
  },
  label: {
    fontWeight: '700',
  },
});
