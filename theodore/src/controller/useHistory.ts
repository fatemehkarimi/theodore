import { useRef } from 'react';
import { Node as EditorNode } from '../nodes/Node';
import type { EditorSelection, Optional, TextNodeDesc } from '../types';

type History = {
  command: string;
  nodeIndex: number;
  prevState: string | TextNodeDesc | (EditorNode | EditorNode[])[] | null;
  transactionId: number;
  selection: EditorSelection;
  prevNodeIndexInTree?: number;
  nextNodeIndexInTree?: number;
};

type pushFn = (
  newHistory: Optional<Omit<History, 'transactionId'>, 'selection'>[],
) => void;
const useHistory = (getSelection: () => EditorSelection) => {
  const history = useRef<History[]>([]);
  const transactionIdRef = useRef<number>(0);

  const pop = () => {
    return history.current.pop();
  };

  const push: pushFn = (newHistory) => {
    const transactionId = assignTransactionId();
    history.current.push(
      ...newHistory.map((h) => ({
        ...h,
        transactionId,
        selection: h.selection != undefined ? h.selection : getSelection(),
      })),
    );
  };

  const pushAndCommit: pushFn = (newHistory) => {
    push(newHistory);
    commit();
  };

  const assignTransactionId = () => {
    return transactionIdRef.current;
  };

  const commit = () => {
    transactionIdRef.current += 1;
  };

  const top = () => {
    return history.current[history.current.length - 1];
  };

  return { top, pop, push, pushAndCommit };
};

export { useHistory };
