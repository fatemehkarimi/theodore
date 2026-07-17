import type { EditorNodeSelection, EditorSelection } from './types';

const areSelectionsEqual = (
  firstSelection: EditorSelection,
  secondSelection: EditorSelection,
) => {
  if (firstSelection == null || secondSelection == null) {
    return firstSelection == secondSelection;
  }

  return (
    firstSelection.startSelection.nodeIndex ==
      secondSelection.startSelection.nodeIndex &&
    firstSelection.startSelection.offset ==
      secondSelection.startSelection.offset &&
    firstSelection.endSelection.nodeIndex ==
      secondSelection.endSelection.nodeIndex &&
    firstSelection.endSelection.offset == secondSelection.endSelection.offset
  );
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
  areNodeSelectionEqual,
  areSelectionsEqual,
  isEditorSelectionCollapsed,
};
