import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight, CalendarDays, Scissors } from 'lucide-react-native';

import { AppButton } from '@/components/AppButton';
import { AppScreen } from '@/components/AppScreen';
import { useSession } from '@/data/hooks';
import { colors, radii, spacing } from '@/theme';

export default function WelcomeScreen() {
  const { data: user, isLoading } = useSession();
  const [role, setRole] = useState<'client' | 'professional'>('client');

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === 'client' ? '/client/home' : '/professional/dashboard');
    }
  }, [isLoading, user]);

  if (isLoading || user) {
    return (
      <View style={styles.loading}>
        <Text style={styles.brand}>glowbook</Text>
      </View>
    );
  }

  return (
    <AppScreen contentStyle={styles.screen}>
      <View style={styles.topline}>
        <View style={styles.brandLockup}>
          <View style={styles.logo}>
            <Scissors size={19} color={colors.forestDeep} />
          </View>
          <Text style={styles.brand}>glowbook</Text>
        </View>
        <Text style={styles.kicker}>BIENESTAR A TU TIEMPO</Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroArt}>
          <View style={styles.orbit}>
            <CalendarDays size={31} color={colors.forestDeep} />
          </View>
          <View style={styles.heroDot} />
          <View style={styles.heroLabel}>
            <Text style={styles.heroLabelText}>tu momento</Text>
          </View>
        </View>
        <Text style={styles.title}>
          Un buen día{'\n'}empieza con{'\n'}un buen <Text style={styles.titleAccent}>turno.</Text>
        </Text>
        <Text style={styles.subtitle}>
          Encuentra a tu profesional ideal. Reserva cuando te venga bien.
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.roles}>
          <AppButton
            testID="welcome-role-client"
            selected={role === 'client'}
            variant={role === 'client' ? 'primary' : 'secondary'}
            onPress={() => setRole('client')}
          >
            Soy cliente
          </AppButton>
          <AppButton
            testID="welcome-role-professional"
            selected={role === 'professional'}
            variant={role === 'professional' ? 'primary' : 'secondary'}
            onPress={() => setRole('professional')}
          >
            Soy profesional
          </AppButton>
        </View>
        <AppButton
          icon={<ArrowRight size={18} color={colors.surface} />}
          onPress={() => router.push({ pathname: '/auth/register', params: { role } })}
          testID="welcome-register"
        >
          Crear una cuenta
        </AppButton>
        <AppButton
          onPress={() => router.push({ pathname: '/auth/login', params: { role } })}
          testID="welcome-login"
          variant="secondary"
        >
          Ya tengo cuenta
        </AppButton>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Un espacio para cuidarte y crecer</Text>
        <View style={styles.footerRule} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  roles: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  screen: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.lemon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: colors.forestDeep, fontSize: 21, fontFamily: 'Georgia', fontWeight: '700' },
  kicker: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  hero: { gap: spacing.md },
  heroArt: {
    height: 162,
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbit: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: '#95B9A7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8F4',
  },
  heroDot: {
    position: 'absolute',
    width: 32,
    height: 32,
    right: '23%',
    top: 31,
    borderRadius: 16,
    backgroundColor: colors.coral,
  },
  heroLabel: {
    position: 'absolute',
    left: '18%',
    bottom: 27,
    backgroundColor: colors.lemon,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radii.pill,
    transform: [{ rotate: '-7deg' }],
  },
  heroLabelText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  title: {
    color: colors.ink,
    fontSize: 39,
    lineHeight: 43,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  titleAccent: { color: colors.coral },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, maxWidth: 340 },
  actions: { gap: spacing.sm },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footerText: { color: colors.muted, fontSize: 11 },
  footerRule: { flex: 1, height: 1, backgroundColor: colors.line },
});
