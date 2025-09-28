import { useState } from 'react';
import { ParagraphNode } from '../nodes/paragraphNode/ParagraphNode';
import type {
  onEditorStateChangeFn,
  onSelectionChangeFn,
  Tree,
} from '../types';
import { useHistory } from './useHistory';
import { useSelection } from './useSelection';
import {
  ALWAYS_IN_DOM_NODE_INDEX,
  ALWAYS_IN_DOM_NODE_SELECTION,
} from './utils';

export const useEditorState = (onSelectionChange?: onSelectionChangeFn) => {
  const { getSelection, setSelection } = useSelection(
    ALWAYS_IN_DOM_NODE_SELECTION,
    onSelectionChange,
  );
  const historyHandle = useHistory(getSelection);
  const [tree, setTree] = useState<Tree>([
    [new ParagraphNode(ALWAYS_IN_DOM_NODE_INDEX)],
  ]);

  const onEditorStateChange: onEditorStateChangeFn = (
    newTree,
    _,
    newSelection,
  ) => {
    setTree(newTree);
    if (newSelection)
      setSelection(newSelection?.startSelection, newSelection?.endSelection);
  };

  return {
    tree,
    historyHandle,
    onEditorStateChange,
  };
};
