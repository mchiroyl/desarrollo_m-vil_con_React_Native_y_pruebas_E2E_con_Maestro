import { router } from 'expo-router';
import { ArrowLeft, LogOut, Scissors } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSignOut } from '@/data/hooks';
import { useUiStore } from '@/state/uiStore';
import { colors, radii, spacing } from '@/theme';

interface ScreenHeaderProps {
  title: string;
  eyebrow?: string;
  back?: boolean;
  logout?: boolean;
}

export function ScreenHeader({ title, eyebrow, back = false, logout = false }: ScreenHeaderProps) {
  const signOut = useSignOut();
  const showToast = useUiStore((state) => state.showToast);

  async function handleSignOut() {
    try {
      await signOut.mutateAsync();
      router.replace('/');
      showToast('Sesión cerrada. Te esperamos pronto.');
    } catch {
      showToast('No pudimos cerrar tu sesión. Inténtalo de nuevo.', 'error');
    }
  }

  return (
    <View style={styles.row}>
      {back ? (
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={styles.iconButton}
          testID="back-button"
        >
          <ArrowLeft size={19} color={colors.ink} />
        </Pressable>
      ) : (
        <View style={styles.brandIcon}>
          <Scissors size={17} color={colors.forestDeep} />
        </View>
      )}
      <View style={styles.titleWrap}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {logout ? (
        <Pressable
          accessibilityLabel="Cerrar sesión"
          accessibilityRole="button"
          onPress={handleSignOut}
          style={styles.iconButton}
          testID="logout-button"
        >
          <LogOut size={18} color={colors.ink} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.lemon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  titleWrap: { flex: 1, gap: 2 },
  eyebrow: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: { color: colors.ink, fontSize: 20, fontWeight: '800' },
});
