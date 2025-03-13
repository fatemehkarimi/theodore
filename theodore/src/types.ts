import type { ReactElement } from 'react';

export type TheodoreHandle = {
  insertEmoji: (emoji: string) => void;
};

export type Selection = {
  nodeIndex: number;
  offset: number;
  isAtStart: boolean;
};

export type RenderEmoji = (emoji: string) => ReactElement;
