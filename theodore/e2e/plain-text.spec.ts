import { test, expect } from '@playwright/test';
import { PLACEHOLDER } from './constant';
import { undoShortcut } from './utils';

test('typing hello shows hello in plain text preview', async ({ page }) => {
  await page.goto('/');

  const editor = page.getByTestId('editor');
  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  await expect(page.getByTestId('plain-text-preview')).toHaveText('hello');
});

test('incremental undo restores plain text and shows placeholder when empty', async ({
  page,
}) => {
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  await expect(preview).toHaveText('hello');

  await page.keyboard.press(undoShortcut());
  await expect(preview).toHaveText('hell');

  await page.keyboard.press(undoShortcut());
  await expect(preview).toHaveText('hel');

  await page.keyboard.press(undoShortcut());
  await expect(preview).toHaveText('he');

  await page.keyboard.press(undoShortcut());
  await expect(preview).toHaveText('h');

  await page.keyboard.press(undoShortcut());
  await expect(preview).toHaveText('');

  await expect(page.getByText(PLACEHOLDER, { exact: true })).toBeVisible();
});

test('undo on empty editor does not crash', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (err) => {
    pageErrors.push(err);
  });

  await page.goto('/');

  const editor = page.getByTestId('editor');
  await editor.click();

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press(undoShortcut());
  }

  expect(pageErrors).toEqual([]);
  await expect(editor).toBeVisible();
  await expect(page.getByTestId('plain-text-preview')).toHaveText('');
  await expect(page.getByText(PLACEHOLDER, { exact: true })).toBeVisible();
});
