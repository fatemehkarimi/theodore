import React, { useImperativeHandle, useRef } from 'react';
import { useController } from '../controller/useController';
import type {
  onSelectionChangeFn,
  RenderEmoji,
  TheodoreHandle,
} from '../types';
import styles from './Theodore.module.scss';

type Props = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'contentEditable'
> & {
  renderEmoji: RenderEmoji;
  listeners?: {
    onSelectionChange?: onSelectionChangeFn;
  };
};
const Theodore = React.forwardRef<TheodoreHandle, Props>(
  ({ className, renderEmoji, listeners, ...props }, ref) => {
    const inputRef = useRef<HTMLDivElement | null>(null);
    const {
      tree,
      insertEmoji,
      handlers: { handleKeyDown },
    } = useController(inputRef, renderEmoji, {// todo: fix this has performance problems
      onSelectionChange: listeners?.onSelectionChange,
    });

    useImperativeHandle(ref, () => {
      return {
        insertEmoji: (emoji) => {
          insertEmoji(emoji);
        },
      };
    }, [insertEmoji]);

    return (
      <div
        className={`${styles.container} ${className}`}
        contentEditable="true"
        onKeyDown={handleKeyDown}
        ref={inputRef}
        onInput={(e) => e.preventDefault()}
        {...props}
        suppressContentEditableWarning={true}
      >
        {tree?.map((tree) => tree.render())}
      </div>
    );
  },
);

export { Theodore };
