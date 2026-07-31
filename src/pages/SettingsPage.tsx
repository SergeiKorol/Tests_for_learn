import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Locale, Theme } from '@/domain/types';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  deleteAllDownloadedAndHistory,
  getCatalogBaseUrl,
  resetAllSettings,
  setCatalogBaseUrl,
  setLocale,
  setTheme,
} from '@/services/settingsService';
import { importTest, readTestFile, testExists } from '@/services/importService';
import { listResultsByTestId } from '@/storage/resultRepository';

interface SettingsPageProps {
  theme: Theme;
  locale: Locale;
  onThemeChange: (theme: Theme) => void;
  onLocaleChange: (locale: Locale) => void;
}

/** Настройки приложения (FR-029–FR-033, FR-017) */
export function SettingsPage({
  theme,
  locale,
  onThemeChange,
  onLocaleChange,
}: SettingsPageProps) {
  const { t, i18n } = useTranslation();
  const [catalogUrl, setCatalogUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importConflict, setImportConflict] = useState<File | null>(null);
  const [importWipeConfirm, setImportWipeConfirm] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void getCatalogBaseUrl().then(setCatalogUrl);
  }, []);

  const saveUrl = async () => {
    try {
      const normalized = await setCatalogBaseUrl(catalogUrl);
      setCatalogUrl(normalized);
      setUrlError(null);
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : t('settings.urlError'));
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const data = await readTestFile(file);
      const exists = await testExists(data.id);
      if (exists) {
        setImportConflict(file);
        return;
      }
      await importTest(data, false);
    } catch (e) {
      if (e instanceof Error && e.message === 'CONFLICT') {
        setImportConflict(file);
        return;
      }
      setUrlError(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const overwriteImport = async (file: File) => {
    const data = await readTestFile(file);
    const results = await listResultsByTestId(data.id);
    if (results.length > 0) {
      setImportWipeConfirm(file);
      setImportConflict(null);
      return;
    }
    await importTest(data, true);
    setImportConflict(null);
  };

  return (
    <div>
      <h1>{t('settings.title')}</h1>

      <div className="form-field">
        <label>{t('settings.theme')}</label>
        <select
          value={theme}
          onChange={(e) => {
            const th = e.target.value as Theme;
            void setTheme(th);
            onThemeChange(th);
          }}
        >
          <option value="light">{t('settings.themeLight')}</option>
          <option value="dark">{t('settings.themeDark')}</option>
        </select>
      </div>

      <div className="form-field">
        <label>{t('settings.language')}</label>
        <select
          value={locale}
          onChange={(e) => {
            const loc = e.target.value as Locale;
            void setLocale(loc);
            void i18n.changeLanguage(loc);
            onLocaleChange(loc);
          }}
        >
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="catalog-url">{t('settings.catalogUrl')}</label>
        <input
          id="catalog-url"
          type="url"
          value={catalogUrl}
          onChange={(e) => setCatalogUrl(e.target.value)}
        />
        <button type="button" className="btn" onClick={() => void saveUrl()}>
          {t('settings.saveUrl')}
        </button>
        {urlError && <span className="alert alert-error">{urlError}</span>}
      </div>

      <div className="form-field">
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleImportFile(f);
            e.target.value = '';
          }}
        />
        <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
          {t('settings.import')}
        </button>
      </div>

      <div className="actions-row">
        <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
          {t('settings.deleteAll')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setConfirmReset(true)}>
          {t('settings.reset')}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        message={t('settings.deleteAllConfirm')}
        onConfirm={() => {
          setConfirmDelete(false);
          void deleteAllDownloadedAndHistory();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={confirmReset}
        message={t('settings.resetConfirm')}
        onConfirm={() => {
          setConfirmReset(false);
          void resetAllSettings();
        }}
        onCancel={() => setConfirmReset(false)}
      />
      <ConfirmDialog
        open={!!importConflict}
        message={`${t('settings.importOverwrite')} ${t('settings.importHistoryWarning')}`}
        onConfirm={() => {
          if (importConflict) void overwriteImport(importConflict);
        }}
        onCancel={() => setImportConflict(null)}
      />
      <ConfirmDialog
        open={!!importWipeConfirm}
        message={t('settings.importHistoryWarning')}
        onConfirm={() => {
          if (importWipeConfirm) {
            void readTestFile(importWipeConfirm).then((data) => importTest(data, true));
          }
          setImportWipeConfirm(null);
        }}
        onCancel={() => setImportWipeConfirm(null)}
      />
    </div>
  );
}
