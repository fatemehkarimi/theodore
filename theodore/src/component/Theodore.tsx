import clsx from 'clsx';
import React, {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
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
  defaultDirection?: 'ltr' | 'rtl';
  theodoreRef?: React.Ref<TheodoreHandle>;
  shouldSuppressFocus?: boolean;
};
const Theodore = React.forwardRef<HTMLDivElement, Props>(
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
      defaultDirection = 'ltr',
      style,
      theodoreRef,
      shouldSuppressFocus,
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
      handleKeyDown,
      handleOnBeforeInput,
      handleSelectionChange,
      handlePaste,
      handleCut,
      clearAndSetContent,
    } = useController(inputRef, renderEmoji, editorState);

    useImperativeHandle(theodoreRef, () => {
      return {
        insertEmoji: (emoji) => {
          insertEmoji(emoji);
        },
        insertNewParagraph: () => {
          insertNewParagraph();
        },
        setContent: (content: string) => {
          clearAndSetContent(content);
        },
      };
    }, [insertEmoji, insertNewParagraph]);

    useEffect(() => {
      document.addEventListener('selectionchange', handleSelectionChange);
      return () =>
        document.removeEventListener('selectionchange', handleSelectionChange);
    }, [handleSelectionChange]);

    useEffect(() => {
      inputRef.current?.addEventListener('beforeinput', handleOnBeforeInput);
      return () =>
        inputRef.current?.removeEventListener(
          'beforeinput',
          handleOnBeforeInput,
        );
    }, [handleOnBeforeInput]);

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
      const input = inputRef.current!;

      function suppressFocus() {
        input.blur();
      }

      if (shouldSuppressFocus) {
        input.addEventListener('focus', suppressFocus);
      }

      return () => {
        input.removeEventListener('focus', suppressFocus);
      };
    }, [shouldSuppressFocus]);

    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref],
    );

    useLayoutEffect(() => {
      if (props.autoFocus) inputRef.current?.focus();
      else inputRef.current?.blur();
    }, [props.autoFocus]);

    return (
      <div className={clsx('theodore_wrapper', wrapperClassName)}>
        <div
          className={`theodore_contentEditable ${className ?? ''}`}
          contentEditable="true"
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCut={handleCut}
          ref={setRefs}
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
                ? defaultDirection == 'rtl'
                : nodes[0].isTextNode() &&
                    (nodes[0] as TextNode).getChildren() != null
                  ? isRTL(
                      (nodes[0] as TextNode).getChildren()?.slice(0, 1) ?? '',
                      defaultDirection,
                    )
                  : defaultDirection == 'rtl';

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
                'theodore_placeholder',
                {
                  theodore_hiddenPlaceholder: !isEmpty,
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

export { Theodore, type Props as TheodoreProps };
