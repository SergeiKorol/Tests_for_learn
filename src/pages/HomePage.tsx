import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TestRecord, CatalogItemWithStatus } from '@/domain/types';
import { TestListItem } from '@/components/common/TestListItem';
import { InstallButton } from '@/components/common/InstallButton';
import { CatalogModal } from '@/components/catalog/CatalogModal';
import { listTests } from '@/storage/testRepository';
import {
  compareCatalogWithLocal,
  fetchCatalog,
  isOffline,
} from '@/services/catalogService';

/** Главный экран — список тестов (FR-004, FR-005) */
export function HomePage() {
  const { t } = useTranslation();
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogItems, setCatalogItems] = useState<CatalogItemWithStatus[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const offline = isOffline();

  const reload = useCallback(async () => {
    setTests(await listTests());
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await reload();
      } finally {
        setLoading(false);
      }
    })();
  }, [reload]);

  const handleCheckNew = async () => {
    setCatalogError(null);
    if (isOffline()) {
      setCatalogError(t('app.offlineNoNetwork'));
      return;
    }
    try {
      const catalog = await fetchCatalog();
      const withStatus = await compareCatalogWithLocal(catalog);
      setCatalogItems(withStatus);
    } catch (e) {
      setCatalogError(e instanceof Error ? e.message : t('common.error'));
    }
  };

  if (loading) {
    return <p>{t('app.loading')}</p>;
  }

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p className="text-muted">{t('app.testsCount', { count: tests.length })}</p>
      <InstallButton />
      <div className="actions-row">
        <button
          type="button"
          className="btn"
          onClick={() => void handleCheckNew()}
          disabled={offline}
          title={offline ? t('app.offlineNoNetwork') : undefined}
        >
          {t('app.checkNewTests')}
        </button>
      </div>
      {catalogError && <div className="alert alert-error">{catalogError}</div>}
      <ul className="test-list" style={{ marginTop: '1rem' }}>
        {tests.map((test) => (
          <TestListItem key={test.id} test={test} />
        ))}
      </ul>
      {catalogItems && (
        <CatalogModal
          items={catalogItems}
          onClose={() => setCatalogItems(null)}
          onDownloaded={() => {
            setCatalogItems(null);
            void reload();
          }}
        />
      )}
    </div>
  );
}
