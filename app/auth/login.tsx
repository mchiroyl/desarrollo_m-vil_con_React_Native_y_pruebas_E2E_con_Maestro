import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, BriefcaseBusiness, UserRound } from 'lucide-react-native';

import { AppButton } from '@/components/AppButton';
import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { useSignIn } from '@/data/hooks';
import { demoAccounts } from '@/data/seed';
import { useUiStore } from '@/state/uiStore';
import { colors, radii, spacing } from '@/theme';
import type { UserRole } from '@/types';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<UserRole>(
    params.role === 'professional' ? 'professional' : 'client',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useSignIn();
  const showToast = useUiStore((state) => state.showToast);

  function fillDemoAccount(nextRole: UserRole) {
    setRole(nextRole);
    setEmail(demoAccounts[nextRole].email);
    setPassword(demoAccounts[nextRole].password);
  }

  async function handleSubmit() {
    try {
      const user = await signIn.mutateAsync({ email, password, role });
      router.replace(user.role === 'client' ? '/client/home' : '/professional/dashboard');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No se pudo iniciar sesión.', 'error');
    }
  }

  return (
    <AppScreen>
      <ScreenHeader back title="Qué bueno verte" eyebrow="Inicia sesión" />
      <View style={styles.intro}>
        <Text style={styles.title}>Tu espacio{'\n'}te está esperando.</Text>
        <Text style={styles.subtitle}>Entra para reservar o cuidar tu agenda.</Text>
      </View>

      <View style={styles.segment}>
        <RoleOption
          label="Cliente"
          role="client"
          selected={role === 'client'}
          onPress={setRole}
          testID="login-role-client"
        />
        <RoleOption
          label="Profesional"
          role="professional"
          selected={role === 'professional'}
          onPress={setRole}
          testID="login-role-professional"
        />
      </View>

      <View style={styles.form}>
        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@correo.com"
          keyboardType="email-address"
          textContentType="emailAddress"
          testID="login-email"
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          secureTextEntry
          textContentType="password"
          testID="login-password"
        />
        <Pressable
          accessibilityLabel={`Completar cuenta de prueba de ${role === 'client' ? 'cliente' : 'profesional'}`}
          accessibilityRole="button"
          onPress={() => fillDemoAccount(role)}
          style={styles.demoCard}
          testID={`demo-fill-${role}`}
        >
          <View style={styles.demoIcon}>
            {role === 'client' ? (
              <UserRound size={18} color={colors.forest} />
            ) : (
              <BriefcaseBusiness size={18} color={colors.forest} />
            )}
          </View>
          <View style={styles.demoCopy}>
            <Text style={styles.demoTitle}>Usar cuenta de prueba</Text>
            <Text style={styles.demoText}>
              Completa los datos de {role === 'client' ? 'cliente' : 'profesional'} demo
            </Text>
          </View>
          <ArrowRight size={17} color={colors.forest} />
        </Pressable>
        <AppButton loading={signIn.isPending} onPress={handleSubmit} testID="login-submit">
          Entrar
        </AppButton>
      </View>

      <View style={styles.registerRow}>
        <Text style={styles.subtitle}>¿Aún no tienes cuenta?</Text>
        <Pressable
          accessibilityLabel="Regístrate"
          style={styles.linkTouch}
          accessibilityRole="button"
          onPress={() => router.push('/auth/register')}
          testID="login-register-link"
        >
          <Text style={styles.link}>Regístrate</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

interface RoleOptionProps {
  label: string;
  role: UserRole;
  selected: boolean;
  onPress: (role: UserRole) => void;
  testID: string;
}

function RoleOption({ label, role, selected, onPress, testID }: RoleOptionProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(role)}
      style={[styles.roleOption, selected && styles.roleSelected]}
      testID={testID}
    >
      <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linkTouch: { minHeight: 48, minWidth: 48, justifyContent: 'center' },
  intro: { gap: spacing.sm, paddingTop: spacing.md },
  title: {
    color: colors.ink,
    fontFamily: 'Georgia',
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '700',
  },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  segment: { flexDirection: 'row', backgroundColor: '#E9EDE7', padding: 4, borderRadius: radii.md },
  roleOption: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  roleSelected: { backgroundColor: colors.surface },
  roleLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  roleLabelSelected: { color: colors.forestDeep, fontWeight: '800' },
  form: { gap: spacing.md },
  demoCard: {
    minHeight: 68,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#D9E5DC',
    backgroundColor: colors.mint,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  demoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoCopy: { flex: 1, gap: 3 },
  demoTitle: { color: colors.forestDeep, fontSize: 13, fontWeight: '800' },
  demoText: { color: colors.muted, fontSize: 11 },
  registerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  link: { color: colors.coral, fontSize: 14, fontWeight: '800' },
});
