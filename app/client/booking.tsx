import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CalendarDays, Check, Clock3, MapPin, Sparkles } from 'lucide-react-native';

import { AppButton } from '@/components/AppButton';
import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import {
  useAvailableSlots,
  useCreateAppointment,
  useProfessionals,
  useServices,
  useSession,
} from '@/data/hooks';
import { useUiStore } from '@/state/uiStore';
import { colors, radii, spacing } from '@/theme';
import { formatLongDate, getDateKeyForOffset, getWeekdayLabel } from '@/utils/date';
import { formatCurrency } from '@/utils/format';

export default function BookingScreen() {
  const { professionalId = '' } = useLocalSearchParams<{ professionalId: string }>();
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(getDateKeyForOffset(1));
  const [startTime, setStartTime] = useState('');
  const [note, setNote] = useState('');
  const [reviewVisible, setReviewVisible] = useState(false);
  const professionalsQuery = useProfessionals(null, '');
  const professional = professionalsQuery.data?.find((item) => item.id === professionalId);
  const serviceQuery = useServices(professionalId);
  const slotsQuery = useAvailableSlots(professionalId, date, serviceId);
  const session = useSession();
  const createAppointment = useCreateAppointment();
  const showToast = useUiStore((state) => state.showToast);
  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => getDateKeyForOffset(index + 1)),
    [],
  );

  useEffect(() => {
    if (
      serviceQuery.data?.length &&
      !serviceQuery.data.some((service) => service.id === serviceId)
    ) {
      setServiceId(serviceQuery.data[0].id);
    }
  }, [serviceId, serviceQuery.data]);

  useEffect(() => {
    setStartTime('');
  }, [date, serviceId]);

  useEffect(() => {
    if (session.data?.role && session.data.role !== 'client')
      router.replace('/professional/dashboard');
  }, [session.data]);

  async function handleBooking() {
    if (!session.data || !serviceId || !startTime) return;
    try {
      await createAppointment.mutateAsync({
        clientId: session.data.id,
        serviceId,
        date,
        startTime,
        note,
      });
      showToast('Tu cita quedó agendada.');
      setReviewVisible(false);
      router.replace('/client/my-bookings');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No se pudo guardar la cita.', 'error');
      slotsQuery.refetch();
    }
  }

  if (professionalsQuery.isError) {
    return (
      <AppScreen>
        <ScreenHeader back title="No pudimos cargar el perfil" />
        <Text style={styles.empty}>Inténtalo de nuevo para consultar los servicios.</Text>
        <AppButton
          testID="booking-profile-retry"
          onPress={() => {
            void professionalsQuery.refetch();
          }}
        >
          Reintentar
        </AppButton>
      </AppScreen>
    );
  }
  if (!professionalId || (professionalsQuery.isFetched && !professional)) {
    return (
      <AppScreen>
        <ScreenHeader back title="Reserva no disponible" />
        <Text style={styles.empty}>No encontramos este perfil.</Text>
        <AppButton onPress={() => router.replace('/client/home')} testID="booking-back-home">
          Volver a explorar
        </AppButton>
      </AppScreen>
    );
  }

  return (
    <AppScreen contentStyle={styles.content}>
      <ScreenHeader back title="Reserva tu cita" eyebrow="El siguiente paso es tuyo" />
      <View style={styles.profile}>
        <View style={styles.profileIcon}>
          <Sparkles size={20} color={colors.forestDeep} />
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.business}>{professional?.businessName ?? 'Cargando perfil…'}</Text>
          <Text style={styles.professional}>
            {professional?.name ?? ''} · {professional?.categoryName ?? ''}
          </Text>
          {professional ? (
            <View style={styles.area}>
              <MapPin size={13} color={colors.muted} />
              <Text style={styles.areaText}>{professional.area}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading number="01" title="Elige tu servicio" />
        {serviceQuery.isLoading ? <Text style={styles.empty}>Cargando servicios…</Text> : null}
        <View style={styles.optionList}>
          {(serviceQuery.data ?? []).map((service) => {
            const selected = service.id === serviceId;
            return (
              <Pressable
                accessibilityLabel={`${service.name}, ${service.durationMinutes} minutos, ${formatCurrency(service.priceCents)}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={service.id}
                onPress={() => setServiceId(service.id)}
                style={[styles.serviceOption, selected && styles.optionSelected]}
                testID={`booking-service-${service.id}`}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <Check size={12} color={colors.surface} /> : null}
                </View>
                <View style={styles.serviceCopy}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDuration}>{service.durationMinutes} min</Text>
                </View>
                <Text style={styles.price}>{formatCurrency(service.priceCents)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading number="02" title="Escoge el día" />
        <ScrollView
          horizontal
          contentContainerStyle={styles.dateList}
          showsHorizontalScrollIndicator={false}
        >
          {dates.map((dateKey, index) => (
            <Pressable
              accessibilityLabel={`Reservar el ${formatLongDate(dateKey)}`}
              accessibilityRole="button"
              accessibilityState={{ selected: date === dateKey }}
              key={dateKey}
              onPress={() => setDate(dateKey)}
              style={[styles.dateOption, date === dateKey && styles.dateSelected]}
              testID={index === 0 ? 'booking-date-first' : `booking-date-${dateKey}`}
            >
              <Text style={[styles.weekday, date === dateKey && styles.selectedText]}>
                {getWeekdayLabel(dateKey)}
              </Text>
              <Text style={[styles.day, date === dateKey && styles.selectedText]}>
                {dateKey.slice(-2)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.selectedDate}>
          <CalendarDays size={15} color={colors.forest} />
          <Text style={styles.selectedDateText}>{formatLongDate(date)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading number="03" title="Elige la hora" />
        <View style={styles.timeGrid}>
          {(slotsQuery.data ?? []).map((slot) => {
            const selected = startTime === slot.startTime;
            return (
              <Pressable
                accessibilityLabel={`Horario ${slot.startTime}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={slot.id}
                onPress={() => setStartTime(slot.startTime)}
                style={[styles.timeOption, selected && styles.timeSelected]}
                testID={`booking-slot-${slot.startTime.replace(':', '')}`}
              >
                <Clock3 size={14} color={selected ? colors.surface : colors.forest} />
                <Text style={[styles.timeText, selected && styles.selectedText]}>
                  {slot.startTime}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {!slotsQuery.isLoading && slotsQuery.data?.length === 0 ? (
          <Text style={styles.empty}>No quedan horarios libres ese día. Elige otra fecha.</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>
          Nota para el profesional <Text style={styles.optional}>(opcional)</Text>
        </Text>
        <TextInput
          accessibilityLabel="Nota para el profesional"
          maxLength={160}
          multiline
          onChangeText={setNote}
          placeholder="Algo que quieras compartir antes de tu cita…"
          placeholderTextColor={colors.muted}
          style={styles.noteInput}
          testID="booking-note"
          value={note}
        />
      </View>
      <AppButton
        disabled={!serviceId || !startTime || !session.data}
        loading={createAppointment.isPending}
        onPress={() => setReviewVisible(true)}
        testID="booking-submit"
      >
        {startTime ? 'Confirmar mi cita' : 'Elige un horario para continuar'}
      </AppButton>
      {serviceQuery.isError || slotsQuery.isError ? (
        <AppButton
          testID="booking-retry"
          variant="secondary"
          onPress={() => {
            void serviceQuery.refetch();
            void slotsQuery.refetch();
          }}
        >
          Reintentar carga de horarios
        </AppButton>
      ) : null}
      {!serviceQuery.isLoading && !serviceQuery.isError && serviceQuery.data?.length === 0 ? (
        <Text style={styles.empty}>Este profesional todavía no tiene servicios disponibles.</Text>
      ) : null}
      <ConfirmationDialog
        visible={reviewVisible}
        title="Revisa tu reserva"
        testID="booking-confirm-dialog"
        message={`${serviceQuery.data?.find((service) => service.id === serviceId)?.name ?? ''} con ${professional?.businessName ?? ''}. ${formatLongDate(date)} a las ${startTime}. La cita quedará pendiente de confirmación del profesional.`}
        confirmLabel="Guardar reserva"
        loading={createAppointment.isPending}
        onCancel={() => setReviewVisible(false)}
        onConfirm={() => {
          void handleBooking();
        }}
      />
    </AppScreen>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.headingNumber}>{number}</Text>
      <Text style={styles.headingTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  profile: {
    minHeight: 86,
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: colors.lemon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: { flex: 1, gap: 3 },
  business: { color: colors.forestDeep, fontSize: 16, fontWeight: '800' },
  professional: { color: colors.muted, fontSize: 12 },
  area: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  areaText: { color: colors.muted, fontSize: 11 },
  section: { gap: spacing.sm },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headingNumber: { color: colors.coral, fontSize: 11, fontWeight: '900' },
  headingTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  optionList: { gap: spacing.xs },
  serviceOption: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionSelected: { borderColor: colors.forest, backgroundColor: '#F0F6F0' },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#AEBAB1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.forest, backgroundColor: colors.forest },
  serviceCopy: { flex: 1, gap: 3 },
  serviceName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  serviceDuration: { color: colors.muted, fontSize: 11 },
  price: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  dateList: { gap: spacing.sm },
  dateOption: {
    width: 61,
    height: 70,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dateSelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  weekday: { color: colors.muted, fontSize: 11, textTransform: 'capitalize' },
  day: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  selectedText: { color: colors.surface },
  selectedDate: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectedDateText: {
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timeOption: {
    width: '22%',
    minWidth: 74,
    minHeight: 48,
    flexGrow: 1,
    flexBasis: '20%',
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  timeSelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  timeText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  empty: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  optional: { color: colors.muted, fontWeight: '400' },
  noteInput: {
    minHeight: 76,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.ink,
    textAlignVertical: 'top',
    fontSize: 13,
  },
});
