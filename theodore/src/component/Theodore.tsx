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
      insertNewParagraph,
      handlers: { handleKeyDown },
    } = useController(inputRef, renderEmoji, {
      // todo: fix this has performance problems
      onSelectionChange: listeners?.onSelectionChange,
    });

    useImperativeHandle(ref, () => {
      return {
        insertEmoji: (emoji) => {
          insertEmoji(emoji);
        },
        insertNewParagraph: () => {
          insertNewParagraph();
        },
      };
    }, [insertEmoji, insertNewParagraph]);

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
        {tree?.map((subtree) => {
          if (subtree.length == 0) throw new Error('Subtree is empty');
          const paragraph = subtree[0];
          const nodes = subtree.slice(1);
          return paragraph.render(
            nodes.length == 0 ? undefined : (
              <>
                {nodes.map((node) => {
                  return node.render();
                })}
              </>
            ),
          );
        })}
      </div>
    );
  },
);

export { Theodore };
