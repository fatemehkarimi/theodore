import { useRef, useState } from 'react';
import ParagraphNode from '../nodes/paragraphNode/ParagraphNode';
import type { EditorState, onSelectionChangeFn, Tree } from '../types';
import { useHistory } from './history/useHistory';
import { useSelection } from './selection/useSelection';
import {
  ALWAYS_IN_DOM_NODE_INDEX,
  ALWAYS_IN_DOM_NODE_SELECTION,
} from './utils';

const useEditorState = (
  onSelectionChange?: onSelectionChangeFn,
): EditorState => {
  const nodeIndexRef = useRef<number>(ALWAYS_IN_DOM_NODE_INDEX); // starts at 1 because 1 is a paragraph node that is always in dom

  const selectionHandle = useSelection(
    ALWAYS_IN_DOM_NODE_SELECTION,
    onSelectionChange,
  );
  const historyHandle = useHistory(selectionHandle.getSelection);
  const [tree, setTree] = useState<Tree>([
    [new ParagraphNode(ALWAYS_IN_DOM_NODE_INDEX)],
  ]);

  const assignNodeIndex = () => {
    ++nodeIndexRef.current;
    return nodeIndexRef.current;
  };

  return {
    tree,
    setTree,
    assignNodeIndex,
    historyHandle,
    selectionHandle,
  };
};

const convertTreeToText = (tree: Tree) => {
  let result = '';
  for (let pI = 0; pI < tree.length; ++pI) {
    const subTree = tree[pI];
    for (let nI = 0; nI < tree[pI].length; ++nI) {
      result += subTree[nI].getChildren() ?? '';
    }
    result += '\n';
  }
  return result;
};

const isEditorEmpty = (tree: Tree) => {
  return tree.length === 0 || (tree.length === 1 && tree[0].length <= 1);
};

export { convertTreeToText, useEditorState, isEditorEmpty };
