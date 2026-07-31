/**
 * Загрузка и сравнение каталога index.json (FR-006–FR-009).
 */
import type { CatalogEntry, CatalogItemWithStatus } from '@/domain/types';
import { parseCatalog } from '@/domain/validation';
import { getCatalogBaseUrl } from '@/storage/settingsRepository';
import { getTestById } from '@/storage/testRepository';

/**
 * Формирует URL файла теста относительно базового URL.
 */
export function resolveTestFileUrl(baseUrl: string, entry: CatalogEntry): string {
  const path = entry.filename ?? `tests/${entry.id}.json`;
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * Загружает index.json из настроенного источника.
 */
export async function fetchCatalog(baseUrl?: string): Promise<CatalogEntry[]> {
  const url = `${(baseUrl ?? (await getCatalogBaseUrl())).replace(/\/+$/, '')}/index.json`;
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Нет подключения к интернету');
  }
  if (!response.ok) {
    throw new Error(`Каталог недоступен (${response.status})`);
  }
  const json: unknown = await response.json();
  const catalog = parseCatalog(json);
  if (catalog.length === 0) {
    throw new Error('Новых тестов не найдено');
  }
  return catalog;
}

/**
 * Сравнивает каталог с локальными тестами.
 */
export async function compareCatalogWithLocal(
  catalog: CatalogEntry[],
): Promise<CatalogItemWithStatus[]> {
  const items: CatalogItemWithStatus[] = [];
  for (const entry of catalog) {
    const local = await getTestById(entry.id);
    const status =
      !local || entry.version > local.version ? 'available' : 'up_to_date';
    items.push({ ...entry, status });
  }
  return items;
}

/**
 * @returns true если браузер offline
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}
