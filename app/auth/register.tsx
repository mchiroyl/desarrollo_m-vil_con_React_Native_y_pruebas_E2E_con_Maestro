import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { useCategories, useSignUp } from '@/data/hooks';
import { useUiStore } from '@/state/uiStore';
import { colors, radii, spacing } from '@/theme';
import type { UserRole } from '@/types';

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<UserRole>(
    params.role === 'professional' ? 'professional' : 'client',
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const signUp = useSignUp();
  const categoryQuery = useCategories();
  const showToast = useUiStore((state) => state.showToast);

  async function handleSubmit() {
    try {
      const user = await signUp.mutateAsync({
        name,
        email,
        password,
        role,
        businessName,
        categoryId,
      });
      router.replace(user.role === 'client' ? '/client/home' : '/professional/dashboard');
      showToast(
        user.role === 'client'
          ? 'Tu cuenta ya está lista.'
          : 'Tu espacio profesional ya está listo.',
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No se pudo crear la cuenta.', 'error');
    }
  }

  return (
    <AppScreen>
      <ScreenHeader back title="Empieza por aquí" eyebrow="Crear cuenta" />
      <View style={styles.intro}>
        <Text style={styles.title}>Un perfil para{'\n'}tu próximo paso.</Text>
        <Text style={styles.subtitle}>Elige cómo vas a usar Glowbook.</Text>
      </View>
      <View style={styles.segment}>
        <RoleOption
          label="Cliente"
          selected={role === 'client'}
          onPress={() => setRole('client')}
          testID="register-role-client"
        />
        <RoleOption
          label="Profesional"
          selected={role === 'professional'}
          onPress={() => setRole('professional')}
          testID="register-role-professional"
        />
      </View>

      <View style={styles.form}>
        <TextField
          label="Nombre completo"
          value={name}
          onChangeText={setName}
          placeholder="¿Cómo te llamas?"
          textContentType="name"
          testID="register-name"
        />
        <TextField
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@correo.com"
          keyboardType="email-address"
          textContentType="emailAddress"
          testID="register-email"
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Al menos 8 caracteres"
          secureTextEntry
          textContentType="newPassword"
          testID="register-password"
        />
        {role === 'professional' ? (
          <>
            <Text style={styles.subtitle}>
              Tu perfil de prueba incluirá un servicio de 60 minutos por $300 MXN y horarios demo.
            </Text>
            <TextField
              label="Nombre de tu negocio"
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Nombre del estudio o salón"
              testID="register-business"
            />
            <View style={styles.categoryField}>
              <Text style={styles.fieldLabel}>Tu especialidad</Text>
              <View style={styles.categories}>
                {(categoryQuery.data ?? []).map((category) => (
                  <Pressable
                    accessibilityLabel={`Especialidad: ${category.name}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: categoryId === category.id }}
                    key={category.id}
                    onPress={() => setCategoryId(category.id)}
                    style={[styles.category, categoryId === category.id && styles.categorySelected]}
                    testID={`register-category-${category.id}`}
                  >
                    <Text style={styles.categoryText}>{category.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : null}
        <AppButton loading={signUp.isPending} onPress={handleSubmit} testID="register-submit">
          Crear mi cuenta
        </AppButton>
      </View>
      <View style={styles.loginRow}>
        <Text style={styles.subtitle}>¿Ya tienes cuenta?</Text>
        <Pressable
          accessibilityLabel="Inicia sesión"
          style={styles.linkTouch}
          accessibilityRole="button"
          onPress={() => router.push('/auth/login')}
          testID="register-login-link"
        >
          <Text style={styles.link}>Inicia sesión</Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}

interface RoleOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
}

function RoleOption({ label, selected, onPress, testID }: RoleOptionProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
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
  categoryField: { gap: spacing.xs },
  fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  category: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: '#E9EDE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySelected: { backgroundColor: colors.forest },
  categoryText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  loginRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  link: { color: colors.coral, fontSize: 14, fontWeight: '800' },
});
