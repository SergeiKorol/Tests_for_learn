import { describe, expect, it } from 'vitest';
import { parseTestData, validateCatalogUrl } from '@/domain/validation';

describe('validation', () => {
  it('parses valid test', () => {
    const data = parseTestData({
      id: 't1',
      title: 'T',
      version: 1,
      timeLimit: 0,
      questions: [{ id: 'q1', text: 'Q', options: ['a', 'b'], correctIndex: 0 }],
    });
    expect(data.id).toBe('t1');
  });

  it('rejects invalid catalog url', () => {
    expect(() => validateCatalogUrl('http://bad.com')).toThrow();
  });
});
