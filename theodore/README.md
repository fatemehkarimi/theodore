## Theodore

Theodore is an emoji‑friendly, content‑editable text input for React. It replaces native emoji characters with your own images so they render consistently across browsers.

- Consistent emoji rendering across platforms and browsers
- Bring your own emoji assets (e.g., Apple/Google/Twitter sets) and rendering
- Ctrl+Z works very well after inserting text or emoji

Try it in the playground: [Playground demo](https://playground.theodore-js.dev).

### Installation

```
npm install theodore-js
```

**Important:** You must import the CSS file for Theodore to work correctly:

```tsx
import 'theodore-js/style.css';
```

### Quick start

Below is a minimal example showing how to:

- Provide a `renderEmoji` function that maps a native emoji to your image asset
- Use a ref to call `insertEmoji` when an emoji is selected

```tsx
import React, { useRef } from 'react';
import { Theodore, TheodoreHandle, useEditorState } from 'theodore-js';
import 'theodore-js/style.css';

const renderEmoji = (emoji: string) => {
  if (emoji === '') return <></>;
  const unified = nativeToUnified(emoji);
  const path = `/img-apple-64/${unified}.png`;
  return <img src={path} width={22} height={22} alt={emoji} />;
};

export const TheodoreTextInput: React.FC = () => {
  const theodoreRef = useRef<TheodoreHandle>(null);
  const editorState = useEditorState();

  const handleSelectEmoji = (emoji: { native: string }) => {
    theodoreRef.current?.insertEmoji(emoji.native);
  };

  return (
    <>
      <Theodore
        theodoreRef={theodoreRef}
        editorState={editorState}
        renderEmoji={renderEmoji}
        placeholder="Write something..."
        maxLines={5}
      />
      {/* Your emoji picker should call handleSelectEmoji with a native emoji */}
      {/* <EmojiPicker onSelectEmoji={handleSelectEmoji} /> */}
    </>
  );
};
```

Notes:

- `renderEmoji` is required and tells Theodore how to render each emoji you type/paste.
- Theodore does not ship emoji images; point `renderEmoji` to your own assets.
- Emojis passed to `renderEmoji` and returned from your emoji picker are native characters (e.g., "😀"). If your assets are named using unified codepoints (e.g., `1f600`), convert native to unified yourself and map to your asset paths however you prefer. The example uses a `nativeToUnified(emoji)` helper for illustration; Theodore only provides the native string.
- Use the ref (`TheodoreHandle`) to programmatically insert emojis with `insertEmoji(native)`.
- For correct copy/cut behavior: set the image `alt` attribute to the native emoji (e.g., `alt="😀"`). Browsers use an image's `alt` text when producing plain‑text clipboard data, so this ensures copying the editor content yields the emoji character.

### Props

- **editorState (required, `EditorState`)**: The editor state returned by `useEditorState([onSelectionChange])`. Holds the tree, history, and selection. Create once and pass the same instance to `<Theodore />`.
- **renderEmoji (required, `RenderEmoji`)**: `(emoji: string) => ReactElement`. Receives a native emoji character and returns the React element to render (e.g., an `<img />`). Used whenever emojis are typed, pasted, or inserted programmatically.
- **theodoreRef (`TheodoreHandle`)**: Optional ref to control the editor programmatically. Use `insertEmoji(emoji)` to insert an emoji into the input, and `setContent(content)` to replace the editor content with a specific string (e.g., a saved draft).
- **placeholder (`string | React.ReactNode`)**: Content shown only when the editor is empty. If a string, it is wrapped in a styled placeholder container; if a React node, it is rendered as-is when empty.
- **ref (`HTMLDivElement`)**: Optional ref to the contentEditable div element.
- **className (`string`)**: Extra class for the contentEditable div.
- **wrapperClassName (`string`)**: Extra class for the contentEditable wrapper `div`.
- **placeholderClassName (`string`)**: Extra class applied to the placeholder element.
- **maxLines (`number`)**: Maximum visible line count before the editor scrolls.
- **onSelectionChange (`(selection: EditorSelection) => void`)**: Optional selection change callback. Provide it to `useEditorState(onSelectionChange)` when creating `editorState` to receive updates.
- **defualtDirection (`ltr` | `rtl`)**: the default direction of input when it is empty.
- **shouldSuppressFocus (`boolean`)**: Mobile emoji panel helper. When true, the editor blurs on focus so the native keyboard does not open. This avoids showing both the system keyboard and your custom emoji panel at the same time.
- **...div props**: All other `div` props (except `contentEditable`) are forwarded to the contentEditable element (e.g., `aria-*`, `data-*`, `onFocus`, `onBlur`).

### Converting to plain text

If you need the plain text representation of the editor state:

```tsx
import { convertTreeToText } from 'theodore-js';

const text = convertTreeToText(editorState.tree);
```

That will produce a string with the emoji characters restored.
See a working example of the component in the source: [Playground source on GitHub](https://github.com/fatemehkarimi/theodore/tree/master/playground).
