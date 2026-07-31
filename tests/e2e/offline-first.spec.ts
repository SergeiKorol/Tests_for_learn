import { test, expect } from '@playwright/test';

test('offline first launch shows welcome test', async ({ page, context }) => {
  await context.addInitScript(() => {
    indexedDB.deleteDatabase('OfflineQuizApp');
  });
  await page.goto('/');
  await expect(page.getByText('Знакомство с приложением')).toBeVisible();
});
