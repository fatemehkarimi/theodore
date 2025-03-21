import type { ReactElement } from 'react';

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;
export type TheodoreHandle = {
  insertEmoji: (emoji: string) => void;
};

export type SelectionDesc = {
  readonly nodeIndex: number;
  readonly offset: number;
  readonly isAtStart: boolean;
};
export type Selection = SelectionDesc | null;
export type RenderEmoji = (emoji: string) => ReactElement;
export type onSelectionChangeFn = (selection: Selection) => void;

export type TextNodeDesc = {
  type: 'text';
  text: string | null;
  nodeIndex: number;
};
