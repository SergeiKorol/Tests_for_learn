/**
 * Key-value настройки в IndexedDB + синхронизация с localStorage.
 */
import type { Locale, SettingKey, Theme } from '@/domain/types';
import { validateCatalogUrl } from '@/domain/validation';
import { db } from './db';

const DEFAULT_CATALOG_URL =
  import.meta.env.VITE_DEFAULT_CATALOG_URL ??
  'https://raw.githubusercontent.com/OWNER/offline-quiz-tests/main';

const LS_THEME = 'quiz-theme';
const LS_LOCALE = 'quiz-locale';

async function getSetting(key: SettingKey): Promise<string | undefined> {
  const row = await db.settings.get(key);
  return row?.value;
}

async function setSetting(key: SettingKey, value: string): Promise<void> {
  await db.settings.put({ key, value });
}

/** Записывает настройки по умолчанию при первом запуске */
export async function seedDefaultSettings(): Promise<void> {
  if (!(await getSetting('catalogBaseUrl'))) {
    await setSetting('catalogBaseUrl', DEFAULT_CATALOG_URL);
  }
  if (!(await getSetting('theme'))) {
    await setSetting('theme', 'light');
    localStorage.setItem(LS_THEME, 'light');
  }
  if (!(await getSetting('locale'))) {
    await setSetting('locale', 'ru');
    localStorage.setItem(LS_LOCALE, 'ru');
  }
}

export async function getCatalogBaseUrl(): Promise<string> {
  return (await getSetting('catalogBaseUrl')) ?? DEFAULT_CATALOG_URL;
}

export async function setCatalogBaseUrl(url: string): Promise<string> {
  const normalized = validateCatalogUrl(url);
  await setSetting('catalogBaseUrl', normalized);
  return normalized;
}

export async function getTheme(): Promise<Theme> {
  const ls = localStorage.getItem(LS_THEME);
  if (ls === 'dark' || ls === 'light') return ls;
  const dbVal = await getSetting('theme');
  return dbVal === 'dark' ? 'dark' : 'light';
}

export async function setTheme(theme: Theme): Promise<void> {
  localStorage.setItem(LS_THEME, theme);
  await setSetting('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export async function getLocale(): Promise<Locale> {
  const ls = localStorage.getItem(LS_LOCALE);
  if (ls === 'en' || ls === 'ru') return ls;
  const dbVal = await getSetting('locale');
  return dbVal === 'en' ? 'en' : 'ru';
}

export async function setLocale(locale: Locale): Promise<void> {
  localStorage.setItem(LS_LOCALE, locale);
  await setSetting('locale', locale);
}

/** Сброс настроек к значениям по умолчанию (FR-032) */
export async function resetSettingsToDefaults(): Promise<void> {
  await setSetting('catalogBaseUrl', DEFAULT_CATALOG_URL);
  await setTheme('light');
  await setLocale('ru');
}

export function applyThemeToDocument(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export function readThemeFromLocalStorage(): Theme | null {
  const ls = localStorage.getItem(LS_THEME);
  return ls === 'dark' || ls === 'light' ? ls : null;
}

export function readLocaleFromLocalStorage(): Locale | null {
  const ls = localStorage.getItem(LS_LOCALE);
  return ls === 'en' || ls === 'ru' ? ls : null;
}
