import { useEffect, useRef, useState } from 'react';
import { Theodore, useEditorState, useSuggestion } from 'theodore-js';
import type { SuggestionRequest, TheodoreHandle } from 'theodore-js';
import 'theodore-js/style.css';
import './styles.css';

const suggestions = [
  'lorem ipsum 😀',
  'dolor sit amet',
  'consectetur adipiscing elit',
  'sed do eiusmod tempor 😎',
  'incididunt ut labore et dolore',
];

const emojis = ['😀', '😂', '😊', '😍', '😎', '🤔'];

const requestSuggestion = ({ input, signal }: SuggestionRequest) => {
  if (signal.aborted) return Promise.resolve(null);

  const suggestion = suggestions[input.length % suggestions.length];
  return Promise.resolve(` ${suggestion}`);
};

const isMobileDevice = () =>
  typeof navigator !== 'undefined' &&
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(
    navigator.userAgent,
  );

const nativeToUnified = (emoji: string) =>
  Array.from(emoji, (character) => character.codePointAt(0)?.toString(16))
    .filter((code) => code !== undefined)
    .join('-');

const emojiPath = (emoji: string) =>
  emojis.includes(emoji)
    ? `/emojis/${nativeToUnified(emoji)}.webp`
    : '/no-emoji.png';

const renderEmoji = (emoji: string) => (
  <img className="custom-emoji" src={emojiPath(emoji)} alt={emoji} />
);

export default function App() {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const editorState = useEditorState();
  const editorRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerToggleRef = useRef<HTMLButtonElement>(null);
  const theodoreRef = useRef<TheodoreHandle>(null);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    if (!isEmojiPickerOpen) return;

    const closePickerOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (pickerRef.current?.contains(target)) return;
      if (pickerToggleRef.current?.contains(target)) return;

      setIsEmojiPickerOpen(false);
    };

    document.addEventListener('pointerdown', closePickerOnOutsideClick);
    return () =>
      document.removeEventListener('pointerdown', closePickerOnOutsideClick);
  }, [isEmojiPickerOpen]);

  const { acceptSuggestion, rejectActiveSuggestion, suggestion } =
    useSuggestion({
      debounceMs: 1000,
      editorState,
      requestSuggestion,
      theodoreRef,
    });

  useEffect(() => {
    const editor = editorRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (suggestion == null) return;

      if (isMobile && event.key === 'Enter') {
        event.preventDefault();
        event.stopImmediatePropagation();
        acceptSuggestion(editorState.tree);
        return;
      }

      if (event.key !== 'Escape') return;

      event.preventDefault();
      event.stopImmediatePropagation();
      rejectActiveSuggestion();
    };

    editor?.addEventListener('keydown', handleKeyDown);
    return () => editor?.removeEventListener('keydown', handleKeyDown);
  }, [
    acceptSuggestion,
    editorState.tree,
    isMobile,
    rejectActiveSuggestion,
    suggestion,
  ]);

  const insertEmoji = (emoji: string) => {
    theodoreRef.current?.insertEmoji(emoji);
  };

  return (
    <main className="page">
      <section className="content" aria-labelledby="page-title">
        <h1 id="page-title">What can I help with?</h1>

        <div className="prompt-box">
          <Theodore
            ref={editorRef}
            theodoreRef={theodoreRef}
            editorState={editorState}
            renderEmoji={renderEmoji}
            suggestion={suggestion}
            className="prompt-input"
            placeholderClassName="prompt-placeholder"
            placeholder="Type something and wait..."
            maxLines={5}
            aria-label="Prompt"
            shouldSuppressFocus={isMobile && isEmojiPickerOpen}
            onClick={() => {
              if (isMobile && isEmojiPickerOpen) {
                setIsEmojiPickerOpen(false);
                window.setTimeout(() => editorRef.current?.focus(), 0);
              }
            }}
          />

          <div className="prompt-footer">
            {!isMobile && (
              <p className="hint">Press Tab to accept or Escape to dismiss.</p>
            )}
            <div className="emoji-control">
              <button
                ref={pickerToggleRef}
                type="button"
                className="emoji-toggle"
                aria-label="Toggle custom emoji picker"
                aria-controls="custom-emoji-picker"
                aria-expanded={isEmojiPickerOpen}
                onClick={() => setIsEmojiPickerOpen((isOpen) => !isOpen)}
              >
                <img src={emojiPath('😀')} alt="" />
              </button>

              {isEmojiPickerOpen && (
                <div
                  ref={pickerRef}
                  id="custom-emoji-picker"
                  className="emoji-picker"
                  role="group"
                  aria-label="Custom emoji picker"
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      aria-label={`Insert ${emoji}`}
                      onClick={() => insertEmoji(emoji)}
                    >
                      <img src={emojiPath(emoji)} alt={emoji} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
