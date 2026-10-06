import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, CalendarCheck2, Sparkles } from 'lucide-react-native';

import { AppButton } from '@/components/AppButton';
import { AppScreen } from '@/components/AppScreen';
import { AppointmentCard } from '@/components/AppointmentCard';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppointments, useSession } from '@/data/hooks';
import { colors, radii, spacing } from '@/theme';
import type { AppointmentSummary } from '@/types';
import { getDateKey } from '@/utils/date';

type BookingFilter = 'upcoming' | 'past' | 'all';

export default function MyBookingsScreen() {
  const [filter, setFilter] = useState<BookingFilter>('upcoming');
  const session = useSession();
  const appointmentsQuery = useAppointments(session.data?.role, session.data?.id);
  const appointments = appointmentsQuery.data ?? [];
  const today = getDateKey(new Date());
  const upcoming = useMemo(
    () =>
      appointments.filter(
        (appointment) => appointment.date >= today && appointment.status !== 'cancelled',
      ),
    [appointments, today],
  );
  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === 'upcoming')
      return appointment.date >= today && appointment.status !== 'cancelled';
    if (filter === 'past') return appointment.date < today || appointment.status === 'cancelled';
    return true;
  });

  useEffect(() => {
    if (session.data?.role === 'professional') router.replace('/professional/dashboard');
    else if (!session.isLoading && !session.data) router.replace('/auth/login?role=client');
  }, [session.data, session.isLoading]);

  return (
    <AppScreen footer={<BottomNavigation role="client" />} contentStyle={styles.content}>
      <ScreenHeader title="Mis citas" eyebrow="Tu agenda personal" logout />
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <CalendarCheck2 size={23} color={colors.forestDeep} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroKicker}>PRÓXIMO EN TU AGENDA</Text>
          <Text style={styles.heroTitle}>{upcoming[0]?.serviceName ?? 'Haz espacio para ti'}</Text>
          <Text style={styles.heroSubtitle}>
            {upcoming[0]
              ? `${upcoming[0].businessName} · ${upcoming[0].startTime}`
              : 'Encuentra un servicio y reserva tu primera cita.'}
          </Text>
        </View>
        <Sparkles size={17} color={colors.coral} />
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{upcoming.length}</Text>
          <Text style={styles.statLabel}>por venir</Text>
        </View>
        <View style={styles.statRule} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{appointments.length}</Text>
          <Text style={styles.statLabel}>en total</Text>
        </View>
        <Pressable
          accessibilityLabel="Nueva reserva"
          accessibilityRole="button"
          onPress={() => router.push('/client/home')}
          style={styles.newBooking}
          testID="my-bookings-new"
        >
          <Text style={styles.newBookingText}>Nueva cita</Text>
          <ArrowRight size={15} color={colors.forest} />
        </Pressable>
      </View>

      <View style={styles.filterBar}>
        <FilterButton
          active={filter === 'upcoming'}
          label="Próximas"
          onPress={() => setFilter('upcoming')}
          testID="bookings-filter-upcoming"
        />
        <FilterButton
          active={filter === 'past'}
          label="Anteriores"
          onPress={() => setFilter('past')}
          testID="bookings-filter-past"
        />
        <FilterButton
          active={filter === 'all'}
          label="Todas"
          onPress={() => setFilter('all')}
          testID="bookings-filter-all"
        />
      </View>

      {appointmentsQuery.isLoading ? <Text style={styles.empty}>Cargando tus citas…</Text> : null}
      {appointmentsQuery.isError ? (
        <Text style={styles.empty}>No pudimos cargar tus citas. Inténtalo de nuevo.</Text>
      ) : null}
      {!appointmentsQuery.isLoading && filteredAppointments.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <CalendarCheck2 size={23} color={colors.forest} />
          </View>
          <Text style={styles.emptyTitle}>
            {filter === 'upcoming' ? 'Tu agenda está libre' : 'Aún no hay citas aquí'}
          </Text>
          <Text style={styles.empty}>
            Cuando reserves, encontrarás los detalles en este espacio.
          </Text>
          <AppButton
            onPress={() => router.push('/client/home')}
            testID="no-bookings-explore"
            variant="secondary"
          >
            Explorar servicios
          </AppButton>
        </View>
      ) : null}
      <View style={styles.list}>
        {filteredAppointments.map((appointment: AppointmentSummary) => (
          <AppointmentCard key={appointment.id} appointment={appointment} role="client" />
        ))}
      </View>
    </AppScreen>
  );
}

function FilterButton({
  active,
  label,
  onPress,
  testID,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.filterButton, active && styles.filterActive]}
      testID={testID}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.md, gap: spacing.md },
  hero: {
    minHeight: 111,
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1, gap: 4 },
  heroKicker: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  heroTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  heroSubtitle: { color: colors.muted, fontSize: 11, lineHeight: 15 },
  stats: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stat: { gap: 2 },
  statValue: { color: colors.forestDeep, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 10 },
  statRule: { width: 1, height: 34, backgroundColor: colors.line },
  newBooking: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
  },
  newBookingText: { color: colors.forest, fontSize: 11, fontWeight: '800' },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: 4,
    backgroundColor: '#E9EDE7',
    borderRadius: radii.md,
  },
  filterButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  filterActive: { backgroundColor: colors.surface },
  filterText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: colors.forestDeep, fontWeight: '800' },
  list: { gap: spacing.sm },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  empty: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
