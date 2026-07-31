import { test, expect } from '@playwright/test';

test('quiz flow completes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Начать|Start/i }).first().click();
  await page.getByRole('button', { name: /Завершить|Finish/i }).click();
  const confirm = page.getByRole('button', { name: /Подтвердить|Confirm/i });
  if (await confirm.isVisible()) {
    await confirm.click();
  }
  await expect(page.getByRole('heading', { name: /Результат|Result/i })).toBeVisible();
});
