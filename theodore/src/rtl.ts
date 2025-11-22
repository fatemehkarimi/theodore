const rtlRanges = [
  [0x0590, 0x05ff], // Hebrew
  [0x0600, 0x06ff], // Persian
  [0x0750, 0x077f], // Arabic Supplement
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0x0700, 0x074f], // Syriac
  [0x0780, 0x07bf], // Thaana
  [0x07c0, 0x07ff], // N'Ko
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
  [0x1ee00, 0x1eeff], // Arabic Mathematical Alphabetic Symbols
];

export function isRTL(char: string, defaultDir: 'ltr' | 'rtl'): boolean {
  if (char == '') return defaultDir == 'rtl';
  const code = char.charCodeAt(0);
  return rtlRanges.some(([start, end]) => code >= start && code <= end);
}
