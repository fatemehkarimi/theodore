import { useRef } from 'react';
import type { onSelectionChangeFn, Selection } from '../types';

const useSelection = (
  initialSelection: Selection,
  onSelectionChange?: onSelectionChangeFn,
) => {
  const selection = useRef<Selection>(initialSelection);

  const setSelection = (newSelection: Selection) => {
    selection.current = newSelection;
    onSelectionChange?.(selection.current);
  };

  const getSelection = () => {
    return selection.current != null ? { ...selection.current } : null;
  };

  return {
    getSelection,
    setSelection,
  };
};

export { useSelection };
