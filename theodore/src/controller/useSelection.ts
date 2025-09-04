import { useRef } from 'react';
import type {
  EditorSelection,
  onSelectionChangeFn,
  EditorNodeSelection,
} from '../types';

const useSelection = (
  initialSelection: EditorNodeSelection,
  onSelectionChange?: onSelectionChangeFn,
) => {
  const startSelection = useRef<EditorNodeSelection>(initialSelection);
  const endSelection = useRef<EditorNodeSelection>(initialSelection);

  const setSelection = (
    newStartSelection: EditorNodeSelection,
    newEndSelection?: EditorNodeSelection,
  ) => {
    startSelection.current = newStartSelection;

    if (newEndSelection != undefined) endSelection.current = newEndSelection;
    else endSelection.current = newStartSelection;

    onSelectionChange?.(
      startSelection.current != undefined && endSelection.current != undefined
        ? {
            startSelection: { ...startSelection.current },
            endSelection: { ...endSelection.current },
          }
        : null,
    );
  };

  const getSelection = () => {
    return startSelection.current != null && endSelection.current != null
      ? {
          startSelection: { ...startSelection.current },
          endSelection: { ...endSelection.current },
        }
      : null;
  };

  return {
    getSelection,
    setSelection,
  };
};

const isEditorSelectionCollapsed = (editorSelection: EditorSelection) => {
  if (editorSelection == null) return false;
  const { startSelection, endSelection } = editorSelection;

  return Boolean(
    startSelection.nodeIndex == endSelection.nodeIndex &&
      startSelection.offset == endSelection.offset,
  );
};

const areNodeSelectionEqual = (
  selection1: EditorNodeSelection,
  selection2: EditorNodeSelection,
) => {
  if (selection1 == null && selection2 == null) return true;
  if (selection1 == null && selection2 != null) return false;
  if (selection1 != null && selection2 == null) return false;

  return (
    selection1?.nodeIndex == selection2?.nodeIndex &&
    selection1?.offset == selection2?.offset
  );
};

export { isEditorSelectionCollapsed, useSelection, areNodeSelectionEqual };
