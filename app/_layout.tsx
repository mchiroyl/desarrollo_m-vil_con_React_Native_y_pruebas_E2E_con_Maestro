import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccessibilityInfo, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';

import { initializeDatabase } from '@/data/database';
import { ToastHost } from '@/components/ToastHost';
import { AppButton } from '@/components/AppButton';
import { AppScreen } from '@/components/AppScreen';
import { useSession } from '@/data/hooks';
import { colors, spacing } from '@/theme';

function LoadingScreen() {
  return (
    <View style={styles.loading} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.forestDeep} accessibilityLabel="Cargando Glowbook" />
      <Text style={styles.loadingText}>Preparando tu agenda…</Text>
    </View>
  );
}

function RootNavigator() {
  const session = useSession();
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);
  if (session.isLoading || session.isError) {
    return (
      <View>
        {session.isLoading ? (
          <ActivityIndicator accessibilityLabel="Cargando Glowbook" />
        ) : (
          <>
            <Text>No pudimos recuperar tu sesión.</Text>
            <AppButton
              onPress={() => {
                void session.refetch();
              }}
              testID="session-retry"
            >
              Reintentar
            </AppButton>
          </>
        )}
      </View>
    );
  }
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: reduceMotion ? 'none' : 'slide_from_right' }}
    >
      <Stack.Protected guard={!session.data}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
      </Stack.Protected>
      <Stack.Protected guard={session.data?.role === 'client'}>
        <Stack.Screen name="client/home" />
        <Stack.Screen name="client/booking" />
        <Stack.Screen name="client/my-bookings" />
      </Stack.Protected>
      <Stack.Protected guard={session.data?.role === 'professional'}>
        <Stack.Screen name="professional/dashboard" />
        <Stack.Screen name="professional/appointment/[id]" />
      </Stack.Protected>
    </Stack>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <AppScreen>
        <Text accessibilityRole="header">No pudimos iniciar Glowbook</Text>
        <Text>{error.message}</Text>
        <AppButton testID="initialization-retry" onPress={retry}>
          Reintentar
        </AppButton>
      </AppScreen>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [initialized, setInitialized] = useState(false);
  const initialize = useCallback(async (db: SQLiteDatabase) => {
    await initializeDatabase(db);
    setInitialized(true);
  }, []);
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="glowbook.db" onInit={initialize}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <RootNavigator />
          <ToastHost />
        </QueryClientProvider>
      </SQLiteProvider>
      {!initialized ? <LoadingScreen /> : null}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.paper,
  },
  loadingText: { color: colors.forestDeep, fontSize: 16 },
});
