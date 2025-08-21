export const IS_FIREFOX =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.toLowerCase().includes('firefox');
