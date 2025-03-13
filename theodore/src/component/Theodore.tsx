import React, { useImperativeHandle, useRef } from 'react';
import { useController } from '../controller/useController';
import type { RenderEmoji, TheodoreHandle } from '../types';
import styles from './Theodore.module.scss';

type Props = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'contentEditable'
> & {
  renderEmoji: RenderEmoji;
};
const Theodore = React.forwardRef<TheodoreHandle, Props>(
  ({ className, renderEmoji, ...props }, ref) => {
    const inputRef = useRef<HTMLDivElement | null>(null);
    const {
      tree,
      insertEmoji,
      handlers: { handleKeyDown },
    } = useController(inputRef, renderEmoji);

    useImperativeHandle(ref, () => {
      return {
        insertEmoji: (emoji) => {
          insertEmoji(emoji);
        },
      };
    }, []);

    return (
      <div
        className={`${styles.container} ${className}`}
        contentEditable="true"
        onKeyDown={handleKeyDown}
        ref={inputRef}
        onInput={(e) => e.preventDefault()}
        {...props}
      >
        {tree?.map((tree) => tree.render())}
      </div>
    );
  },
);

export { Theodore };
