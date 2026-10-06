import type { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

import { hashPassword, refreshAvailability } from '@/data/database';
import { categories } from '@/data/seed';
import type {
  AppointmentStatus,
  AppointmentSummary,
  AvailabilitySlot,
  Category,
  Professional,
  Service,
  SessionUser,
  UserRole,
} from '@/types';
import { getDateKeyForOffset } from '@/utils/date';
import { timeRangesOverlap } from '@/utils/time';

interface UserRow {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  business_name: string | null;
}

interface CreateAccountInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  businessName?: string;
  categoryId?: string;
}

interface CreateAppointmentInput {
  clientId: string;
  serviceId: string;
  date: string;
  startTime: string;
  note?: string;
}

interface AppointmentTimeRange {
  startTime: string;
  durationMinutes: number;
}

function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    role: row.role,
    name: row.full_name,
    email: row.email,
    businessName: row.business_name,
  };
}

export async function getCategories(db: SQLiteDatabase): Promise<Category[]> {
  return db.getAllAsync<Category>('SELECT id, name, icon, color FROM categories ORDER BY name');
}

export async function getCurrentUser(db: SQLiteDatabase): Promise<SessionUser | null> {
  const row = await db.getFirstAsync<UserRow>(`
    SELECT users.id, users.role, users.full_name, users.email, professionals.business_name
    FROM app_session
    JOIN users ON users.id = app_session.user_id
    LEFT JOIN professionals ON professionals.user_id = users.id
    WHERE app_session.id = 1
  `);
  return row ? toSessionUser(row) : null;
}

export async function signIn(
  db: SQLiteDatabase,
  email: string,
  password: string,
  role: UserRole,
): Promise<SessionUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const row = await db.getFirstAsync<UserRow & { password_hash: string }>(
    `SELECT users.id, users.role, users.full_name, users.email, users.password_hash,
            professionals.business_name
     FROM users LEFT JOIN professionals ON professionals.user_id = users.id
     WHERE users.email = ?`,
    normalizedEmail,
  );

  if (!row || row.password_hash !== passwordHash || row.role !== role) {
    throw new Error('Revisa tu correo, contraseña y tipo de cuenta.');
  }

  await db.runAsync(
    'INSERT INTO app_session (id, user_id) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET user_id = excluded.user_id',
    row.id,
  );
  return toSessionUser(row);
}

export async function signUp(db: SQLiteDatabase, input: CreateAccountInput): Promise<SessionUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const businessName = input.businessName?.trim() ?? '';

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || input.password.length < 8) {
    throw new Error('Completa los datos y usa una contraseña de al menos 8 caracteres.');
  }
  if (input.role === 'professional' && (!businessName || !input.categoryId)) {
    throw new Error('Completa el nombre de tu negocio y elige una categoría.');
  }
  const category = categories.find((item) => item.id === input.categoryId);
  if (input.role === 'professional' && !category) {
    throw new Error('Elige una categoría válida para tu negocio.');
  }

  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM users WHERE email = ?',
    normalizedEmail,
  );
  if (existing) throw new Error('Ya existe una cuenta con ese correo.');

  const id = Crypto.randomUUID();
  const passwordHash = await hashPassword(input.password);
  const timestamp = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'INSERT INTO users (id, role, full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      input.role,
      name,
      normalizedEmail,
      passwordHash,
      timestamp,
    );

    if (input.role === 'professional') {
      await transaction.runAsync(
        'INSERT INTO professionals (id, user_id, category_id, business_name, bio, area) VALUES (?, ?, ?, ?, ?, ?)',
        id,
        id,
        input.categoryId!,
        businessName,
        'Profesional de Glowbook.',
        'Ciudad de México',
      );
      await transaction.runAsync(
        'INSERT INTO services (id, professional_id, category_id, name, duration_minutes, price_cents) VALUES (?, ?, ?, ?, ?, ?)',
        `${id}-initial-service`,
        id,
        input.categoryId!,
        `Servicio de ${category!.name.toLowerCase()}`,
        60,
        30000,
      );
      for (let offset = 1; offset <= 10; offset += 1) {
        for (const startTime of ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']) {
          await transaction.runAsync(
            'INSERT INTO availability (id, professional_id, date, start_time) VALUES (?, ?, ?, ?)',
            `${id}-${getDateKeyForOffset(offset)}-${startTime}`,
            id,
            getDateKeyForOffset(offset),
            startTime,
          );
        }
      }
    }
    await transaction.runAsync(
      'INSERT INTO app_session (id, user_id) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET user_id = excluded.user_id',
      id,
    );
  });

  return {
    id,
    role: input.role,
    name,
    email: normalizedEmail,
    businessName: input.role === 'professional' ? businessName : null,
  };
}

