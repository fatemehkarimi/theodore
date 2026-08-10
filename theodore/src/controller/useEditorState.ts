import { useCallback, useRef, useState } from 'react';
import ParagraphNode from '../nodes/paragraphNode/ParagraphNode';
import type { EditorState, EditorStateListener, Tree } from '../types';
import { useHistory } from './history/useHistory';
import { useSelection } from './selection/useSelection';
import {
  ALWAYS_IN_DOM_NODE_INDEX,
  ALWAYS_IN_DOM_NODE_SELECTION,
} from './utils';
import type { EditorSelection } from './selection/types';

const useEditorState = (): EditorState => {
  const nodeIndexRef = useRef<number>(ALWAYS_IN_DOM_NODE_INDEX); // starts at 1 because 1 is a paragraph node that is always in dom
  const listenersRef = useRef(new Set<EditorStateListener>());

  const notifySelectionChange = useCallback((selection: EditorSelection) => {
    for (const listener of [...listenersRef.current]) {
      listener.onSelectionChange?.(selection);
    }
  }, []);

  const notifyTreeChange = useCallback((tree: Tree) => {
    for (const listener of [...listenersRef.current]) {
      listener.onTreeChange?.(tree);
    }
  }, []);

  const subscribe = useCallback((listener: EditorStateListener) => {
    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const selectionHandle = useSelection(
    ALWAYS_IN_DOM_NODE_SELECTION,
    notifySelectionChange,
  );
  const historyHandle = useHistory(selectionHandle.getSelection);
  const [tree, setTree] = useState<Tree>([
    [new ParagraphNode(ALWAYS_IN_DOM_NODE_INDEX)],
  ]);

  const assignNodeIndex = useCallback(() => {
    ++nodeIndexRef.current;
    return nodeIndexRef.current;
  }, []);

  const setTreeAndNotify = useCallback(
    (tree: Tree) => {
      setTree(tree);
      notifyTreeChange(tree);
    },
    [notifyTreeChange],
  );

  const reset = () => {
    historyHandle.history.reset();
    nodeIndexRef.current = ALWAYS_IN_DOM_NODE_INDEX;
    selectionHandle.setSelection(ALWAYS_IN_DOM_NODE_SELECTION);
    setTreeAndNotify([[new ParagraphNode(ALWAYS_IN_DOM_NODE_INDEX)]]);
  };

  return {
    tree,
    setTree: setTreeAndNotify,
    subscribe,
    assignNodeIndex,
    reset,
    historyHandle,
    selectionHandle,
  };
};

const convertTreeToText = (tree: Tree) => {
  return tree
    .map((subTree) => subTree.map((node) => node.getContent()).join(''))
    .join('\n');
};

const isEditorEmpty = (tree: Tree) => {
  return tree.length === 0 || (tree.length === 1 && tree[0].length <= 1);
};

export { convertTreeToText, useEditorState, isEditorEmpty };
