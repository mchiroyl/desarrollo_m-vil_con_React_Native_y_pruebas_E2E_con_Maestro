import type { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

import { categories, demoPassword } from '@/data/seed';
import { getDateKeyForOffset } from '@/utils/date';

const demoUsers = [
  { id: 'client-demo', role: 'client', name: 'Valentina Cruz', email: 'cliente@glowbook.app' },
  { id: 'client-lucia', role: 'client', name: 'Lucía Méndez', email: 'lucia@glowbook.app' },
  {
    id: 'professional-demo',
    role: 'professional',
    name: 'Nico Ríos',
    email: 'profesional@glowbook.app',
  },
  { id: 'professional-alma', role: 'professional', name: 'Alma Solís', email: 'alma@glowbook.app' },
  {
    id: 'professional-nara',
    role: 'professional',
    name: 'Nara Valdés',
    email: 'nara@glowbook.app',
  },
  { id: 'professional-luz', role: 'professional', name: 'Luz Herrera', email: 'luz@glowbook.app' },
];

const demoProfessionals = [
  {
    id: 'professional-demo',
    categoryId: 'barberia',
    businessName: 'Ríos Barber Club',
    bio: 'Cortes con intención y atención sin prisa.',
    area: 'Roma Norte',
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: 'professional-alma',
    categoryId: 'cabello',
    businessName: 'Alma Estudio',
    bio: 'Color, forma y cuidado para tu cabello.',
    area: 'Condesa',
    rating: 4.8,
    reviewCount: 96,
  },
  {
    id: 'professional-nara',
    categoryId: 'masajes',
    businessName: 'Casa Nara',
    bio: 'Masajes restaurativos para volver a tu centro.',
    area: 'Del Valle',
    rating: 5.0,
    reviewCount: 74,
  },
  {
    id: 'professional-luz',
    categoryId: 'unas',
    businessName: 'Luz de Luna Nails',
    bio: 'Manicure y pedicure con acabados impecables.',
    area: 'Juárez',
    rating: 4.9,
    reviewCount: 112,
  },
];

const demoServices = [
  {
    id: 'service-cut',
    professionalId: 'professional-demo',
    categoryId: 'barberia',
    name: 'Corte clásico',
    duration: 45,
    price: 32000,
  },
  {
    id: 'service-beard',
    professionalId: 'professional-demo',
    categoryId: 'barberia',
    name: 'Corte y barba',
    duration: 60,
    price: 48000,
  },
  {
    id: 'service-color',
    professionalId: 'professional-alma',
    categoryId: 'cabello',
    name: 'Corte y styling',
    duration: 60,
    price: 65000,
  },
  {
    id: 'service-massage',
    professionalId: 'professional-nara',
    categoryId: 'masajes',
    name: 'Masaje relajante',
    duration: 60,
    price: 85000,
  },
  {
    id: 'service-manicure',
    professionalId: 'professional-luz',
    categoryId: 'unas',
    name: 'Manicure semipermanente',
    duration: 60,
    price: 52000,
  },
  {
    id: 'service-pedicure',
    professionalId: 'professional-luz',
    categoryId: 'unas',
    name: 'Pedicure spa',
    duration: 75,
    price: 68000,
  },
];

const slotTimes = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const DATABASE_VERSION = 2;

export async function refreshAvailability(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM availability WHERE date < ?', getDateKeyForOffset(0));
  const professionals = await db.getAllAsync<{ id: string }>('SELECT id FROM professionals');
  for (const professional of professionals) {
    const values: string[] = [];
    const rows: string[] = [];
    for (let offset = 1; offset <= 10; offset += 1) {
      const date = getDateKeyForOffset(offset);
      for (const startTime of slotTimes) {
        rows.push('(?, ?, ?, ?)');
        values.push(`${professional.id}-${date}-${startTime}`, professional.id, date, startTime);
      }
    }
    await db.runAsync(
      `INSERT OR IGNORE INTO availability (id, professional_id, date, start_time) VALUES ${rows.join(', ')}`,
      values,
    );
  }
}

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if (!version || version.user_version > DATABASE_VERSION) {
    throw new Error('La base de datos requiere una versión más reciente de Glowbook.');
  }
  if ((version?.user_version ?? 0) < DATABASE_VERSION) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('client', 'professional')),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS professionals (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id),
      business_name TEXT NOT NULL,
      bio TEXT NOT NULL,
      area TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 5,
      review_count INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY NOT NULL,
      professional_id TEXT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL CHECK(duration_minutes > 0),
      price_cents INTEGER NOT NULL CHECK(price_cents >= 0)
    );
    CREATE TABLE IF NOT EXISTS availability (
      id TEXT PRIMARY KEY NOT NULL,
      professional_id TEXT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      UNIQUE(professional_id, date, start_time)
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY NOT NULL,
      client_id TEXT NOT NULL REFERENCES users(id),
      professional_id TEXT NOT NULL REFERENCES professionals(id),
      service_id TEXT NOT NULL REFERENCES services(id),
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
      note TEXT,
      created_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS active_appointment_slot
      ON appointments(professional_id, date, start_time)
      WHERE status IN ('pending', 'confirmed');
    CREATE TABLE IF NOT EXISTS app_session (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS client_appointments_by_date ON appointments(client_id, date);
  `);
      await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    });
  }

  await db.withTransactionAsync(async () => {
    for (const category of categories) {
      await db.runAsync(
        'INSERT OR IGNORE INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)',
        category.id,
        category.name,
        category.icon,
        category.color,
      );
    }

    const createdAt = new Date().toISOString();
    const passwordHash = await hashPassword(demoPassword);
    for (const user of demoUsers) {
      await db.runAsync(
        'INSERT OR IGNORE INTO users (id, role, full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        user.id,
        user.role,
        user.name,
        user.email,
        passwordHash,
        createdAt,
      );
    }

    for (const professional of demoProfessionals) {
      await db.runAsync(
        'INSERT OR IGNORE INTO professionals (id, user_id, category_id, business_name, bio, area, rating, review_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        professional.id,
        professional.id,
        professional.categoryId,
        professional.businessName,
        professional.bio,
        professional.area,
        professional.rating,
        professional.reviewCount,
      );
    }

    for (const service of demoServices) {
      await db.runAsync(
        'INSERT OR IGNORE INTO services (id, professional_id, category_id, name, duration_minutes, price_cents) VALUES (?, ?, ?, ?, ?, ?)',
        service.id,
        service.professionalId,
        service.categoryId,
        service.name,
        service.duration,
        service.price,
      );
    }

    const tomorrow = getDateKeyForOffset(1);
    await db.runAsync(
      'INSERT OR IGNORE INTO appointments (id, client_id, professional_id, service_id, date, start_time, status, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      'appointment-demo-cut',
      'client-demo',
      'professional-demo',
      'service-cut',
      tomorrow,
      '10:00',
      'pending',
      'Primera visita',
      createdAt,
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO appointments (id, client_id, professional_id, service_id, date, start_time, status, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      'appointment-demo-beard',
      'client-lucia',
      'professional-demo',
      'service-beard',
      tomorrow,
      '14:00',
      'confirmed',
      null,
      createdAt,
    );
    await db.runAsync(
      'INSERT OR IGNORE INTO appointments (id, client_id, professional_id, service_id, date, start_time, status, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      'appointment-demo-client-alma',
      'client-demo',
      'professional-alma',
      'service-color',
      tomorrow,
      '11:00',
      'confirmed',
      null,
      createdAt,
    );
  });
  await refreshAvailability(db);
}

export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `glowbook-local-demo:${password}`,
  );
}
