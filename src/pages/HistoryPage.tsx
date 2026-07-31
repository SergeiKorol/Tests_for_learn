import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ResultRecord } from '@/domain/types';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  clearAllResults,
  getTestStatistics,
  listAllResults,
} from '@/services/historyService';

/** Раздел истории (FR-025–FR-028) */
export function HistoryPage() {
  const { t } = useTranslation();
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [statsMap, setStatsMap] = useState<Map<string, Awaited<ReturnType<typeof getTestStatistics>>>>(new Map());
  const [confirmClear, setConfirmClear] = useState(false);

  const load = async () => {
    const all = await listAllResults();
    setResults(all);
    const testIds = [...new Set(all.map((r) => r.testId))];
    const map = new Map<string, Awaited<ReturnType<typeof getTestStatistics>>>();
    for (const id of testIds) {
      map.set(id, await getTestStatistics(id));
    }
    setStatsMap(map);
  };

  useEffect(() => {
    void load();
  }, []);

  const handleClear = async () => {
    await clearAllResults();
    setConfirmClear(false);
    await load();
  };

  if (results.length === 0) {
    return (
      <div>
        <h1>{t('history.title')}</h1>
        <p>{t('history.empty')}</p>
      </div>
    );
  }

  const seenStats = new Set<string>();

  return (
    <div>
      <h1>{t('history.title')}</h1>
      <button type="button" className="btn btn-danger" onClick={() => setConfirmClear(true)}>
        {t('history.clear')}
      </button>
      <ul className="test-list" style={{ marginTop: '1rem' }}>
        {results.map((r) => (
          <li key={r.id} className="card">
            {(() => {
              const stats = statsMap.get(r.testId);
              const showStats = stats && !seenStats.has(r.testId);
              if (showStats) seenStats.add(r.testId);
              return showStats && stats ? (
                <p className="text-muted">
                  {t('history.stats', {
                    count: stats.attemptCount,
                    avg: stats.averagePercent,
                    best: stats.bestPercent,
                    worst: stats.worstPercent,
                  })}
                </p>
              ) : null;
            })()}
            <strong>{r.testTitle}</strong>
            <p className="text-muted">
              {new Date(r.completedAt).toLocaleString()} — {r.score}/{r.totalQuestions} ({r.percent}
              %)
            </p>
            {r.id != null && (
              <Link to={`/history/${r.id}`}>{t('history.detail')}</Link>
            )}
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={confirmClear}
        message={t('history.clearConfirm')}
        onConfirm={() => void handleClear()}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
