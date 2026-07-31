import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ResultRecord } from '@/domain/types';
import { getResultById } from '@/storage/resultRepository';
import { getTestById } from '@/storage/testRepository';

/** Детали попытки (FR-026) */
export function HistoryDetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const { t } = useTranslation();
  const [result, setResult] = useState<ResultRecord | null>(null);

  useEffect(() => {
    void (async () => {
      const id = Number(resultId);
      if (Number.isNaN(id)) return;
      const r = await getResultById(id);
      setResult(r ?? null);
    })();
  }, [resultId]);

  useEffect(() => {
    void (async () => {
      if (!result) return;
      await getTestById(result.testId);
    })();
  }, [result]);

  if (!result) {
    return <p>{t('app.loading')}</p>;
  }

  return (
    <div>
      <h1>{t('history.detail')}</h1>
      <p>
        <strong>{result.testTitle}</strong> — {new Date(result.completedAt).toLocaleString()}
      </p>
      <p>
        {result.score}/{result.totalQuestions} ({result.percent}%)
      </p>
      <ul className="test-list">
        {result.answersSnapshot.map((a) => (
          <li key={a.questionId} className="card">
            <p>{a.questionId}</p>
            <p className="text-muted">
              {t('result.yourAnswer')}:{' '}
              {a.chosenIndex === null ? t('result.skipped') : String(a.chosenIndex)}
            </p>
          </li>
        ))}
      </ul>
      <Link to="/history">{t('test.back')}</Link>
    </div>
  );
}
