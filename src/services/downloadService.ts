/**
 * Пакетное скачивание тестов с прогрессом (FR-010, FR-011, FR-009a).
 */
import type { CatalogEntry } from '@/domain/types';
import { parseTestData } from '@/domain/validation';
import { deleteResultsByTestId } from '@/storage/resultRepository';
import { getTestById, upsertTestFromData } from '@/storage/testRepository';
import { getCatalogBaseUrl } from '@/storage/settingsRepository';
import { resolveTestFileUrl } from './catalogService';

export interface DownloadProgress {
  current: number;
  total: number;
  currentTitle: string;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

/**
 * Скачивает один тест; при обновлении version удаляет историю если wipeHistory=true.
 */
export async function downloadTestEntry(
  entry: CatalogEntry,
  baseUrl?: string,
  wipeHistory = false,
): Promise<void> {
  const local = await getTestById(entry.id);
  if (local && entry.version > local.version && wipeHistory) {
    await deleteResultsByTestId(entry.id);
  }

  const catalogUrl = baseUrl ?? (await getCatalogBaseUrl());
  const fileUrl = resolveTestFileUrl(catalogUrl, entry);
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить «${entry.title}» (${response.status})`);
  }
  const json: unknown = await response.json();
  const data = parseTestData(json);
  if (data.id !== entry.id) {
    throw new Error(`id в файле не совпадает с каталогом для «${entry.title}»`);
  }
  await upsertTestFromData(data, {
    builtin: false,
    source: 'downloaded',
  });
}

/**
 * Скачивает несколько тестов; при ошибке одного — продолжает остальные.
 */
export async function downloadTestsBatch(
  entries: CatalogEntry[],
  onProgress: ProgressCallback,
  options?: { baseUrl?: string; wipeHistoryForIds?: Set<string> },
): Promise<{ succeeded: string[]; failed: Array<{ id: string; error: string }> }> {
  const succeeded: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];
  const total = entries.length;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    onProgress({ current: i + 1, total, currentTitle: entry.title });
    try {
      const wipe = options?.wipeHistoryForIds?.has(entry.id) ?? false;
      await downloadTestEntry(entry, options?.baseUrl, wipe);
      succeeded.push(entry.id);
    } catch (e) {
      failed.push({
        id: entry.id,
        error: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }
  return { succeeded, failed };
}

/** @returns id тестов с более новой version в каталоге */
export async function findUpgradeCandidates(entries: CatalogEntry[]): Promise<string[]> {
  const ids: string[] = [];
  for (const entry of entries) {
    const local = await getTestById(entry.id);
    if (local && entry.version > local.version) {
      ids.push(entry.id);
    }
  }
  return ids;
}
