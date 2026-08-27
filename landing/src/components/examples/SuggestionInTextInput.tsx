'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Theodore,
  type SuggestionRequest,
  type TheodoreHandle,
  useEditorState,
  useSuggestion,
} from 'theodore-js';
import { isMobile } from '@/utils';
import './SuggestionInTextInput.css';

const suggestions = [
  ' lorem ipsum',
  ' dolor sit amet',
  ' consectetur adipiscing elit',
  ' sed do eiusmod tempor',
];

function requestSuggestion({ input, signal }: SuggestionRequest) {
  if (signal.aborted) return Promise.resolve(null);

  const suggestion = suggestions[input.length % suggestions.length];
  return Promise.resolve(suggestion);
}

export function SuggestionInTextInput() {
  const editorState = useEditorState();
  const editorRef = useRef<HTMLDivElement>(null);
  const theodoreRef = useRef<TheodoreHandle>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  const { acceptSuggestion, rejectActiveSuggestion, suggestion } =
    useSuggestion({
      debounceMs: 700,
      editorState,
      requestSuggestion,
      theodoreRef,
    });

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  useEffect(() => {
    const editor = editorRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (suggestion == null) return;

      if (event.key === 'Tab' || (isMobileDevice && event.key === 'Enter')) {
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
    isMobileDevice,
    rejectActiveSuggestion,
    suggestion,
  ]);

  return (
    <div className="suggestion-input-example not-prose">
      <div className="suggestion-input-example__heading">
        <span className="suggestion-input-example__status" aria-hidden="true" />
        Suggestion playground
      </div>
      <p className="suggestion-input-example__description">
        Start typing, then pause briefly to see a suggestion.
      </p>
      <div className="suggestion-input-example__editor-shell">
        <Theodore
          id="suggestion-example-input"
          ref={editorRef}
          theodoreRef={theodoreRef}
          editorState={editorState}
          suggestion={suggestion}
          className="suggestion-input-example__input"
          placeholderClassName="suggestion-input-example__placeholder"
          placeholder="Start writing..."
          maxLines={4}
          aria-label="Message with inline suggestions"
        />
        <p className="suggestion-input-example__hint">
          {isMobileDevice
            ? 'Press Enter to accept the suggestion.'
            : 'Press Tab to accept or Escape to dismiss.'}
        </p>
      </div>
    </div>
  );
}
