const VARIATION_SELECTORS = [0xfe0e, 0xfe0f];

export function nativeToUnified(emoji: string) {
  let code;

  if (emoji.length === 1) {
    code = emoji.charCodeAt(0).toString(16).padStart(4, '0');
  } else {
    const pairs: number[] = [];
    for (let i = 0; i < emoji.length; i++) {
      const codeUnit = emoji.charCodeAt(i);

      if (VARIATION_SELECTORS.includes(codeUnit)) {
        continue;
      }

      if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
        const next = emoji.charCodeAt(i + 1);
        if (next >= 0xdc00 && next <= 0xdfff) {
          pairs.push((codeUnit - 0xd800) * 0x400 + (next - 0xdc00) + 0x10000);
          i++;
        }
      } else {
        pairs.push(codeUnit);
      }
    }

    code = pairs.map((x) => x.toString(16).padStart(4, '0')).join('-');
  }

  return code;
}
