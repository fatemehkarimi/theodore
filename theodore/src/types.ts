import type { ReactElement } from 'react';
import type { Node as EditorNode } from './nodes/Node';
import { History, HistoryHandle } from './controller/useHistory';

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;
export type TheodoreHandle = {
  insertEmoji: (emoji: string) => void;
};

export type SelectionDesc = {
  readonly nodeIndex: number;
  readonly offset: number;
};
export type EditorNodeSelection = SelectionDesc | null;
export type EditorSelection = {
  startSelection: SelectionDesc;
  endSelection: SelectionDesc;
} | null;
export type EditorSelectionChangeEvent = Optional<
  NonNullable<EditorSelection>,
  'endSelection'
> | null;
export type RenderEmoji = (emoji: string) => ReactElement;
export type onSelectionChangeFn = (selection: EditorSelection) => void;

export type TextNodeDesc = {
  type: 'text';
  text: string | null;
  nodeIndex: number;
};

export type Tree = EditorNode[][];

export type HistoryCommand = {
  command: string;
  nodeIndex: number;
  prevState: string | TextNodeDesc | (EditorNode | EditorNode[])[] | null;
  transactionId: number;
  selection: EditorSelection;
  prevNodeIndexInTree?: number;
  nextNodeIndexInTree?: number;
};
export type HistoryStack = HistoryCommand[];

export type EditorState = {
  tree: Tree;
  historyHandle: HistoryHandle;
  getSelection: () => EditorSelection;
};

export type onEditorStateChangeFn = (
  newTree: Tree,
  newHistory?: History,
  selectionChangeEvent?: EditorSelectionChangeEvent,
) => void;
