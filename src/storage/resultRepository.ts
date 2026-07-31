/**
 * CRUD для таблицы results.
 */
import type { ResultRecord } from '@/domain/types';
import { db } from './db';

/**
 * Сохраняет попытку прохождения.
 */
export async function saveResult(result: Omit<ResultRecord, 'id'>): Promise<number> {
  return db.results.add(result as ResultRecord);
}

/** @returns Попытки по testId, новые первыми */
export async function listResultsByTestId(testId: string): Promise<ResultRecord[]> {
  return db.results.where('testId').equals(testId).reverse().sortBy('completedAt');
}

/** @returns Все попытки, новые первыми */
export async function listAllResults(): Promise<ResultRecord[]> {
  return db.results.orderBy('completedAt').reverse().toArray();
}

/** @returns Попытка по id */
export async function getResultById(id: number): Promise<ResultRecord | undefined> {
  return db.results.get(id);
}

/** Удаляет все попытки по testId (FR-009a, FR-019) */
export async function deleteResultsByTestId(testId: string): Promise<void> {
  await db.results.where('testId').equals(testId).delete();
}

/** Очищает всю историю (FR-028) */
export async function clearAllResults(): Promise<void> {
  await db.results.clear();
}
