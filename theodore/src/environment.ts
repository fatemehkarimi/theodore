const IS_FIREFOX =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.toLowerCase().includes('firefox');

const IS_ANDROID: boolean =
  typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);

const IS_CHROME: boolean =
  typeof navigator !== 'undefined' &&
  /^(?=.*Chrome).*/i.test(navigator.userAgent);

const IS_ANDROID_CHROME: boolean = IS_ANDROID && IS_CHROME;
const isDevelopment = process.env.NODE_ENV == 'development';

const IS_WINDOWS: boolean =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.toLowerCase().includes('windows');

export {
  IS_FIREFOX,
  IS_ANDROID,
  IS_CHROME,
  IS_ANDROID_CHROME,
  isDevelopment,
  IS_WINDOWS,
};
