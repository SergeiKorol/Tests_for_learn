/**
 * Zod-схемы валидации JSON (contracts/test-schema, catalog-schema).
 */
import { z } from 'zod';
import type { CatalogEntry, TestData } from './types';

const questionSchema = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    correctIndex: z.number().int().min(0),
  })
  .superRefine((q, ctx) => {
    if (q.correctIndex >= q.options.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `correctIndex ${q.correctIndex} вне диапазона options`,
      });
    }
  });

export const testDataSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .regex(/^[a-z0-9_-]+$|^__builtin_welcome__$/),
    title: z.string().min(1),
    description: z.string().optional(),
    version: z.number().int().min(1),
    timeLimit: z.number().int().min(0),
    questions: z.array(questionSchema).min(1),
  })
  .superRefine((test, ctx) => {
    const ids = test.questions.map((q) => q.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'question.id должны быть уникальны внутри теста',
      });
    }
  });

export const catalogEntrySchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9_-]+$/),
  title: z.string().min(1),
  description: z.string().optional(),
  version: z.number().int().min(1),
  questionsCount: z.number().int().min(1),
  filename: z.string().min(1).optional(),
});

export const catalogSchema = z.array(catalogEntrySchema);

/**
 * Парсит и валидирует JSON теста.
 *
 * @param data - Неизвестный объект после JSON.parse
 * @returns Валидный TestData
 * @throws Error с понятным сообщением для UI
 */
export function parseTestData(data: unknown): TestData {
  const result = testDataSchema.safeParse(data);
  if (!result.success) {
    const msg = result.error.errors.map((e) => e.message).join('; ');
    throw new Error(`Неверный формат теста: ${msg}`);
  }
  return result.data;
}

/**
 * Парсит index.json каталога; дубликаты id игнорируются (первая запись).
 */
export function parseCatalog(data: unknown): CatalogEntry[] {
  const result = catalogSchema.safeParse(data);
  if (!result.success) {
    throw new Error('Неверный формат каталога index.json');
  }
  const seen = new Set<string>();
  const unique: CatalogEntry[] = [];
  for (const entry of result.data) {
    if (!seen.has(entry.id)) {
      seen.add(entry.id);
      unique.push(entry);
    }
  }
  return unique;
}

/**
 * Проверяет, что URL источника начинается с https://.
 */
export function validateCatalogUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed.startsWith('https://')) {
    throw new Error('URL должен начинаться с https://');
  }
  return trimmed;
}
