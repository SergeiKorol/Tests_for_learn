/**
 * Импорт теста из JSON-файла (FR-017–FR-019).
 */
import type { TestData } from '@/domain/types';
import { parseTestData } from '@/domain/validation';
import { deleteResultsByTestId } from '@/storage/resultRepository';
import { getTestById, upsertTestFromData } from '@/storage/testRepository';

/**
 * Читает и парсит JSON-файл с диска.
 */
export function readTestFile(file: File): Promise<TestData> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      reject(new Error('Выберите файл .json'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json: unknown = JSON.parse(String(reader.result));
        resolve(parseTestData(json));
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Ошибка чтения файла'));
      }
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsText(file);
  });
}

/**
 * Импортирует тест; при overwrite удаляет историю (FR-019).
 */
export async function importTest(data: TestData, overwrite: boolean): Promise<void> {
  const existing = await getTestById(data.id);
  if (existing && !overwrite) {
    throw new Error('CONFLICT');
  }
  if (existing && overwrite) {
    await deleteResultsByTestId(data.id);
  }
  await upsertTestFromData(data, {
    builtin: data.id === '__builtin_welcome__',
    source: data.id === '__builtin_welcome__' ? 'builtin' : 'imported',
  });
}

/** @returns true если тест с таким id уже существует */
export async function testExists(id: string): Promise<boolean> {
  return (await getTestById(id)) !== undefined;
}
