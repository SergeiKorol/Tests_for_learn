import { describe, expect, it, vi, beforeEach } from 'vitest';
import { compareCatalogWithLocal } from '@/services/catalogService';
import type { CatalogEntry } from '@/domain/types';

vi.mock('@/storage/testRepository', () => ({
  getTestById: vi.fn(async (id: string) =>
    id === 'existing' ? { id: 'existing', version: 1 } : undefined,
  ),
}));

describe('catalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks new and upgraded tests as available', async () => {
    const catalog: CatalogEntry[] = [
      { id: 'new', title: 'N', version: 1, questionsCount: 1 },
      { id: 'existing', title: 'E', version: 2, questionsCount: 1 },
    ];
    const result = await compareCatalogWithLocal(catalog);
    expect(result.find((r) => r.id === 'new')?.status).toBe('available');
    expect(result.find((r) => r.id === 'existing')?.status).toBe('available');
  });
});
