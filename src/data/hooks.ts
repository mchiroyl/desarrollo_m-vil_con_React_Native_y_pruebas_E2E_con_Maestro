import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import {
  createAppointment,
  getAppointment,
  getAppointments,
  getAvailableSlots,
  getCategories,
  getCurrentUser,
  getProfessionals,
  getServices,
  setAppointmentStatus,
  signIn,
  signOut,
  signUp,
} from '@/data/repository';
import type { AppointmentStatus, UserRole } from '@/types';

export function useSession() {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ['session'],
    queryFn: () => getCurrentUser(db),
    staleTime: Infinity,
  });
}

export function useSignIn() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string; role: UserRole }) =>
      signIn(db, input.email, input.password, input.role),
    onSuccess: (user) => queryClient.setQueryData(['session'], user),
  });
}

export function useSignUp() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof signUp>[1]) => signUp(db, input),
    onSuccess: (user) => queryClient.setQueryData(['session'], user),
  });
}

export function useSignOut() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => signOut(db),
    onSuccess: () => {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'session' });
      queryClient.setQueryData(['session'], null);
    },
  });
}

export function useCategories() {
  const db = useSQLiteContext();
  return useQuery({ queryKey: ['categories'], queryFn: () => getCategories(db) });
}

export function useProfessionals(categoryId: string | null, search: string) {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ['professionals', categoryId, search],
    queryFn: () => getProfessionals(db, categoryId ?? undefined, search),
  });
}

export function useServices(professionalId: string) {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ['services', professionalId],
    queryFn: () => getServices(db, professionalId),
    enabled: Boolean(professionalId),
  });
}

export function useAvailableSlots(professionalId: string, date: string, serviceId: string) {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ['availability', professionalId, date, serviceId],
    queryFn: () => getAvailableSlots(db, professionalId, date, serviceId),
    enabled: Boolean(professionalId && date && serviceId),
  });
}

export function useAppointments(role: UserRole | undefined, userId: string | undefined) {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ['appointments', role, userId],
    queryFn: () => getAppointments(db, role!, userId!),
    enabled: Boolean(role && userId),
  });
}

export function useAppointment(appointmentId: string, professionalId: string) {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ['appointment', professionalId, appointmentId],
    queryFn: () => getAppointment(db, appointmentId, professionalId),
    enabled: Boolean(appointmentId && professionalId),
  });
}

export function useCreateAppointment() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAppointment.bind(null, db),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      professionalId: string;
      status: Extract<AppointmentStatus, 'confirmed' | 'cancelled'>;
    }) => setAppointmentStatus(db, input.id, input.professionalId, input.status),
    onSuccess: async (_, input) => {
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      await queryClient.invalidateQueries({
        queryKey: ['appointment', input.professionalId, input.id],
      });
      await queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}
