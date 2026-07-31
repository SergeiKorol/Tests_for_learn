import { useTranslation } from 'react-i18next';
import type { DownloadProgress as DownloadProgressType } from '@/services/downloadService';

interface DownloadProgressProps {
  progress: DownloadProgressType | null;
}

/** Индикатор прогресса скачивания (FR-011) */
export function DownloadProgress({ progress }: DownloadProgressProps) {
  const { t } = useTranslation();
  if (!progress) return null;
  return (
    <div className="card" aria-live="polite">
      <div className="spinner" style={{ marginBottom: '0.5rem' }} />
      <p>
        {t('catalog.downloading', {
          current: progress.current,
          total: progress.total,
          title: progress.currentTitle,
        })}
      </p>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${(progress.current / progress.total) * 100}%` }}
        />
      </div>
    </div>
  );
}
