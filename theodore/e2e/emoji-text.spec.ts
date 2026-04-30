import { setTimeout as delay } from 'node:timers/promises';
import { expect, test } from '@playwright/test';
import {
  expectExactText,
  expectNoPageErrors,
  installPageErrorTracking,
  undoShortcut,
} from './utils';

test('insert a single emoji', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  await page.getByTestId('emoji-picker').click();

  const picker = page.locator('em-emoji-picker');
  await expect(picker).toBeVisible();

  await picker.getByRole('button', { name: '😀' }).first().click();

  await expectExactText(page.getByTestId('plain-text-preview'), '😀');
  expectNoPageErrors(pageErrors);
});

test('insert a single emoji then undo', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');

  await page.getByTestId('emoji-picker').click();

  const picker = page.locator('em-emoji-picker');
  await expect(picker).toBeVisible();

  await picker.getByRole('button', { name: '😀' }).first().click();

  await expectExactText(page.getByTestId('plain-text-preview'), '😀');
  await expect(editor.getByRole('img', { name: '😀' })).toBeVisible();

  await delay(50);

  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(page.getByTestId('plain-text-preview'), '');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(0);

  expectNoPageErrors(pageErrors);
});

test('insert an emoji at the end of text', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  await page.getByTestId('emoji-picker').click();

  const picker = page.locator('em-emoji-picker');
  await expect(picker).toBeVisible();

  await picker.getByRole('button', { name: '😀' }).first().click();

  await expectExactText(page.getByTestId('plain-text-preview'), 'hello😀');
  expectNoPageErrors(pageErrors);
});

test('insert an emoji in the middle of text', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }
  await delay(30);

  await page.getByTestId('emoji-picker').click();

  const picker = page.locator('em-emoji-picker');
  await expect(picker).toBeVisible();

  await picker.getByRole('button', { name: '😀' }).first().click();

  await expectExactText(page.getByTestId('plain-text-preview'), 'he😀llo');

  await editor.pressSequentially('i', { delay: 100 });

  await expectExactText(page.getByTestId('plain-text-preview'), 'he😀illo');

  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(page.getByTestId('plain-text-preview'), 'he😀llo');

  await delay(50);

  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(page.getByTestId('plain-text-preview'), 'hello');

  expectNoPageErrors(pageErrors);
});

test('insert multiple emojis, then undo', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const picker = page.locator('em-emoji-picker');

  await page.getByTestId('emoji-picker').click();
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: '😀' }).first().click();

  await delay(50);
  await picker.getByRole('button', { name: '😂' }).first().click();

  await delay(50);

  await expectExactText(page.getByTestId('plain-text-preview'), '😀😂');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(1);
  await expect(editor.locator('img[alt="😂"]')).toHaveCount(1);

  await delay(50);
  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(page.getByTestId('plain-text-preview'), '😀');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(1);
  await expect(editor.locator('img[alt="😂"]')).toHaveCount(0);

  await delay(50);
  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(page.getByTestId('plain-text-preview'), '');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(0);
  await expect(editor.locator('img[alt="😂"]')).toHaveCount(0);

  expectNoPageErrors(pageErrors);
});

test('insert emoji, then press BACKSPACE, then undo', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const picker = page.locator('em-emoji-picker');

  await page.getByTestId('emoji-picker').click();
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: '😀' }).first().click();

  await expectExactText(page.getByTestId('plain-text-preview'), '😀');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(1);

  await editor.focus();
  await page.keyboard.press('Backspace');
  await delay(50);

  await expectExactText(page.getByTestId('plain-text-preview'), '');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(0);

  await page.keyboard.press(undoShortcut());
  await delay(50);

  await expectExactText(page.getByTestId('plain-text-preview'), '😀');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(1);

  expectNoPageErrors(pageErrors);
});

test('type hello, then press ARROW_LEFT, then press SHIFT+ARROW_LEFT three times, then insert emoji, then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await expectExactText(page.getByTestId('plain-text-preview'), 'hello');

  await page.keyboard.press('ArrowLeft', { delay: 30 });
  await delay(30);

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+ArrowLeft', { delay: 30 });
  }
  await delay(30);

  const picker = page.locator('em-emoji-picker');
  await page.getByTestId('emoji-picker').click();
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: '😀' }).first().click();
  await delay(50);

  await expectExactText(page.getByTestId('plain-text-preview'), 'h😀o');
  await delay(50);

  await page.keyboard.press(undoShortcut());
  await delay(50);

  await expectExactText(page.getByTestId('plain-text-preview'), 'hello');
  expectNoPageErrors(pageErrors);
});

