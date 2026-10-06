import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, Check, Clock3, MapPin, UserRound } from 'lucide-react-native';

import { AppButton } from '@/components/AppButton';
import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { StatusPill } from '@/components/AppointmentCard';
import { useAppointment, useSession, useUpdateAppointmentStatus } from '@/data/hooks';
import { useUiStore } from '@/state/uiStore';
import { colors, radii, spacing } from '@/theme';
import { formatLongDate } from '@/utils/date';
import { formatCurrency, formatTimeRange } from '@/utils/format';

export default function ProfessionalAppointmentScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const session = useSession();
  const professionalId = session.data?.role === 'professional' ? session.data.id : '';
  const appointmentQuery = useAppointment(id, professionalId);
  const updateStatus = useUpdateAppointmentStatus();
  const showToast = useUiStore((state) => state.showToast);
  const appointment = appointmentQuery.data;
  const [action, setAction] = useState<'confirmed' | 'cancelled' | null>(null);

  useEffect(() => {
    if (session.data?.role === 'client') router.replace('/client/home');
    else if (!session.isLoading && !session.data) router.replace('/auth/login?role=professional');
  }, [session.data, session.isLoading]);

  async function handleStatus(status: 'confirmed' | 'cancelled') {
    if (!appointment) return;
    try {
      await updateStatus.mutateAsync({ id: appointment.id, professionalId, status });
      showToast(status === 'confirmed' ? 'La cita quedó confirmada.' : 'La cita fue cancelada.');
      setAction(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No se pudo actualizar la cita.', 'error');
    }
  }

  if (session.isLoading || !professionalId || appointmentQuery.isLoading) {
    return (
      <AppScreen>
        <ScreenHeader back title="Detalle de cita" />
        <Text style={styles.muted}>Cargando los detalles…</Text>
      </AppScreen>
    );
  }
  if (appointmentQuery.isError) {
    return (
      <AppScreen>
        <ScreenHeader back title="No pudimos cargar la cita" />
        <Text style={styles.muted}>Hubo un error al consultar los datos. Inténtalo de nuevo.</Text>
        <AppButton
          onPress={() => {
            void appointmentQuery.refetch();
          }}
          testID="appointment-retry"
        >
          Reintentar
        </AppButton>
      </AppScreen>
    );
  }
  if (!appointment) {
    return (
      <AppScreen>
        <ScreenHeader back title="Cita no encontrada" />
        <Text style={styles.muted}>Esta cita ya no está disponible.</Text>
        <AppButton
          onPress={() => router.replace('/professional/dashboard')}
          testID="appointment-back-dashboard"
        >
          Volver a la agenda
        </AppButton>
      </AppScreen>
    );
  }

  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader back title="Detalle de cita" eyebrow="Agenda profesional" logout />
      <View style={styles.hero}>
        <View style={styles.heroMark}>
          <UserRound size={25} color={colors.forestDeep} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>CLIENTE</Text>
          <Text style={styles.clientName}>{appointment.clientName}</Text>
          <Text style={styles.category}>{appointment.categoryName}</Text>
        </View>
        <StatusPill status={appointment.status} />
      </View>

      <View style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <Text style={styles.sectionLabel}>SERVICIO</Text>
          <Text style={styles.price}>{formatCurrency(appointment.priceCents)}</Text>
        </View>
        <Text style={styles.serviceName}>{appointment.serviceName}</Text>
        <Text style={styles.businessName}>{appointment.businessName}</Text>
        <View style={styles.rule} />
        <DetailRow
          icon={<CalendarDays size={17} color={colors.forest} />}
          label="Fecha"
          value={formatLongDate(appointment.date)}
        />
        <DetailRow
          icon={<Clock3 size={17} color={colors.forest} />}
          label="Horario"
          value={`${formatTimeRange(appointment.startTime, appointment.durationMinutes)} · ${appointment.durationMinutes} min`}
        />
        <DetailRow
          icon={<MapPin size={17} color={colors.forest} />}
          label="Lugar"
          value="Ciudad de México"
        />
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.sectionLabel}>NOTA DEL CLIENTE</Text>
        <Text style={styles.note}>
          {appointment.note || 'El cliente no agregó comentarios para esta cita.'}
        </Text>
      </View>

      <Text testID="appointment-status" style={styles.muted}>
        {appointment.status === 'pending'
          ? 'Pendiente'
          : appointment.status === 'confirmed'
            ? 'Confirmada'
            : 'Cancelada'}
      </Text>
      {appointment.status !== 'cancelled' ? (
        <View style={styles.actions}>
          {appointment.status === 'pending' ? (
            <AppButton
              icon={<Check size={17} color={colors.surface} />}
              loading={updateStatus.isPending}
              onPress={() => setAction('confirmed')}
              testID="appointment-confirm"
            >
              Confirmar cita
            </AppButton>
          ) : null}
          <AppButton
            loading={updateStatus.isPending}
            onPress={() => setAction('cancelled')}
            testID="appointment-cancel"
            variant="danger"
          >
            Cancelar cita
          </AppButton>
        </View>
      ) : (
        <View style={styles.completed}>
          <Text style={styles.completedText}>Esta cita fue cancelada.</Text>
          <AppButton
            onPress={() => router.replace('/professional/dashboard')}
            testID="appointment-back-dashboard"
            variant="secondary"
          >
            Volver a la agenda
          </AppButton>
        </View>
      )}
      <ConfirmationDialog
        visible={action !== null}
        title={action === 'cancelled' ? '¿Cancelar esta cita?' : '¿Confirmar esta cita?'}
        message={
          action === 'cancelled'
            ? 'El horario volverá a estar disponible. Esta acción no se puede deshacer.'
            : 'La cita quedará confirmada en tu agenda y en la del cliente.'
        }
        confirmLabel={action === 'cancelled' ? 'Sí, cancelar cita' : 'Sí, confirmar cita'}
        testID={action === 'cancelled' ? 'appointment-cancel-dialog' : 'appointment-confirm-dialog'}
        destructive={action === 'cancelled'}
        loading={updateStatus.isPending}
        onCancel={() => setAction(null)}
        onConfirm={() => {
          if (action) void handleStatus(action);
        }}
      />
    </AppScreen>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  hero: {
    minHeight: 111,
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1, gap: 3 },
  heroLabel: { color: colors.forest, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  clientName: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  category: { color: colors.muted, fontSize: 11 },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    gap: spacing.md,
  },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  price: { color: colors.forest, fontSize: 14, fontWeight: '800' },
  serviceName: { color: colors.ink, fontSize: 22, fontFamily: 'Georgia', fontWeight: '700' },
  businessName: { color: colors.forest, fontSize: 12, fontWeight: '600' },
  rule: { height: 1, backgroundColor: colors.line },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: { flex: 1, gap: 2 },
  detailLabel: { color: colors.muted, fontSize: 10 },
  detailValue: { color: colors.ink, fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  noteCard: {
    padding: spacing.md,
    backgroundColor: '#F0F2ED',
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  note: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  actions: { gap: spacing.sm },
  completed: { gap: spacing.md },
  completedText: { color: colors.forest, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  muted: { color: colors.muted, fontSize: 13 },
});
