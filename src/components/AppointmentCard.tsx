import { router } from 'expo-router';
import { ArrowUpRight, CalendarDays, Clock3, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppointmentSummary, UserRole } from '@/types';
import { formatLongDate } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { colors, radii, spacing } from '@/theme';

interface AppointmentCardProps {
  appointment: AppointmentSummary;
  role: UserRole;
  interactive?: boolean;
}

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
} as const;

export function AppointmentCard({ appointment, role, interactive = false }: AppointmentCardProps) {
  const details = (
    <>
      <View style={styles.topline}>
        <View style={styles.dateBlock}>
          <CalendarDays size={15} color={colors.forest} />
          <Text style={styles.dateText}>{formatLongDate(appointment.date)}</Text>
        </View>
        <StatusPill status={appointment.status} />
      </View>
      <View style={styles.main}>
        <View style={styles.serviceMark}>
          <Text style={styles.serviceInitial}>{appointment.serviceName.charAt(0)}</Text>
        </View>
        <View style={styles.details}>
          <Text numberOfLines={1} style={styles.service}>
            {appointment.serviceName}
          </Text>
          <Text numberOfLines={1} style={styles.business}>
            {role === 'professional' ? appointment.clientName : appointment.businessName}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.meta}>
              <Clock3 size={13} color={colors.muted} />
              <Text style={styles.metaText}>
                {appointment.startTime} · {appointment.durationMinutes} min
              </Text>
            </View>
            {role === 'professional' ? (
              <View style={styles.meta}>
                <UserRound size={13} color={colors.muted} />
                <Text style={styles.metaText}>{appointment.clientName}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.priceWrap}>
          <Text style={styles.price}>{formatCurrency(appointment.priceCents)}</Text>
          {interactive ? <ArrowUpRight size={15} color={colors.forest} /> : null}
        </View>
      </View>
      {appointment.note ? <Text style={styles.note}>“{appointment.note}”</Text> : null}
    </>
  );

  if (interactive) {
    return (
      <Pressable
        accessibilityLabel={`Ver cita de ${appointment.clientName}, ${appointment.serviceName}, ${formatLongDate(appointment.date)} a las ${appointment.startTime}`}
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: '/professional/appointment/[id]',
            params: { id: appointment.id },
          })
        }
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        testID={`appointment-card-${appointment.id}`}
      >
        {details}
      </Pressable>
    );
  }
  return (
    <View style={styles.card} testID={`appointment-card-${appointment.id}`}>
      {details}
    </View>
  );
}

interface StatusPillProps {
  status: AppointmentSummary['status'];
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <View
      style={[
        styles.status,
        status === 'confirmed' && styles.confirmed,
        status === 'cancelled' && styles.cancelled,
      ]}
    >
      <Text
        style={[
          styles.statusText,
          status === 'confirmed' && styles.confirmedText,
          status === 'cancelled' && styles.cancelledText,
        ]}
      >
        {statusLabels[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.85 },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dateBlock: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { color: colors.muted, fontSize: 11, textTransform: 'capitalize' },
  status: {
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: '#FFF2D7',
  },
  confirmed: { backgroundColor: colors.mint },
  cancelled: { backgroundColor: colors.dangerPale },
  statusText: { color: '#87621C', fontSize: 10, fontWeight: '800' },
  confirmedText: { color: colors.forest },
  cancelledText: { color: colors.danger },
  main: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  serviceMark: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.coralPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInitial: { color: colors.coral, fontSize: 18, fontWeight: '800' },
  details: { flex: 1, gap: 3 },
  service: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  business: { color: colors.forest, fontSize: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.muted, fontSize: 10 },
  priceWrap: { alignItems: 'flex-end', justifyContent: 'center', gap: 5 },
  price: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  note: {
    color: colors.muted,
    fontSize: 11,
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
  },
});
