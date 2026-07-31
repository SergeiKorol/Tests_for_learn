import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CatalogItemWithStatus } from '@/domain/types';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DownloadProgress } from './DownloadProgress';
import {
  downloadTestsBatch,
  findUpgradeCandidates,
  type DownloadProgress as DownloadProgressType,
} from '@/services/downloadService';
import { listResultsByTestId } from '@/storage/resultRepository';

interface CatalogModalProps {
  items: CatalogItemWithStatus[];
  onClose: () => void;
  onDownloaded: () => void;
}

/**
 * Модальное окно каталога с чекбоксами (FR-039).
 */
export function CatalogModal({ items, onClose, onDownloaded }: CatalogModalProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    items.filter((i) => i.status === 'available').forEach((i) => s.add(i.id));
    return s;
  });
  const [progress, setProgress] = useState<DownloadProgressType | null>(null);
  const [pendingWipe, setPendingWipe] = useState<CatalogItemWithStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getEntriesToDownload = () => items.filter((i) => selected.has(i.id));

  const runDownload = async (wipeIds: Set<string>) => {
    const entries = getEntriesToDownload();
    if (entries.length === 0) return;
    setError(null);
    setProgress({ current: 0, total: entries.length, currentTitle: '…' });
    const result = await downloadTestsBatch(entries, setProgress, {
      wipeHistoryForIds: wipeIds,
    });
    setProgress(null);
    if (result.failed.length > 0) {
      setError(result.failed.map((f) => f.error).join('; '));
    }
    if (result.succeeded.length > 0) {
      onDownloaded();
    }
  };

  const handleDownload = async () => {
    const entries = getEntriesToDownload();
    const upgrades = await findUpgradeCandidates(entries);
    const withHistory: CatalogItemWithStatus[] = [];
    for (const id of upgrades) {
      const results = await listResultsByTestId(id);
      if (results.length > 0) {
        const item = items.find((i) => i.id === id);
        if (item) withHistory.push(item);
      }
    }
    if (withHistory.length > 0) {
      setPendingWipe(withHistory);
      return;
    }
    await runDownload(new Set());
  };

  const confirmWipe = async () => {
    const ids = new Set(pendingWipe?.map((i) => i.id) ?? []);
    setPendingWipe(null);
    await runDownload(ids);
  };

  const downloadAllNew = () => {
    const ids = new Set(items.filter((i) => i.status === 'available').map((i) => i.id));
    setSelected(ids);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>{t('catalog.title')}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <DownloadProgress progress={progress} />
        <ul className="test-list">
          {items.map((item) => (
            <li key={item.id} className="card test-list-item">
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  disabled={item.status === 'up_to_date'}
                  onChange={() => toggle(item.id)}
                />
                <span>
                  <strong>{item.title}</strong>
                  <br />
                  <span className="text-muted">
                    {item.status === 'available'
                      ? t('catalog.available')
                      : t('catalog.upToDate')}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="actions-row">
          <button type="button" className="btn btn-secondary" onClick={downloadAllNew}>
            {t('catalog.downloadAllNew')}
          </button>
          <button
            type="button"
            className="btn"
            disabled={!!progress || selected.size === 0}
            onClick={() => void handleDownload()}
          >
            {t('catalog.downloadSelected')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('catalog.close')}
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={!!pendingWipe?.length}
        message={
          pendingWipe
            ? t('catalog.historyWipeWarning', { title: pendingWipe.map((p) => p.title).join(', ') })
            : ''
        }
        onConfirm={() => void confirmWipe()}
        onCancel={() => setPendingWipe(null)}
      />
    </div>
  );
}
