import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useUiStore } from '@/state/uiStore';
import { colors, radii, spacing } from '@/theme';

export function ToastHost() {
  const message = useUiStore((state) => state.toastMessage);
  const tone = useUiStore((state) => state.toastTone);
  const clearToast = useUiStore((state) => state.clearToast);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(clearToast, 3200);
    return () => clearTimeout(timeout);
  }, [message, clearToast]);

  if (!message) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.toast, tone === 'error' && styles.error]}>
        <Text accessibilityLiveRegion="polite" style={styles.text}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  toast: {
    maxWidth: 420,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.forestDeep,
  },
  error: { backgroundColor: colors.danger },
  text: { color: colors.surface, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
