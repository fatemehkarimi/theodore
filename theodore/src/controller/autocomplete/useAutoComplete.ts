import { MutableRefObject, useEffect } from 'react';
import { EditorState } from '../../types';
import { findGhostNode, isSelectionAnchorSameAsFocus } from '../utils';

const useAutoComplete = (
  inputRef: MutableRefObject<HTMLDivElement | null>,
  acceptSuggestion: () => void,
  rejectSuggestion: () => void,
  editorState: EditorState,
) => {
  const { tree } = editorState;
  const { selectionHandle } = editorState;
  const { getSelection } = selectionHandle;

  useEffect(() => {
    const input = inputRef.current;
    if (input == null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key == 'Backspace' || keyboardEvent.key == 'Delete') {
        const selection = getSelection();
        const ghostNode = findGhostNode(tree);
        if (ghostNode) {
          if (
            isSelectionAnchorSameAsFocus() &&
            selection?.startSelection.nodeIndex == ghostNode.getIndex()
          ) {
            rejectSuggestion();
          }
        }
      } else if (
        keyboardEvent.ctrlKey &&
        !keyboardEvent.shiftKey &&
        keyboardEvent.key.toLowerCase() == 'z'
      )
        rejectSuggestion();
    };

    input.addEventListener('keydown', handleKeyDown);
    return () => {
      input.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef, getSelection]);
};

export { useAutoComplete };
