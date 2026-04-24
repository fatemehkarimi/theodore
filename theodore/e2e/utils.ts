import { expect, type Locator, type Page } from '@playwright/test';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * `convertTreeToText` appends a newline after each paragraph, so the preview’s
 * `textContent` always ends with `\n` (and an “empty” doc is `"\n"`). Pass the
 * logical plain text; a trailing document newline is added when missing.
 */
const previewDocText = (text: string) =>
  text.endsWith('\n') ? text : `${text}\n`;

const expectExactText = (locator: Locator, text: string) => {
  const expected = previewDocText(text);
  return expect(locator).toHaveText(new RegExp(`^${escapeRegExp(expected)}$`), {
    useInnerText: false,
  });
};

const undoShortcut = (): string =>
  process.platform === 'darwin' ? 'Meta+Z' : 'Control+Z';

const installPageErrorTracking = (page: Page): Error[] => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (err) => {
    pageErrors.push(err);
  });
  return pageErrors;
};

const expectNoPageErrors = (pageErrors: ReadonlyArray<Error>): void => {
  expect(pageErrors).toEqual([]);
};

export {
  undoShortcut,
  installPageErrorTracking,
  expectNoPageErrors,
  expectExactText,
};
