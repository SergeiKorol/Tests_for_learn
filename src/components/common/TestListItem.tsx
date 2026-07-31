import { useTranslation } from 'react-i18next';
import type { TestRecord } from '@/domain/types';
import { Link } from 'react-router-dom';

interface TestListItemProps {
  test: TestRecord;
}

/**
 * Элемент списка тестов с badge источника (FR-004).
 */
export function TestListItem({ test }: TestListItemProps) {
  const { t } = useTranslation();
  const badgeKey =
    test.source === 'builtin'
      ? 'test.builtin'
      : test.source === 'imported'
        ? 'test.imported'
        : 'test.downloaded';

  return (
    <li className="card test-list-item">
      <div>
        <strong className="text-truncate">{test.title}</strong>
        <div>
          <span className={`badge ${test.builtin ? 'badge-primary' : ''}`}>
            {t(badgeKey)}
          </span>
        </div>
        {test.data.description && (
          <p className="text-muted">{test.data.description}</p>
        )}
      </div>
      <Link to={`/quiz/${test.id}`} className="btn">
        {t('test.start')}
      </Link>
    </li>
  );
}
