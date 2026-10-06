import { Modal, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { colors, radii, spacing } from '@/theme';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  testID: string;
  destructive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel,
  testID,
  destructive = false,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
    >
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.dialog} testID={testID}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <AppButton
            loading={loading}
            onPress={onConfirm}
            testID={`${testID}-proceed`}
            variant={destructive ? 'danger' : 'primary'}
          >
            {confirmLabel}
          </AppButton>
          <AppButton
            disabled={loading}
            onPress={onCancel}
            testID={`${testID}-dismiss`}
            variant="quiet"
          >
            Volver
          </AppButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '100%',
    maxWidth: 480,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink },
  message: { fontSize: 16, lineHeight: 24, color: colors.muted },
});
