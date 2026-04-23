import { createElement, Fragment } from 'react';
import { nativeToUnified } from '../emoji';

const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua =
    navigator.userAgent ||
    (navigator as any).vendor ||
    (window as any).opera ||
    '';

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    ua,
  );
};

const renderAppleEmoji = (emoji: string) => {
  if (emoji == '') return createElement(Fragment);
  const unified = nativeToUnified(emoji);
  const path = `/img-apple-64/${unified}.png`;

  return createElement('img', {
    src: path,
    width: 22,
    height: 22,
    alt: emoji,
  });
};

export { isMobileDevice, renderAppleEmoji };
