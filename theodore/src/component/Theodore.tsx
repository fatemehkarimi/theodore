import clsx from 'clsx';
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { useController } from '../controller/useController';
import { isEditorEmpty } from '../controller/useEditorState';
import ParagraphNode from '../nodes/paragraphNode/ParagraphNode';
import { TextNode } from '../nodes/textNode/TextNode';
import { isRTL } from '../rtl';
import type {
  EditorState,
  onSelectionChangeFn,
  RenderEmoji,
  TheodoreHandle,
} from '../types';
import { computeLineHeightPx } from '../utils';
import styles from './Theodore.module.scss';

type Props = Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'contentEditable'
> & {
  editorState: EditorState;
  renderEmoji: RenderEmoji;
  placeholder?: string | React.ReactNode;
  onSelectionChange?: onSelectionChangeFn;
  wrapperClassName?: string;
  placeholderClassName?: string;
  maxLines?: number;
};
const Theodore = React.forwardRef<TheodoreHandle, Props>(
  (
    {
      className,
      renderEmoji,
      onSelectionChange,
      editorState,
      placeholder,
      wrapperClassName,
      placeholderClassName,
      maxLines,
      style,
      ...props
    },
    ref,
  ) => {
    const { tree } = editorState;
    const isEmpty = isEditorEmpty(tree);
    const inputRef = useRef<HTMLDivElement | null>(null);
    const [maxHeight, setMaxHeight] = React.useState<number | null>(null);
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

    useEffect(() => {
      if (maxLines == null || maxLines <= 0) return;
      const element = inputRef.current;
      if (!element) return;
      const computedStyle = window.getComputedStyle(element);
      const lineHeightPx = computeLineHeightPx(computedStyle);
      setMaxHeight(
        lineHeightPx != null && Number.isFinite(lineHeightPx)
          ? lineHeightPx * maxLines
          : null,
      );
    }, [maxLines]);

    useEffect(() => {
      inputRef.current?.addEventListener('beforeinput', handleOnBeforeInput);
      return () =>
        inputRef.current?.removeEventListener(
          'beforeinput',
          handleOnBeforeInput,
        );
    }, [handleOnBeforeInput]);

    return (
      <div className={clsx(styles.wrapper, wrapperClassName)}>
        <div
          className={`${styles.container} ${className ?? ''}`}
          contentEditable="true"
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          ref={inputRef}
          onInput={(e) => e.preventDefault()}
          autoCorrect="off"
          spellCheck="false"
          style={{
            ...(maxHeight != null ? { maxHeight: `${maxHeight}px` } : {}),
            ...style,
          }}
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
                  ? isRTL(
                      (nodes[0] as TextNode).getChildren()?.slice(0, 1) ?? '',
                    )
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
        {placeholder != undefined ? (
          typeof placeholder == 'string' ? (
            <div
              className={clsx(
                styles.placeholder,
                {
                  [styles.hiddenPlaceholder]: !isEmpty,
                },
                placeholderClassName,
              )}
            >
              {placeholder}
            </div>
          ) : isEmpty ? (
            placeholder
          ) : null
        ) : null}
      </div>
    );
  },
);

export { Theodore };
