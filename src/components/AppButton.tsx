import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing } from '@/theme';

interface AppButtonProps {
  children: string;
  onPress: () => void;
  testID: string;
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export function AppButton({
  children,
  onPress,
  testID,
  variant = 'primary',
  disabled = false,
  selected,
  loading = false,
  icon,
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityLabel={children}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, selected }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'quiet' && styles.quiet,
        variant === 'danger' && styles.danger,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.surface : colors.forest} />
      ) : (
        icon
      )}
      {!loading && (
        <Text
          style={[
            styles.label,
            variant === 'secondary' && styles.secondaryLabel,
            variant === 'quiet' && styles.quietLabel,
            variant === 'danger' && styles.dangerLabel,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.forest },
  secondary: { backgroundColor: colors.mint },
  quiet: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.dangerPale },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  label: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  secondaryLabel: { color: colors.forestDeep },
  quietLabel: { color: colors.forest },
  dangerLabel: { color: colors.danger },
});
