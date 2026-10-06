import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import '../support/register.mjs';
import { LocalDatabase } from '../support/sqlite.mjs';
const { initializeDatabase } = await import('../../src/data/database.ts');
const {
  createAppointment,
  getAvailableSlots,
  getCurrentUser,
  setAppointmentStatus,
  signIn,
  signOut,
  signUp,
} = await import('../../src/data/repository.ts');
import { getDateKeyForOffset } from '../../src/utils/date.ts';

async function database(t) {
  const db = new LocalDatabase();
  t.after(() => db.close());
  await initializeDatabase(db);
  return db;
}

test('seed is idempotent and refreshes future availability after time passes', async (t) => {
  const db = await database(t);
  await db.runAsync(
    "UPDATE availability SET id = 'old-' || id, date = '2020-01-01', start_time = id",
  );
  await initializeDatabase(db);
  assert.equal((await db.getFirstAsync('SELECT COUNT(*) AS count FROM users')).count, 6);
  assert.ok(
    (await getAvailableSlots(db, 'professional-demo', getDateKeyForOffset(1), 'service-cut'))
      .length > 0,
  );
});

test('client cannot overlap appointments with different professionals', async (t) => {
  const db = await database(t);
  await signIn(db, 'cliente@glowbook.app', 'Glowbook2026!', 'client');
  await assert.rejects(
    createAppointment(db, {
      clientId: 'client-demo',
      serviceId: 'service-color',
      date: getDateKeyForOffset(1),
      startTime: '10:00',
    }),
    /Ya tienes una cita/,
  );
});

test('confirmed appointment can be cancelled only by its professional', async (t) => {
  const db = await database(t);
  await signIn(db, 'profesional@glowbook.app', 'Glowbook2026!', 'professional');
  await setAppointmentStatus(db, 'appointment-demo-cut', 'professional-demo', 'confirmed');
  await setAppointmentStatus(db, 'appointment-demo-cut', 'professional-demo', 'cancelled');
  assert.equal(
    (await db.getFirstAsync('SELECT status FROM appointments WHERE id = ?', 'appointment-demo-cut'))
      .status,
    'cancelled',
  );
});

test('unauthenticated writes and impersonation are rejected', async (t) => {
  const db = await database(t);
  const input = {
    clientId: 'client-demo',
    serviceId: 'service-cut',
    date: getDateKeyForOffset(1),
    startTime: '09:00',
  };
  await assert.rejects(createAppointment(db, input), /Inicia sesión/);
  await signIn(db, 'cliente@glowbook.app', 'Glowbook2026!', 'client');
  await assert.rejects(
    createAppointment(db, { ...input, clientId: 'client-lucia' }),
    /Inicia sesión/,
  );
});

test('registration validates email and replaces a previous local session atomically', async (t) => {
  const db = await database(t);
  await assert.rejects(
    signUp(db, { name: 'Prueba', email: 'invalid@', password: 'Glowbook2026!', role: 'client' }),
    /Completa los datos/,
  );
  await signIn(db, 'cliente@glowbook.app', 'Glowbook2026!', 'client');
  const user = await signUp(db, {
    name: 'Nueva cuenta',
    email: 'new@glowbook.app',
    password: 'Glowbook2026!',
    role: 'client',
  });
  assert.equal((await getCurrentUser(db)).id, user.id);
});

test('a successful booking persists and cancelled slots become available again', async (t) => {
  const db = await database(t);
  await signIn(db, 'cliente@glowbook.app', 'Glowbook2026!', 'client');
  const input = {
    clientId: 'client-demo',
    serviceId: 'service-beard',
    date: getDateKeyForOffset(2),
    startTime: '09:00',
  };
  const id = await createAppointment(db, input);
  assert.equal(
    (await db.getFirstAsync('SELECT status FROM appointments WHERE id = ?', id)).status,
    'pending',
  );
  await assert.rejects(createAppointment(db, input), /horario/);
  await signOut(db);
  await signIn(db, 'profesional@glowbook.app', 'Glowbook2026!', 'professional');
  await setAppointmentStatus(db, id, 'professional-demo', 'cancelled');
  assert.ok(
    (await getAvailableSlots(db, 'professional-demo', input.date, input.serviceId)).some(
      (slot) => slot.startTime === '09:00',
    ),
  );
});

test('migration preserves session, users and appointment statuses', async (t) => {
  const db = await database(t);
  await signIn(db, 'profesional@glowbook.app', 'Glowbook2026!', 'professional');
  await setAppointmentStatus(db, 'appointment-demo-cut', 'professional-demo', 'cancelled');
  await db.execAsync('PRAGMA user_version = 1');
  await initializeDatabase(db);
  assert.equal((await db.getFirstAsync('PRAGMA user_version')).user_version, 2);
  assert.equal((await getCurrentUser(db)).id, 'professional-demo');
  assert.equal(
    (await db.getFirstAsync('SELECT status FROM appointments WHERE id = ?', 'appointment-demo-cut'))
      .status,
    'cancelled',
  );
});

test('session and booking survive closing and reopening the SQLite file', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'glowbook-sqlite-'));
  const file = join(directory, 'test.db');
  let db = new LocalDatabase(file);
  try {
    await initializeDatabase(db);
    await signIn(db, 'cliente@glowbook.app', 'Glowbook2026!', 'client');
    const id = await createAppointment(db, {
      clientId: 'client-demo',
      serviceId: 'service-cut',
      date: getDateKeyForOffset(2),
      startTime: '09:00',
    });
    db.close();
    db = new LocalDatabase(file);
    await initializeDatabase(db);
    assert.equal((await getCurrentUser(db)).id, 'client-demo');
    assert.equal(
      (await db.getFirstAsync('SELECT status FROM appointments WHERE id = ?', id)).status,
      'pending',
    );
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('new professional has a bookable demo service and availability', async (t) => {
  const db = await database(t);
  const professional = await signUp(db, {
    name: 'Profesional de prueba',
    email: 'new-pro@glowbook.app',
    password: 'Glowbook2026!',
    role: 'professional',
    businessName: 'Estudio demo',
    categoryId: 'cabello',
  });
  const service = await db.getFirstAsync(
    'SELECT id FROM services WHERE professional_id = ?',
    professional.id,
  );
  assert.ok(service);
  assert.ok(
    (await getAvailableSlots(db, professional.id, getDateKeyForOffset(1), service.id)).length > 0,
  );
});

test('SQLite failures roll back writes and keep their actual cause', async (t) => {
  const db = await database(t);
  await signIn(db, 'cliente@glowbook.app', 'Glowbook2026!', 'client');
  await db.execAsync(
    "CREATE TRIGGER simulate_failure BEFORE INSERT ON appointments BEGIN SELECT RAISE(ABORT, 'simulated storage failure'); END;",
  );
  await assert.rejects(
    createAppointment(db, {
      clientId: 'client-demo',
      serviceId: 'service-cut',
      date: getDateKeyForOffset(2),
      startTime: '09:00',
    }),
    /simulated storage failure/,
  );
  assert.equal((await db.getFirstAsync('SELECT COUNT(*) AS count FROM appointments')).count, 3);
});
