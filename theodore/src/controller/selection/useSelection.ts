import { useRef } from 'react';
import type {
  onSelectionChangeFn,
} from '../../types';
import type { EditorSelection, EditorNodeSelection } from './types';
import { Selection } from './selection';

type SelectionHandle = {
  clone(): Selection;
  getSelection(): EditorSelection;
  setSelection(
    newStartSelection: EditorNodeSelection,
    newEndSelection?: EditorNodeSelection,
  ): void;
};
const useSelection = (
  initialSelection: EditorNodeSelection,
  onSelectionChange?: onSelectionChangeFn,
): SelectionHandle => {
  const selectionRef = useRef<Selection>(
    new Selection(initialSelection, onSelectionChange),
  );

  const clone = () => {
    return selectionRef.current.clone();
  };

  const getSelection = () => {
    return selectionRef.current.getSelection();
  };

  const setSelection = (
    newStartSelection: EditorNodeSelection,
    newEndSelection?: EditorNodeSelection,
  ) => {
    return selectionRef.current.setSelection(
      newStartSelection,
      newEndSelection,
    );
  };

  return {
    clone,
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

export {
  isEditorSelectionCollapsed,
  useSelection,
  areNodeSelectionEqual,
  Selection,
  type SelectionHandle,
};
