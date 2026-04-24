import { setTimeout as delay } from 'node:timers/promises';
import { expect, test } from '@playwright/test';
import { PLACEHOLDER } from './constant';
import {
  expectExactText,
  expectNoPageErrors,
  installPageErrorTracking,
  undoShortcut,
} from './utils';

test('typing hello shows hello in plain text preview', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  expectNoPageErrors(pageErrors);

  await expectExactText(page.getByTestId('plain-text-preview'), 'hello');
  expectNoPageErrors(pageErrors);
});

test('incremental undo restores plain text and shows placeholder when empty', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  expectNoPageErrors(pageErrors);

  await expectExactText(preview, 'hello');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'hell');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'hel');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'he');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'h');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, '');
  expectNoPageErrors(pageErrors);

  await expect(page.getByText(PLACEHOLDER, { exact: true })).toBeVisible();
  expectNoPageErrors(pageErrors);
});

test('undo on empty editor does not crash', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  await editor.click();

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press(undoShortcut());
    expectNoPageErrors(pageErrors);
  }

  expectNoPageErrors(pageErrors);
  await expect(editor).toBeVisible();
  await expectExactText(page.getByTestId('plain-text-preview'), '');
  await expect(page.getByText(PLACEHOLDER, { exact: true })).toBeVisible();
});

test('type hello, then press BACKSPACE 3 times', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await expectExactText(preview, 'hello');
  expectNoPageErrors(pageErrors);

  for (const expected of ['hell', 'hel', 'he']) {
    await page.keyboard.press('Backspace');
    await expectExactText(preview, expected);
    expectNoPageErrors(pageErrors);
  }

  expectNoPageErrors(pageErrors);
});

test('type hello, then press BACKSPACE 6 times', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await expectExactText(preview, 'hello');
  expectNoPageErrors(pageErrors);

  const expectedAfterEachBackspace = ['hell', 'hel', 'he', 'h', '', ''];

  for (const expected of expectedAfterEachBackspace) {
    await page.keyboard.press('Backspace');
    await expectExactText(preview, expected);
    expectNoPageErrors(pageErrors);
  }

  expectNoPageErrors(pageErrors);
  await expect(editor).toBeVisible();
  await expect(page.getByText(PLACEHOLDER, { exact: true })).toBeVisible();
});

test('type hello, press ARROW_LEFT 5 times, press DEL 6 times', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await expectExactText(preview, 'hello');
  expectNoPageErrors(pageErrors);

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }
  expectNoPageErrors(pageErrors);

  const expectedAfterEachDelete = ['ello', 'llo', 'lo', 'o', '', ''];

  for (const expected of expectedAfterEachDelete) {
    await page.keyboard.press('Delete');
    await expectExactText(preview, expected);
    expectNoPageErrors(pageErrors);
  }

  expectNoPageErrors(pageErrors);
});

test('type hello, then press ENTER, then type goodbye', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  expectNoPageErrors(pageErrors);

  await page.keyboard.press('Enter');
  expectNoPageErrors(pageErrors);

  await editor.pressSequentially('goodbye', { delay: 100 });
  expectNoPageErrors(pageErrors);

  await expectExactText(preview, 'hello\ngoodbye');
  expectNoPageErrors(pageErrors);
});

test('type hello, then press ENTER, then type goodbye, then press ARROW_LEFT 7 times, press BACKSPACE', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  expectNoPageErrors(pageErrors);

  await page.keyboard.press('Enter');
  expectNoPageErrors(pageErrors);

  await editor.pressSequentially('goodbye', { delay: 100 });
  expectNoPageErrors(pageErrors);

  await expectExactText(preview, 'hello\ngoodbye\n');
  expectNoPageErrors(pageErrors);

  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('ArrowLeft');
    await delay(30);
  }
  expectNoPageErrors(pageErrors);

  await page.keyboard.press('Backspace');
  expectNoPageErrors(pageErrors);

  await expectExactText(preview, 'hellogoodbye');
  expectNoPageErrors(pageErrors);
});

test('type hello, then press ENTER two times, then type goodbye', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  expectNoPageErrors(pageErrors);

  await page.keyboard.press('Enter');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press('Enter');
  expectNoPageErrors(pageErrors);

  await editor.pressSequentially('goodbye', { delay: 100 });
  expectNoPageErrors(pageErrors);

  await expectExactText(preview, 'hello\n\ngoodbye');
  expectNoPageErrors(pageErrors);
});

test('type hello, then ENTER, then goodbye, then press ARROW_LEFT 7 times, press BACKSPACE, then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  await page.keyboard.press('Enter');

  await editor.pressSequentially('goodbye', { delay: 100 });

  await expectExactText(preview, 'hello\ngoodbye\n');
  expectNoPageErrors(pageErrors);

  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('ArrowLeft');
    await delay(30);
  }

  await page.keyboard.press('Backspace');

  await expectExactText(preview, 'hellogoodbye');

  await delay(500);

  await page.keyboard.press(undoShortcut());

  await expectExactText(preview, 'hello\ngoodbye\n');
  expectNoPageErrors(pageErrors);
});

test('type hello, then press ARROW_LEFT 3 times, then press ENTER, then wait for 500ms, then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }

  await page.keyboard.press('Enter');
  await expectExactText(preview, 'he\nllo\n');

  await delay(500);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'hello');

  expectNoPageErrors(pageErrors);
});

test('type hello, then press ARROW_LEFT 3 times, then press DEL 3 times, then wait for 500ms, then undo 3 times', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await expectExactText(preview, 'hello');

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }

  const expectedAfterEachDelete = ['helo', 'heo', 'he'];

  for (const expected of expectedAfterEachDelete) {
    await page.keyboard.press('Delete');
    await expectExactText(preview, expected);
  }

  await delay(500);

  const expectedAfterEachUndo = ['heo', 'helo', 'hello'];

  for (let i = 0; i < expectedAfterEachUndo.length; i++) {
    await page.keyboard.press(undoShortcut());
    await expectExactText(preview, expectedAfterEachUndo[i]);
    expectNoPageErrors(pageErrors);
    await delay(30);
  }
  expectNoPageErrors(pageErrors);
});

test('type hello, then press HOME, then press ENTER, then wait for 500ms, then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });

  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expectExactText(preview, '\nhello\n');

  await delay(500);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'hello');

  expectNoPageErrors(pageErrors);
});

test('three times press ENTER, then three times undo', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Enter', { delay: 50 });
  }

  await expectExactText(preview, '\n\n\n\n');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, '\n\n\n');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, '\n\n');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, '\n');
  expectNoPageErrors(pageErrors);
});
