import { test, expect } from '@playwright/test';

test('check new tests disabled when offline', async ({ page, context }) => {
  await page.goto('/');
  await context.setOffline(true);
  const btn = page.getByRole('button', { name: /Проверить новые|Check for new/i });
  await expect(btn).toBeDisabled();
});
