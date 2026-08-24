import { useEffect, useRef } from 'react';
import { Theodore, useEditorState, useSuggestion } from 'theodore-js';
import type { SuggestionRequest, TheodoreHandle } from 'theodore-js';
import 'theodore-js/style.css';
import './styles.css';

const suggestions = [
  'lorem ipsum',
  'dolor sit amet',
  'consectetur adipiscing elit',
  'sed do eiusmod tempor',
  'incididunt ut labore et dolore',
];

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

export default function App() {
  const isMobile = isMobileDevice();
  const editorState = useEditorState();
  const editorRef = useRef<HTMLDivElement>(null);
  const theodoreRef = useRef<TheodoreHandle>(null);

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

  return (
    <main className="page">
      <section className="content" aria-labelledby="page-title">
        <h1 id="page-title">What can I help with?</h1>

        <div className="prompt-box">
          <Theodore
            ref={editorRef}
            theodoreRef={theodoreRef}
            editorState={editorState}
            suggestion={suggestion}
            className="prompt-input"
            placeholderClassName="prompt-placeholder"
            placeholder="Type something and wait..."
            maxLines={5}
            aria-label="Prompt"
          />
          {!isMobile && (
            <p className="hint">Press Tab to accept or Escape to dismiss.</p>
          )}
        </div>
      </section>
    </main>
  );
}
