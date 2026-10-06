import { router, usePathname } from 'expo-router';
import { CalendarDays, Compass, LogOut, TicketCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSignOut } from '@/data/hooks';
import type { UserRole } from '@/types';
import { colors, spacing } from '@/theme';

interface BottomNavigationProps {
  role: UserRole;
}

export function BottomNavigation({ role }: BottomNavigationProps) {
  const pathname = usePathname();
  const signOut = useSignOut();
  const insets = useSafeAreaInsets();
  const clientTabs = [
    { label: 'Explorar', path: '/client/home', testID: 'nav-explore', Icon: Compass },
    {
      label: 'Mis citas',
      path: '/client/my-bookings',
      testID: 'nav-my-bookings',
      Icon: TicketCheck,
    },
  ] as const;

  if (role === 'professional') {
    return (
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        <Pressable
          accessibilityLabel="Agenda"
          accessibilityRole="button"
          onPress={() => router.replace('/professional/dashboard')}
          style={[styles.item, styles.active]}
          testID="nav-dashboard"
        >
          <CalendarDays size={19} color={colors.forest} />
          <Text style={[styles.label, styles.activeLabel]}>Agenda</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Cerrar sesión"
          accessibilityRole="button"
          onPress={async () => {
            await signOut.mutateAsync();
            router.replace('/');
          }}
          style={styles.item}
          testID="nav-logout"
        >
          <LogOut size={19} color={colors.muted} />
          <Text style={styles.label}>Salir</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {clientTabs.map(({ label, path, testID, Icon }) => {
        const active = pathname === path;
        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={path}
            onPress={() => router.replace(path)}
            style={[styles.item, active && styles.active]}
            testID={testID}
          >
            <Icon size={19} color={active ? colors.forest : colors.muted} />
            <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 68,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  item: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
  },
  active: { backgroundColor: colors.mint },
  label: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  activeLabel: { color: colors.forestDeep, fontWeight: '800' },
});
