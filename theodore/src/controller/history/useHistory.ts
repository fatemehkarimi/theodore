import { useRef } from 'react';
import type { EditorSelection } from '../selection/types';
import type { HistoryHandle } from './types';
import { History } from './history';

const useHistory = (getSelection: () => EditorSelection): HistoryHandle => {
  const historyRef = useRef<History>(new History(getSelection));

  const clone = () => {
    return historyRef.current.clone();
  };

  return {
    clone,
    history: historyRef.current,
  };
};

export { useHistory };
