/**
 * История и статистика попыток (FR-025–FR-028).
 */
import type { ResultRecord, TestStatistics } from '@/domain/types';
import {
  clearAllResults,
  listAllResults,
  listResultsByTestId,
} from '@/storage/resultRepository';

export { clearAllResults, listAllResults, listResultsByTestId };

/**
 * Сводная статистика по testId (FR-027).
 */
export async function getTestStatistics(testId: string): Promise<TestStatistics | null> {
  const results = await listResultsByTestId(testId);
  if (results.length === 0) return null;
  const percents = results.map((r) => r.percent);
  return {
    testId,
    attemptCount: results.length,
    averagePercent: Math.round(percents.reduce((a, b) => a + b, 0) / percents.length),
    bestPercent: Math.max(...percents),
    worstPercent: Math.min(...percents),
  };
}

/**
 * Группирует попытки по testId для отображения сводок.
 */
export async function groupResultsByTest(): Promise<Map<string, ResultRecord[]>> {
  const all = await listAllResults();
  const map = new Map<string, ResultRecord[]>();
  for (const r of all) {
    const list = map.get(r.testId) ?? [];
    list.push(r);
    map.set(r.testId, list);
  }
  return map;
}
