# Theodore 😄

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/theodore-js/theodore/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/theodore-js.svg)](https://www.npmjs.com/package/theodore-js)

**Theodore** is an emoji-friendly, content-editable text input for React. It replaces native emoji characters with your own images so they render consistently across browsers.

- Consistent emoji rendering across platforms and browsers
- Bring your own emoji assets (e.g., Apple / Google / Twitter sets) and rendering
- Ctrl+Z works very well after inserting text or emoji

## Documentation

Learn API details, setup steps, and integration guides.

📚 https://theodore-js.dev/docs

---

## Playground

Try Theodore interactively and test emoji rendering behavior in the browser.

🧪 https://theodore-js.dev

---

## Installation

```bash
npm install theodore-js
```

## Example Usage

```tsx
import React from 'react';
import { Theodore, useEditorState } from 'theodore-js';
import 'theodore-js/style.css';

const renderEmoji = (emoji: string) => {
  if (emoji === '') return <></>;
  const unified = nativeToUnified(emoji);
  const path = `/img-apple-64/${unified}.png`;
  return <img src={path} width={22} height={22} alt={emoji} />;
};

export const TheodoreTextInput: React.FC = () => {
  const editorState = useEditorState();

  return <Theodore editorState={editorState} renderEmoji={renderEmoji} />;
};
```

## License

MIT©Theodore contributors
