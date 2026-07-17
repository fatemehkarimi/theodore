import { useRef } from 'react';
import type { onSelectionChangeFn } from '../../types';
import type { EditorSelection, EditorNodeSelection } from './types';
import { Selection } from './selection';

type SelectionHandle = {
  clone(): Selection;
  getSelection(): EditorSelection;
  setSelection(
    startSelection: EditorNodeSelection,
    endSelection?: EditorNodeSelection,
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

export { useSelection, Selection, type SelectionHandle };
