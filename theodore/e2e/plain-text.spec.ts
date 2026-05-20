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

  await expectExactText(preview, 'hello');

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'hell');

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'hel');

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'he');

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'h');

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, '');

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
  }

  await expect(editor).toBeVisible();
  await expectExactText(page.getByTestId('plain-text-preview'), '');
  await expect(page.getByText(PLACEHOLDER, { exact: true })).toBeVisible();
  expectNoPageErrors(pageErrors);
});

test('type hello, then press BACKSPACE 3 times', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await expectExactText(preview, 'hello');

  for (const expected of ['hell', 'hel', 'he']) {
    await page.keyboard.press('Backspace');
    await expectExactText(preview, expected);
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

  const expectedAfterEachBackspace = ['hell', 'hel', 'he', 'h', '', ''];

  for (const expected of expectedAfterEachBackspace) {
    await page.keyboard.press('Backspace');
    await expectExactText(preview, expected);
  }

  await expect(editor).toBeVisible();
  await expect(page.getByText(PLACEHOLDER, { exact: true })).toBeVisible();
  expectNoPageErrors(pageErrors);
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

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }

  const expectedAfterEachDelete = ['ello', 'llo', 'lo', 'o', '', ''];

  for (const expected of expectedAfterEachDelete) {
    await page.keyboard.press('Delete');
    await expectExactText(preview, expected);
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

  await page.keyboard.press('Enter');

  await editor.pressSequentially('goodbye', { delay: 100 });

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

  await page.keyboard.press('Enter');

  await editor.pressSequentially('goodbye', { delay: 100 });

  await expectExactText(preview, 'hello\ngoodbye');

  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('ArrowLeft');
    await delay(30);
  }

  await page.keyboard.press('Backspace');

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

  await expectExactText(preview, 'hello\ngoodbye');
  expectNoPageErrors(pageErrors);

  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('ArrowLeft');
    await delay(30);
  }

  await page.keyboard.press('Backspace');

  await expectExactText(preview, 'hellogoodbye');

  await delay(500);

  await page.keyboard.press(undoShortcut());

  await expectExactText(preview, 'hello\ngoodbye');
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
  await expectExactText(preview, 'he\nllo');

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
  await expectExactText(preview, '\nhello');

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

  await expectExactText(preview, '\n\n\n');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, '\n\n');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, '\n');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, '');
  expectNoPageErrors(pageErrors);
});

test('type hello, select ello part, type i', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await expectExactText(preview, 'hello');

  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Shift+ArrowLeft', { delay: 30 });
  }

  await page.keyboard.press('i');

  await expectExactText(preview, 'hi');
  expectNoPageErrors(pageErrors);
});

test('type hello, then ENTER, type goodbye, select ello to good by holding SHIFT+ARROW_LEFT, then BACKSPACE, then undo', async ({
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
  await expectExactText(preview, 'hello\ngoodbye');
  expectNoPageErrors(pageErrors);

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }

  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Shift+ArrowLeft', { delay: 30 });
  }

  await page.keyboard.press('Backspace');
  await expectExactText(preview, 'hebye');
  expectNoPageErrors(pageErrors);

  await page.keyboard.press(undoShortcut());
  await expectExactText(preview, 'hello\ngoodbye');
  expectNoPageErrors(pageErrors);
});

test('type hello, press ENTER, press ENTER, type goodbye, press ARROW_LEFT 3 times, press SHIFT+ARROW_UP 3 times, press SHIFT+ARROW_LEFT 3 times, type a, then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.pressSequentially('goodbye', { delay: 100 });
  await expectExactText(preview, 'hello\n\ngoodbye');

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }
  await delay(30);

  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Shift+ArrowUp', { delay: 30 });
  }
  await delay(30);

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+ArrowLeft', { delay: 30 });
  }
  await delay(30);

  await page.keyboard.press('a');
  await expectExactText(preview, 'heabye');

  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(preview, 'hello\n\ngoodbye');

  expectNoPageErrors(pageErrors);
});

test('should successfuly paste text "from clipboard🌷🌷🌷" into editor, then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  const pasted = 'from clipboard🌷🌷🌷';

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await page.evaluate(async (text) => {
    await navigator.clipboard.writeText(text);
  }, pasted);

  await page.keyboard.press('ControlOrMeta+V');
  await delay(200);

  await expectExactText(preview, pasted);
  await delay(100);
  await page.keyboard.press(undoShortcut());
  await delay(100);
  await expectExactText(preview, '');

  expectNoPageErrors(pageErrors);
});

test('type hello, then ENTER 3 times, type goodbye, press ARROW_LEFT 3 times, press SHIFT+ARROW_UP 3 times, press SHIFT+ARROW_LEFT 3 times, paste "i love you\n\n\n😂😂😂" from clipboard, then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  const pasted = 'i love you\n\n\n😂😂😂';

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.pressSequentially('goodbye', { delay: 100 });
  await expectExactText(preview, 'hello\n\n\ngoodbye');

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowLeft', { delay: 30 });
  }
  await delay(30);

  for (let i = 0; i < 2; i++) {
    await page.keyboard.press('Shift+ArrowUp', { delay: 30 });
  }
  await delay(30);

  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Shift+ArrowLeft', { delay: 30 });
  }
  await delay(30);

  await page.evaluate(async (text) => {
    await navigator.clipboard.writeText(text);
  }, pasted);
  await delay(50);

  await page.keyboard.press('ControlOrMeta+V');
  await delay(100);

  await expectExactText(preview, 'heli love you\n\n\n😂😂😂bye');

  await delay(200);
  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(preview, 'hello\n\n\ngoodbye');

  expectNoPageErrors(pageErrors);
});

test('should type hello, then press ENTER 3 times, then type goodbye, then press ctrl+a, then paste "i love you\n\n\n🌱", then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  const pasted = 'i love you\n\n\n🌱';

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.pressSequentially('goodbye', { delay: 100 });
  await expectExactText(preview, 'hello\n\n\ngoodbye');

  await page.keyboard.press('ControlOrMeta+A');
  await delay(30);

  await page.evaluate(async (text) => {
    await navigator.clipboard.writeText(text);
  }, pasted);
  await delay(50);

  await page.keyboard.press('ControlOrMeta+V');
  await delay(100);

  await expectExactText(preview, pasted);

  await delay(50);

  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(preview, 'hello\n\n\ngoodbye');

  expectNoPageErrors(pageErrors);
});

test('should type hello, then press ctrl+a, then paste "🌱\n❤️\n😂", then undo', async ({
  page,
}) => {
  const pageErrors = installPageErrorTracking(page);
  const pasted = '🌱\n❤️\n😂';

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');

  const editor = page.getByTestId('editor');
  const preview = page.getByTestId('plain-text-preview');

  await editor.click();
  await editor.pressSequentially('hello', { delay: 100 });
  await expectExactText(preview, 'hello');

  await page.keyboard.press('ControlOrMeta+A');
  await delay(30);

  await page.evaluate(async (text) => {
    await navigator.clipboard.writeText(text);
  }, pasted);
  await delay(50);

  await page.keyboard.press('ControlOrMeta+V');
  await delay(100);

  await expectExactText(preview, pasted);

  await page.keyboard.press(undoShortcut());
  await delay(50);
  await expectExactText(preview, 'hello');

  expectNoPageErrors(pageErrors);
});

test('copying text from empty editor should be ""', async ({ page }) => {
  const pageErrors = installPageErrorTracking(page);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');

  await page.getByTestId('copy-editor-text').click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('');

  expectNoPageErrors(pageErrors);
});
