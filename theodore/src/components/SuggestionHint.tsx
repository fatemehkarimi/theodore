import React from 'react';

const SuggestionHint: React.FC = () => {
  return (
    <span
      key="suggestion-hint"
      contentEditable={false}
      data-suggestion-hint="true"
      className="theodore_suggestionHint"
      onMouseDown={(event) => event.preventDefault()}
    >
      Tab
    </span>
  );
};

export { SuggestionHint };
