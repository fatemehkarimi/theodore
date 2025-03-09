import type { MutableRefObject } from 'react';
import React, { useRef } from 'react';
import { useController } from '../controller/useController';
import styles from './Theodore.module.scss';

type OwnProps = {
  apiRef?: MutableRefObject<FeditorHandle | null>;
};
export type FeditorHandle = {
  insertEmoji: (emoji: string) => void;
};

const Theodore: React.FC<OwnProps> = (ownProps) => {
  const inputRef = useRef<HTMLDivElement | null>(null);
  const {
    tree,
    insertEmoji,
    handlers: { handleKeyDown },
  } = useController(inputRef);

  if (ownProps.apiRef != null)
    ownProps.apiRef.current = {
      insertEmoji: (emoji) => {
        insertEmoji(emoji);
      },
    };

  return (
    <div
      className={styles.FeditorContainer}
      contentEditable="true"
      onKeyDown={handleKeyDown}
      ref={inputRef}
      onInput={(e) => e.preventDefault()}
    >
      {tree?.map((tree) => tree.render())}
    </div>
  );
};

export { Theodore };