export async function signOut(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM app_session WHERE id = 1');
}

export async function getProfessionals(
  db: SQLiteDatabase,
  categoryId?: string,
  search?: string,
): Promise<Professional[]> {
  const filters: string[] = [];
  const parameters: string[] = [];
  if (categoryId) {
    filters.push('professionals.category_id = ?');
    parameters.push(categoryId);
  }
  if (search?.trim()) {
    filters.push(
      '(users.full_name LIKE ? OR professionals.business_name LIKE ? OR professionals.area LIKE ?)',
    );
    const term = `%${search.trim()}%`;
    parameters.push(term, term, term);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  return db.getAllAsync<Professional>(
    `SELECT professionals.id, users.full_name AS name, professionals.business_name AS businessName,
            professionals.bio, professionals.area, professionals.rating,
            professionals.review_count AS reviewCount, professionals.category_id AS categoryId,
            categories.name AS categoryName, COALESCE(GROUP_CONCAT(services.name, ' · '), '') AS serviceNames
     FROM professionals
     JOIN users ON users.id = professionals.user_id
     JOIN categories ON categories.id = professionals.category_id
     LEFT JOIN services ON services.professional_id = professionals.id
     ${where}
     GROUP BY professionals.id
     ORDER BY professionals.rating DESC, professionals.business_name ASC`,
    parameters,
  );
}

export async function getServices(db: SQLiteDatabase, professionalId: string): Promise<Service[]> {
  return db.getAllAsync<Service>(
    `SELECT services.id, services.professional_id AS professionalId, services.name,
            services.category_id AS categoryId, categories.name AS categoryName,
            services.duration_minutes AS durationMinutes, services.price_cents AS priceCents
     FROM services JOIN categories ON categories.id = services.category_id
     WHERE services.professional_id = ? ORDER BY services.price_cents`,
    professionalId,
  );
}

export async function getAvailableSlots(
  db: SQLiteDatabase,
  professionalId: string,
  date: string,
  serviceId: string,
): Promise<AvailabilitySlot[]> {
  await refreshAvailability(db);
  const user = await getCurrentUser(db);
  const service = await db.getFirstAsync<{ durationMinutes: number }>(
    'SELECT duration_minutes AS durationMinutes FROM services WHERE id = ? AND professional_id = ?',
    serviceId,
    professionalId,
  );
  if (!service) return [];

  const slots = await db.getAllAsync<AvailabilitySlot>(
    `SELECT id, date, start_time AS startTime
     FROM availability
     WHERE professional_id = ? AND date = ?
     ORDER BY start_time`,
    professionalId,
    date,
  );

  const appointments = await db.getAllAsync<AppointmentTimeRange>(
    `SELECT appointments.start_time AS startTime,
            services.duration_minutes AS durationMinutes
     FROM appointments
     JOIN services ON services.id = appointments.service_id
     WHERE (appointments.professional_id = ? OR appointments.client_id = ?) AND appointments.date = ?
       AND appointments.status IN ('pending', 'confirmed')`,
    professionalId,
    user?.role === 'client' ? user.id : '',
    date,
  );

  return slots.filter((slot) =>
    appointments.every(
      (appointment) =>
        !timeRangesOverlap(
          slot.startTime,
          service.durationMinutes,
          appointment.startTime,
          appointment.durationMinutes,
        ),
    ),
  );
}

const appointmentSelection = `
  SELECT appointments.id, appointments.client_id AS clientId, clients.full_name AS clientName,
         appointments.professional_id AS professionalId, professionals.business_name AS businessName,
         providers.full_name AS professionalName, appointments.service_id AS serviceId,
         services.name AS serviceName, categories.name AS categoryName,
         services.duration_minutes AS durationMinutes, services.price_cents AS priceCents,
         appointments.date, appointments.start_time AS startTime, appointments.status,
         appointments.note
  FROM appointments
  JOIN users AS clients ON clients.id = appointments.client_id
  JOIN professionals ON professionals.id = appointments.professional_id
  JOIN users AS providers ON providers.id = professionals.user_id
  JOIN services ON services.id = appointments.service_id
  JOIN categories ON categories.id = services.category_id`;

export async function getAppointments(
  db: SQLiteDatabase,
  role: UserRole,
  userId: string,
): Promise<AppointmentSummary[]> {
  const ownerColumn = role === 'client' ? 'appointments.client_id' : 'appointments.professional_id';
  return db.getAllAsync<AppointmentSummary>(
    `${appointmentSelection} WHERE ${ownerColumn} = ? ORDER BY appointments.date, appointments.start_time`,
    userId,
  );
}

export async function getAppointment(
  db: SQLiteDatabase,
  appointmentId: string,
  professionalId: string,
): Promise<AppointmentSummary | null> {
  return db.getFirstAsync<AppointmentSummary>(
    `${appointmentSelection} WHERE appointments.id = ? AND appointments.professional_id = ?`,
    appointmentId,
    professionalId,
  );
}

export async function createAppointment(
  db: SQLiteDatabase,
  input: CreateAppointmentInput,
): Promise<string> {
  const appointmentId = Crypto.randomUUID();
  const unavailableMessage = 'Ese horario ya no está disponible. Elige otro.';

  try {
    await db.withExclusiveTransactionAsync(async (transaction) => {
      const user = await getCurrentUser(transaction);
      if (user?.role !== 'client' || user.id !== input.clientId) {
        throw new Error('Inicia sesión como cliente para reservar.');
      }
      if (input.date < getDateKeyForOffset(1)) {
        throw new Error('Elige una fecha futura para reservar.');
      }
      const service = await transaction.getFirstAsync<{
        professionalId: string;
        durationMinutes: number;
      }>(
        'SELECT professional_id AS professionalId, duration_minutes AS durationMinutes FROM services WHERE id = ?',
        input.serviceId,
      );
      if (!service) throw new Error(unavailableMessage);

      const slot = await transaction.getFirstAsync<{ id: string }>(
        'SELECT id FROM availability WHERE professional_id = ? AND date = ? AND start_time = ?',
        service.professionalId,
        input.date,
        input.startTime,
      );
      if (!slot) throw new Error(unavailableMessage);

      const clientAppointments = await transaction.getAllAsync<AppointmentTimeRange>(
        `SELECT appointments.start_time AS startTime, services.duration_minutes AS durationMinutes
         FROM appointments JOIN services ON services.id = appointments.service_id
         WHERE appointments.client_id = ? AND appointments.date = ?
           AND appointments.status IN ('pending', 'confirmed')`,
        input.clientId,
        input.date,
      );
      if (
        clientAppointments.some((appointment) =>
          timeRangesOverlap(
            input.startTime,
            service.durationMinutes,
            appointment.startTime,
            appointment.durationMinutes,
          ),
        )
      ) {
        throw new Error('Ya tienes una cita en ese horario. Elige otro.');
      }

      const appointments = await transaction.getAllAsync<AppointmentTimeRange>(
        `SELECT appointments.start_time AS startTime,
                services.duration_minutes AS durationMinutes
         FROM appointments
         JOIN services ON services.id = appointments.service_id
         WHERE appointments.professional_id = ? AND appointments.date = ?
           AND appointments.status IN ('pending', 'confirmed')`,
        service.professionalId,
        input.date,
      );
      if (
        appointments.some((appointment) =>
          timeRangesOverlap(
            input.startTime,
            service.durationMinutes,
            appointment.startTime,
            appointment.durationMinutes,
          ),
        )
      ) {
        throw new Error(unavailableMessage);
      }

      await transaction.runAsync(
        'INSERT INTO appointments (id, client_id, professional_id, service_id, date, start_time, status, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        appointmentId,
        input.clientId,
        service.professionalId,
        input.serviceId,
        input.date,
        input.startTime,
        'pending',
        input.note?.trim() || null,
        new Date().toISOString(),
      );
    });
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint|database is locked/i.test(error.message)) {
      throw new Error(unavailableMessage);
    }
    throw error;
  }
  return appointmentId;
}

export async function setAppointmentStatus(
  db: SQLiteDatabase,
  appointmentId: string,
  professionalId: string,
  status: Extract<AppointmentStatus, 'confirmed' | 'cancelled'>,
): Promise<void> {
  const user = await getCurrentUser(db);
  if (user?.role !== 'professional' || user.id !== professionalId) {
    throw new Error('Inicia sesión como el profesional de esta cita.');
  }
  const previousStatuses = status === 'cancelled' ? ['pending', 'confirmed'] : ['pending'];
  const result = await db.runAsync(
    `UPDATE appointments SET status = ?
     WHERE id = ? AND professional_id = ? AND status IN (${previousStatuses.map(() => '?').join(', ')})`,
    status,
    appointmentId,
    professionalId,
    ...previousStatuses,
  );
  if (result.changes === 0) throw new Error('La cita ya fue actualizada.');
}

export function getCategoryColor(categoryId: string): string {
  return categories.find((category) => category.id === categoryId)?.color ?? '#346F65';
}
