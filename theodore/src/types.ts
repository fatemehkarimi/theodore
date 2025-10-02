import type { ReactElement } from 'react';
import type { Node as EditorNode } from './nodes/Node';
import type { SelectionHandle } from './controller/selection/useSelection';
import { HistoryHandle } from './controller/history/types';
import { EditorSelection } from './controller/selection/types';

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;
export type TheodoreHandle = {
  insertEmoji: (emoji: string) => void;
};

export type RenderEmoji = (emoji: string) => ReactElement;
export type onSelectionChangeFn = (selection: EditorSelection) => void;

export type TextNodeDesc = {
  type: 'text';
  text: string | null;
  nodeIndex: number;
};

export type Tree = EditorNode[][];

export type EditorState = {
  tree: Tree;
  setTree: React.Dispatch<React.SetStateAction<Tree>>;
  assignNodeIndex: () => number;
  historyHandle: HistoryHandle;
  selectionHandle: SelectionHandle;
};
