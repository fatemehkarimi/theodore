import type { Node as EditorNode } from '../../nodes/Node';
import type { TextNodeDesc } from '../../types';
import type { EditorSelection } from '../selection/types';
import type { History } from './history';

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

export interface HistoryHandle {
  clone(): History;
  history: History;
}
