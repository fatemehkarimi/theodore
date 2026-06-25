import React from 'react';
import { IS_MOBILE } from '../environment';
import { SuggestionHintProps } from '../types';

const SuggestionHint: React.FC<SuggestionHintProps> = ({ direction }) => {
  return (
    <span
      key="suggestion-hint"
      contentEditable={false}
      data-suggestion-hint="true"
      className="theodore_suggestionHint"
      onMouseDown={(event) => event.preventDefault()}
    >
      {IS_MOBILE ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          color="rgba(0, 0, 0, 0.35)"
          aria-hidden="true"
          style={{
            transform: direction === 'rtl' ? 'scaleX(-1)' : undefined,
            transformOrigin: 'center',
          }}
        >
          <path
            d="M8 7L3 12L8 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 12H15C18.314 12 21 9.314 21 6V5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        'Tab'
      )}
    </span>
  );
};

export { SuggestionHint };
