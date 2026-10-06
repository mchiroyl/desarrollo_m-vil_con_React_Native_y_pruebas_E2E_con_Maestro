import { DatabaseSync } from 'node:sqlite';

// Exercise the actual SQL against SQLite; only the native async bridge is adapted.
export class LocalDatabase {
  constructor(path = ':memory:') {
    this.connection = new DatabaseSync(path);
  }
  async execAsync(sql) {
    this.connection.exec(sql);
  }
  parameters(values) {
    return values.length === 1 && Array.isArray(values[0]) ? values[0] : values;
  }
  async runAsync(sql, ...values) {
    return this.connection.prepare(sql).run(...this.parameters(values));
  }
  async getFirstAsync(sql, ...values) {
    return this.connection.prepare(sql).get(...this.parameters(values)) ?? null;
  }
  async getAllAsync(sql, ...values) {
    return this.connection.prepare(sql).all(...this.parameters(values));
  }
  async withTransactionAsync(task) {
    this.connection.exec('BEGIN IMMEDIATE');
    try {
      await task();
      this.connection.exec('COMMIT');
    } catch (error) {
      this.connection.exec('ROLLBACK');
      throw error;
    }
  }
  async withExclusiveTransactionAsync(task) {
    await this.withTransactionAsync(() => task(this));
  }
  close() {
    this.connection.close();
  }
}
