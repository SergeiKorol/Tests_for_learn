/**
 * Настройки: сброс, удаление данных, URL каталога (FR-029–FR-033).
 */
import { restoreBuiltinTest } from '@/storage/initStorage';
import { clearAllResults } from '@/storage/resultRepository';
import {
  getCatalogBaseUrl,
  resetSettingsToDefaults,
  setCatalogBaseUrl,
  setLocale,
  setTheme,
} from '@/storage/settingsRepository';
import { deleteAllTests } from '@/storage/testRepository';

export {
  getCatalogBaseUrl,
  setCatalogBaseUrl,
  setTheme,
  setLocale,
  resetSettingsToDefaults,
};

/**
 * Удаляет все скачанные тесты и историю; восстанавливает builtin (FR-031).
 */
export async function deleteAllDownloadedAndHistory(): Promise<void> {
  await clearAllResults();
  await deleteAllTests();
  await restoreBuiltinTest();
}

/**
 * Сброс настроек + восстановление builtin если отсутствует (FR-032).
 */
export async function resetAllSettings(): Promise<void> {
  await resetSettingsToDefaults();
  await restoreBuiltinTest();
}