test('type hello, then ENTER, then type goodbye, the CTRL+a to select all, then insert emoji, then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const picker = page.locator('em-emoji-picker');

  const editor = page.getByTestId('editor');
  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await page.keyboard.press('Enter');
  await editor.pressSequentially('goodbye', { delay: 100 });
  await expectExactText(
    page.getByTestId('plain-text-preview'),
    'hello\ngoodbye',
  );

  await page.keyboard.press('ControlOrMeta+A');
  await delay(30);

  await page.getByTestId('emoji-picker').click();
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: '😀' }).first().click();
  await delay(50);

  await expectExactText(page.getByTestId('plain-text-preview'), '😀');

  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(
    page.getByTestId('plain-text-preview'),
    'hello\ngoodbye',
  );

  expectNoPageErrors(pageErrors);
});

test('insert emoji, insert emoji, press ARROW_LEFT, type hello', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const picker = page.locator('em-emoji-picker');

  await page.getByTestId('emoji-picker').click();
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: '😀' }).first().click();

  await delay(50);
  await picker.getByRole('button', { name: '😂' }).first().click();
  await delay(50);

  await expectExactText(page.getByTestId('plain-text-preview'), '😀😂');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(1);
  await expect(editor.locator('img[alt="😂"]')).toHaveCount(1);

  await editor.focus();
  await page.keyboard.press('ArrowLeft', { delay: 30 });
  await delay(30);

  await editor.pressSequentially('hello', { delay: 100 });

  await expectExactText(page.getByTestId('plain-text-preview'), '😀hello😂');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(1);
  await expect(editor.locator('img[alt="😂"]')).toHaveCount(1);

  expectNoPageErrors(pageErrors);
});

test('insert emoji, emoji, emoji, then press ARROW_LEFT, then press SHIFT+ARROW_LEFT, then type a, then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const picker = page.locator('em-emoji-picker');

  await page.getByTestId('emoji-picker').click();
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: '😀' }).first().click();
  await delay(50);
  await picker.getByRole('button', { name: '😂' }).first().click();
  await delay(50);
  await picker.getByRole('button', { name: '😎' }).first().click();
  await delay(50);

  await expectExactText(page.getByTestId('plain-text-preview'), '😀😂😎');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(1);
  await expect(editor.locator('img[alt="😂"]')).toHaveCount(1);
  await expect(editor.locator('img[alt="😎"]')).toHaveCount(1);

  await editor.focus();
  await page.keyboard.press('ArrowLeft', { delay: 30 });
  await delay(30);

  await page.keyboard.press('Shift+ArrowLeft', { delay: 30 });
  await delay(30);

  await editor.pressSequentially('a', { delay: 100 });
  await expectExactText(page.getByTestId('plain-text-preview'), '😀a😎');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(1);
  await expect(editor.locator('img[alt="😂"]')).toHaveCount(0);
  await expect(editor.locator('img[alt="😎"]')).toHaveCount(1);

  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(page.getByTestId('plain-text-preview'), '😀😂😎');
  await expect(editor.locator('img[alt="😀"]')).toHaveCount(1);
  await expect(editor.locator('img[alt="😂"]')).toHaveCount(1);
  await expect(editor.locator('img[alt="😎"]')).toHaveCount(1);

  expectNoPageErrors(pageErrors);
});

test('insert emoji, emoji, emoji, then type a, press ARROW_LEFT 2 times, type b, press ARROW_LEFT 2 times, type c, press ARROW_LEFT 2 times, type d, then undo 7 times', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');
  const picker = page.locator('em-emoji-picker');

  await page.getByTestId('emoji-picker').click();
  await expect(picker).toBeVisible();
  await picker.getByRole('button', { name: '😀' }).first().click();
  await delay(50);
  await picker.getByRole('button', { name: '😂' }).first().click();
  await delay(50);
  await picker.getByRole('button', { name: '😎' }).first().click();
  await delay(50);

  await editor.focus();
  await editor.pressSequentially('a', { delay: 100 });

  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }
  await delay(30);
  await editor.pressSequentially('b', { delay: 100 });

  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }
  await delay(30);
  await editor.pressSequentially('c', { delay: 100 });

  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }
  await delay(30);
  await editor.pressSequentially('d', { delay: 100 });

  await expectExactText(preview, 'd😀c😂b😎a');

  const expectedAfterEachUndo = [
    '😀c😂b😎a',
    '😀😂b😎a',
    '😀😂😎a',
    '😀😂😎',
    '😀😂',
    '😀',
    '',
  ];

  for (const expected of expectedAfterEachUndo) {
    await page.keyboard.press(undoShortcut());
    await delay(50);
    await expectExactText(preview, expected);
  }

  expectNoPageErrors(pageErrors);
});
