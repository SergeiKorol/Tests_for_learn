/**
 * Инициализация хранилища: seed builtin только при пустой БД (FR-001, FR-033).
 */
import { BUILTIN_WELCOME_TEST } from '@/domain/builtinTest';
import { BUILTIN_TEST_ID } from '@/domain/types';
import { db } from './db';
import { seedDefaultSettings } from './settingsRepository';
import { upsertTestFromData } from './testRepository';

/**
 * Инициализирует IndexedDB и при первом запуске добавляет welcome-тест.
 */
export async function initializeStorage(): Promise<void> {
  await db.open();
  await seedDefaultSettings();
  const count = await db.tests.count();
  if (count === 0) {
    await upsertTestFromData(BUILTIN_WELCOME_TEST, {
      builtin: true,
      source: 'builtin',
    });
  }
}

/**
 * Восстанавливает встроенный тест (FR-031, FR-032).
 */
export async function restoreBuiltinTest(): Promise<void> {
  const existing = await db.tests.get(BUILTIN_TEST_ID);
  if (!existing) {
    await upsertTestFromData(BUILTIN_WELCOME_TEST, {
      builtin: true,
      source: 'builtin',
    });
  }
}
