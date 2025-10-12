export const IS_FIREFOX =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.toLowerCase().includes('firefox');

export const isDevelopment = process.env.NODE_ENV == 'development';
