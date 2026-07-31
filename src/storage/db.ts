/**
 * Dexie database schema v1.
 */
import Dexie, { type Table } from 'dexie';
import type { ResultRecord, SettingRecord, TestRecord } from '@/domain/types';

export class QuizDatabase extends Dexie {
  tests!: Table<TestRecord, string>;
  results!: Table<ResultRecord, number>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super('OfflineQuizApp');
    this.version(1).stores({
      tests: 'id, builtin, source, downloadedAt',
      results: '++id, testId, completedAt',
      settings: 'key',
    });
  }
}

export const db = new QuizDatabase();
