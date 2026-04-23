import type { EditorSelection } from 'theodore-js';
import React, { useImperativeHandle, useState } from 'react';
import styles from '../App.module.scss';
import { BlurInput } from '../BlurInput';

/* eslint-disable no-unused-vars */
export type SelectionPreviewHandle = {
  onSelectionUpdate(newSelection: EditorSelection): void;
};
/* eslint-enable no-unused-vars */

const SelectionPreview = React.forwardRef<SelectionPreviewHandle>((_, ref) => {
  const [selection, setSelection] = useState<EditorSelection | null>(null);
  useImperativeHandle(ref, () => {
    return {
      onSelectionUpdate: (newSelection: EditorSelection) => {
        setSelection(newSelection);
      },
    };
  }, []);
  return (
    <div className={styles.selectionPreview}>
      <BlurInput label="Start Selection">
        <div className={styles.selectionInfo}>
          <p>Node Index: {selection?.startSelection.nodeIndex ?? 'null'}</p>
          <p>Offset: {selection?.startSelection.offset ?? 'null'}</p>
        </div>
      </BlurInput>
      <BlurInput label="End Selection">
        <div className={styles.selectionInfo}>
          <p>Node Index: {selection?.endSelection.nodeIndex ?? 'null'}</p>
          <p>Offset: {selection?.endSelection.offset ?? 'null'}</p>
        </div>
      </BlurInput>
    </div>
  );
});

SelectionPreview.displayName = 'SelectionPreview';

export { SelectionPreview };
