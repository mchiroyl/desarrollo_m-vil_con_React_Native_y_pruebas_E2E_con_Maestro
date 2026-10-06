import { router } from 'expo-router';
import { CalendarDays, CheckCircle2, Clock3 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { AppointmentCard } from '@/components/AppointmentCard';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppointments, useSession } from '@/data/hooks';
import { colors, radii, spacing } from '@/theme';
import type { AppointmentStatus } from '@/types';
import { getDateKey, getDateKeyForOffset, getWeekdayLabel } from '@/utils/date';

type AppointmentFilter = 'all' | AppointmentStatus;

export default function ProfessionalDashboardScreen() {
  const session = useSession();
  const appointmentsQuery = useAppointments(session.data?.role, session.data?.id);
  const [selectedDate, setSelectedDate] = useState(getDateKeyForOffset(1));
  const [filter, setFilter] = useState<AppointmentFilter>('all');
  const appointments = appointmentsQuery.data ?? [];
  const today = getDateKey(new Date());
  const dates = Array.from({ length: 8 }, (_, index) => getDateKeyForOffset(index));
  const dateAppointments = appointments.filter((appointment) => appointment.date === selectedDate);
  const visibleAppointments = dateAppointments.filter(
    (appointment) => filter === 'all' || appointment.status === filter,
  );
  const pendingCount = appointments.filter(
    (appointment) => appointment.status === 'pending' && appointment.date >= today,
  ).length;
  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === 'confirmed' && appointment.date >= today,
  ).length;

  useEffect(() => {
    if (session.data?.role === 'client') router.replace('/client/home');
    else if (!session.isLoading && !session.data) router.replace('/auth/login?role=professional');
  }, [session.data, session.isLoading]);

  return (
    <AppScreen footer={<BottomNavigation role="professional" />} contentStyle={styles.content}>
      <ScreenHeader
        title="Tu agenda"
        eyebrow={`Hola${session.data?.name ? `, ${session.data.name.split(' ')[0]}` : ''}`}
        logout
      />
      <View style={styles.welcome}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.welcomeKicker}>TU ESPACIO PROFESIONAL</Text>
          <Text style={styles.welcomeTitle}>Cada cita{'\n'}cuenta.</Text>
          <Text style={styles.welcomeText}>
            {session.data?.businessName ?? 'Organiza tu día, una reserva a la vez.'}
          </Text>
        </View>
        <View style={styles.calendarArt}>
          <CalendarDays size={28} color={colors.forestDeep} />
        </View>
      </View>

      <View style={styles.stats}>
        <Metric
          icon={<Clock3 size={16} color={colors.coral} />}
          label="Por confirmar"
          value={pendingCount}
          testID="dashboard-pending-count"
        />
        <View style={styles.statDivider} />
        <Metric
          icon={<CheckCircle2 size={16} color={colors.forest} />}
          label="Confirmadas"
          value={confirmedCount}
          testID="dashboard-confirmed-count"
        />
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Tu semana</Text>
        <Text style={styles.timezone}>Ciudad de México</Text>
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={styles.dateStrip}
        showsHorizontalScrollIndicator={false}
      >
        {dates.map((date) => (
          <Pressable
            accessibilityLabel={`Citas del ${date}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedDate === date }}
            key={date}
            onPress={() => setSelectedDate(date)}
            style={[styles.dateItem, selectedDate === date && styles.dateItemSelected]}
            testID={`dashboard-date-${date}`}
          >
            <Text style={[styles.dateWeekday, selectedDate === date && styles.selectedText]}>
              {date === today ? 'hoy' : getWeekdayLabel(date)}
            </Text>
            <Text style={[styles.dateDay, selectedDate === date && styles.selectedText]}>
              {date.slice(-2)}
            </Text>
            <View
              style={[
                styles.dateDot,
                appointments.some((item) => item.date === date) && styles.dateDotVisible,
              ]}
            />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.sectionTitle}>Citas del día</Text>
          <Text style={styles.selectedDate}>
            {selectedDate === today ? 'Hoy' : getWeekdayLabel(selectedDate)} · {selectedDate}
          </Text>
        </View>
        <Text style={styles.dayCount}>{dateAppointments.length}</Text>
      </View>
      <View style={styles.filters}>
        <FilterButton
          label="Todas"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
          testID="dashboard-filter-all"
        />
        <FilterButton
          label="Pendientes"
          active={filter === 'pending'}
          onPress={() => setFilter('pending')}
          testID="dashboard-filter-pending"
        />
        <FilterButton
          label="Confirmadas"
          active={filter === 'confirmed'}
          onPress={() => setFilter('confirmed')}
          testID="dashboard-filter-confirmed"
        />
        <FilterButton
          label="Canceladas"
          active={filter === 'cancelled'}
          onPress={() => setFilter('cancelled')}
          testID="dashboard-filter-cancelled"
        />
      </View>

      {appointmentsQuery.isLoading ? <Text style={styles.empty}>Cargando tu agenda…</Text> : null}
      {appointmentsQuery.isError ? (
        <Text style={styles.empty}>No pudimos cargar las citas. Inténtalo de nuevo.</Text>
      ) : null}
      {!appointmentsQuery.isLoading && visibleAppointments.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <CalendarDays size={21} color={colors.forest} />
          </View>
          <Text style={styles.emptyTitle}>Un espacio para nuevas citas</Text>
          <Text style={styles.empty}>No tienes citas en este día y filtro.</Text>
        </View>
      ) : null}
      <View style={styles.list}>
        {visibleAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            role="professional"
            interactive
          />
        ))}
      </View>
    </AppScreen>
  );
}

function Metric({
  icon,
  label,
  value,
  testID,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  testID: string;
}) {
  return (
    <View style={styles.metric} testID={testID}>
      <View style={styles.metricLine}>
        {icon}
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function FilterButton({
  label,
  active,
  onPress,
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.filter, active && styles.filterActive]}
      testID={testID}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm, paddingBottom: spacing.md, gap: spacing.md },
  welcome: {
    minHeight: 168,
    borderRadius: radii.lg,
    backgroundColor: colors.forest,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  welcomeCopy: { flex: 1, gap: 5, zIndex: 1 },
  welcomeKicker: { color: '#BFD9CE', fontSize: 9, fontWeight: '900', letterSpacing: 0.9 },
  welcomeTitle: {
    color: colors.surface,
    fontFamily: 'Georgia',
    fontSize: 29,
    lineHeight: 31,
    fontWeight: '700',
  },
  welcomeText: { color: '#E3EFE8', fontSize: 12 },
  calendarArt: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: colors.lemon,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '7deg' }],
  },
  stats: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
  },
  statDivider: { width: 1, height: 39, backgroundColor: colors.line, marginHorizontal: spacing.lg },
  metric: { flex: 1, gap: 4 },
  metricLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricValue: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  metricLabel: { color: colors.muted, fontSize: 10 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  timezone: { color: colors.muted, fontSize: 10 },
  dateStrip: { gap: spacing.xs },
  dateItem: {
    width: 51,
    minHeight: 67,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dateItemSelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  dateWeekday: { color: colors.muted, fontSize: 10, textTransform: 'capitalize' },
  dateDay: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  selectedText: { color: colors.surface },
  dateDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  dateDotVisible: { backgroundColor: colors.lemon },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedDate: { color: colors.muted, fontSize: 10, marginTop: 3, textTransform: 'capitalize' },
  dayCount: {
    color: colors.forest,
    backgroundColor: colors.mint,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
  },
  filters: { flexDirection: 'row', gap: spacing.xs },
  filter: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EDE7',
    borderRadius: 10,
  },
  filterActive: { backgroundColor: colors.forest },
  filterText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: colors.surface, fontWeight: '800' },
  list: { gap: spacing.sm },
  emptyState: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  emptyIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  empty: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
