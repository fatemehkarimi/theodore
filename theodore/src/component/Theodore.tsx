import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { useController } from '../controller/useController';
import type {
  EditorState,
  onSelectionChangeFn,
  RenderEmoji,
  TheodoreHandle,
} from '../types';
import styles from './Theodore.module.scss';
import ParagraphNode from '../nodes/paragraphNode/ParagraphNode';
import { TextNode } from '../nodes/textNode/TextNode';
import { isRTL } from '../rtl';

type Props = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'contentEditable'
> & {
  editorState: EditorState;
  renderEmoji: RenderEmoji;
  onSelectionChange?: onSelectionChangeFn;
};
const Theodore = React.forwardRef<TheodoreHandle, Props>(
  (
    { className, renderEmoji, onSelectionChange, editorState, ...props },
    ref,
  ) => {
    const { tree } = editorState;
    const inputRef = useRef<HTMLDivElement | null>(null);
    const {
      insertEmoji,
      insertNewParagraph,
      handlers: {
        handleKeyDown,
        handleOnBeforeInput,
        handleSelectionChange,
        handlePaste,
      },
    } = useController(inputRef, renderEmoji, editorState);

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

    useEffect(() => {
      document.addEventListener('selectionchange', handleSelectionChange);
      return () =>
        document.removeEventListener('selectionchange', handleSelectionChange);
    }, [handleSelectionChange]);

    return (
      <div
        className={`${styles.container} ${className ?? ''}`}
        contentEditable="true"
        onKeyDown={handleKeyDown}
        onBeforeInput={handleOnBeforeInput}
        onPaste={handlePaste}
        ref={inputRef}
        onInput={(e) => e.preventDefault()}
        autoCorrect="off"
        spellCheck="false"
        {...props}
        suppressContentEditableWarning
      >
        {tree?.map((subtree) => {
          if (subtree.length == 0) throw new Error('Subtree is empty');
          const paragraph = subtree[0] as ParagraphNode;
          const nodes = subtree.slice(1);
          const startsWithRTL =
            nodes.length == 0
              ? false
              : nodes[0].isTextNode() &&
                  (nodes[0] as TextNode).getChildren() != null
                ? isRTL((nodes[0] as TextNode).getChildren()?.slice(0, 1) ?? '')
                : false;
          return paragraph.render(
            nodes.length == 0 ? undefined : (
              <>
                {nodes.map((node) => {
                  return node.render();
                })}
              </>
            ),
            startsWithRTL ? 'rtl' : 'ltr',
          );
        })}
      </div>
    );
  },
);

export { Theodore };
