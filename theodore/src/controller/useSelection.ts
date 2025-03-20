import { useRef } from 'react';
import type { onSelectionChangeFn, Selection } from '../types';

const useSelection = (onSelectionChange?: onSelectionChangeFn) => {
  const selection = useRef<Selection>(null);

  const setSelection = (newSelection: Selection) => {
    selection.current = newSelection;
    onSelectionChange?.(selection.current);
  };

  const getSelection = () => {
    return selection.current;
  };

  return {
    getSelection,
    setSelection,
  };
};

export { useSelection };
