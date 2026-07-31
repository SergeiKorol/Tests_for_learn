/**
 * CRUD для таблицы tests.
 */
import type { TestData, TestRecord, TestSource } from '@/domain/types';
import { db } from './db';

export interface UpsertTestOptions {
  builtin: boolean;
  source: TestSource;
  downloadedAt?: Date;
}

/**
 * Создаёт или обновляет запись теста из TestData.
 */
export async function upsertTestFromData(
  data: TestData,
  options: UpsertTestOptions,
): Promise<TestRecord> {
  const record: TestRecord = {
    id: data.id,
    title: data.title,
    version: data.version,
    data,
    builtin: options.builtin,
    source: options.source,
    downloadedAt: options.downloadedAt ?? new Date(),
  };
  await db.tests.put(record);
  return record;
}

/** @returns Все тесты, отсортированные по title */
export async function listTests(): Promise<TestRecord[]> {
  const tests = await db.tests.toArray();
  return tests.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
}

/** @returns Тест по id или undefined */
export async function getTestById(id: string): Promise<TestRecord | undefined> {
  return db.tests.get(id);
}

/** Удаляет тест по id */
export async function deleteTestById(id: string): Promise<void> {
  await db.tests.delete(id);
}

/** Удаляет все не-vbuiltin тесты */
export async function deleteAllNonBuiltinTests(): Promise<void> {
  await db.tests.filter((t) => !t.builtin).delete();
}

/** Удаляет все тесты */
export async function deleteAllTests(): Promise<void> {
  await db.tests.clear();
}
