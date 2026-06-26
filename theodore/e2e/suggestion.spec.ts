import { expect, type Page, test } from '@playwright/test';
import { expectNoPageErrors, installPageErrorTracking } from './utils';

const SUGGESTION = 'how are you?';

const mockAutocomplete = (page: Page, predict: string = SUGGESTION) =>
  page.route('**/api/autocomplete', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ predict }),
    });
  });

test('should display suggestion text', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);

  await mockAutocomplete(page);

  await page.goto('/chat');

  const editor = page.locator('.theodore_contentEditable');
  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  const ghost = page.locator('.theodore_ghostText');
  await expect(ghost).toBeVisible({ timeout: 5000 });
  await expect(ghost).toHaveText(SUGGESTION);

  expectNoPageErrors(pageErrors);
});

test('should accept suggestion when there is suggestion and user presses tab', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);

  await mockAutocomplete(page);

  await page.goto('/chat');

  const editor = page.locator('.theodore_contentEditable');
  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  const ghost = page.locator('.theodore_ghostText');
  await expect(ghost).toBeVisible({ timeout: 5000 });
  await expect(ghost).toHaveText(SUGGESTION);

  await page.keyboard.press('Tab');

  await expect(ghost).toHaveCount(0);

  const editorText = (await editor.innerText()).replace(/\n/g, '');
  expect(editorText).toBe(`hello${SUGGESTION}`);

  const preview = page.getByTestId('plain-text-preview');
  await expect(preview).toHaveText(`hello${SUGGESTION}`);

  expectNoPageErrors(pageErrors);
});

test('should reject suggestion when user rejects the suggestion by pressing ESC', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);

  await mockAutocomplete(page);

  await page.goto('/chat');

  const editor = page.locator('.theodore_contentEditable');
  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  const ghost = page.locator('.theodore_ghostText');
  await expect(ghost).toBeVisible({ timeout: 5000 });
  await expect(ghost).toHaveText(SUGGESTION);

  await page.keyboard.press('Escape');

  await expect(ghost).toHaveCount(0);

  const editorText = (await editor.innerText()).replace(/\n/g, '');
  expect(editorText).toBe('hello');

  const preview = page.getByTestId('plain-text-preview');
  await expect(preview).toHaveText('hello');

  expectNoPageErrors(pageErrors);
});

test('select all then type a letter replaces the text while a suggestion is shown', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);

  await mockAutocomplete(page);

  await page.goto('/chat');

  const editor = page.locator('.theodore_contentEditable');
  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  const ghost = page.locator('.theodore_ghostText');
  await expect(ghost).toBeVisible({ timeout: 5000 });
  await expect(ghost).toHaveText(SUGGESTION);

  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('a');

  const editorText = (await editor.innerText()).replace(/\n/g, '');
  expect(editorText).toBe('a');

  expectNoPageErrors(pageErrors);
});
