import { expect, type Locator, type Page } from '@playwright/test';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const expectExactText = (locator: Locator, text: string) => {
  return expect(locator).toHaveText(new RegExp(`^${escapeRegExp(text)}$`), {
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
