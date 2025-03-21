import { useRef } from 'react';
import type { Optional, Selection, TextNodeDesc } from '../types';

type History = {
  command: string;
  nodeIndex: number;
  prevState: string | TextNodeDesc | null;
  transactionId: number;
  selection: Selection;
};

type pushFn = (
  newHistory: Optional<Omit<History, 'transactionId'>, 'selection'>[],
) => void;
const useHistory = (getSelection: () => Selection) => {
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
