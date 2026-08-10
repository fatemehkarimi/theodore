import type { ReactElement } from 'react';
import type { Node as EditorNode } from './nodes/Node';
import type { SelectionHandle } from './controller/selection/useSelection';
import { HistoryHandle } from './controller/history/types';
import { EditorSelection } from './controller/selection/types';

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;
export type AcceptSuggestionFn = () => void;
export type RejectSuggestionFn = () => void;
export type ResetEditorFn = () => void;
export type TheodoreHandle = {
  insertEmoji: (emoji: string) => void;
  setContent: (content: string) => void;
  resetEditor: ResetEditorFn;
  acceptSuggestion: AcceptSuggestionFn;
  rejectSuggestion: RejectSuggestionFn;
};

export interface RenderEmoji {
  (emoji: string): ReactElement;
}

export interface onSelectionChangeFn {
  (selection: EditorSelection): void;
}

export interface onTreeChangeFn {
  (tree: Tree): void;
}

export type EditorStateListener = {
  onSelectionChange?: onSelectionChangeFn;
  onTreeChange?: onTreeChangeFn;
};

export type TextNodeDesc = {
  type: 'text';
  text: string | null;
  nodeIndex: number;
};

export type Tree = EditorNode[][];

export type EditorState = {
  tree: Tree;
  setTree(tree: Tree): void;
  subscribe(listener: EditorStateListener): () => void;
  assignNodeIndex(): number;
  reset(): void;
  historyHandle: HistoryHandle;
  selectionHandle: SelectionHandle;
};

export type SuggestionHintProps = {
  direction?: 'rtl' | 'ltr';
  acceptSuggestion?: AcceptSuggestionFn;
};
