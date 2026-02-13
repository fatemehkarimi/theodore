export const IS_FIREFOX =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.toLowerCase().includes('firefox');

export const IS_ANDROID: boolean =
  typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);

export const IS_CHROME: boolean =
  typeof navigator !== 'undefined' &&
  /^(?=.*Chrome).*/i.test(navigator.userAgent);

export const IS_ANDROID_CHROME: boolean = IS_ANDROID && IS_CHROME;
export const isDevelopment = process.env.NODE_ENV == 'development';

export const IS_WINDOWS: boolean =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.toLowerCase().includes('windows');
