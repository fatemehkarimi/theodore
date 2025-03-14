import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import { ARROW_LEFT, ARROW_RIGHT, END, HOME } from '../keys';
import EmojiNode from '../nodes/emojiNode/EmojiNode';
import { Node } from '../nodes/Node';
import TextNode from '../nodes/textNode/TextNode';
import {
  getNodeBeforeSelection,
  isOnlyNavigationKey,
  moveToNodeBySelection,
  setCaretAfter,
  setCaretPosition,
  setCaretToEnd,
} from '../selection/selection';
import type { RenderEmoji, Selection } from '../types';
import { COMMAND_INSERT_EMOJI, COMMAND_INSERT_TEXT } from './commands';

type History = {
  command: string;
  nodeIndex: number;
  prevState: string | null;
  transactionId: number;
  selection?: Selection | null;
};

export const useController = (
  inputRef: MutableRefObject<HTMLDivElement | null>,
  renderEmoji: RenderEmoji,
) => {
  const [tree, setTree] = useState<Node[] | null>(null);
  const nodeIndexRef = useRef<number>(0);
  const transactionIdRef = useRef<number>(0);
  const history = useRef<History[]>([]);
  const editorSelection = useRef<Selection | null>(null);

  const handleKeyDown: React.KeyboardEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      const key = event.key;

      if (event.ctrlKey && key == 'z') {
        const prevState = history.current.pop();
        if (tree == null || prevState == null) return;

        const newTree = tree
          .map((t) => {
            if (t.getIndex() == prevState.nodeIndex) {
              if (prevState.command == COMMAND_INSERT_TEXT) {
                if (prevState.prevState != null) {
                  (t as TextNode).setChild(prevState.prevState);
                  return t;
                } else return null;
              }
            } else return t;
          })
          .filter((t) => t != null);

        if (prevState.selection) {
          editorSelection.current = prevState.selection;
        } else {
          // find selection
          const selectedNodeIdx = newTree.findIndex(
            (t) => t.getIndex() == prevState.nodeIndex,
          );

          if (selectedNodeIdx == -1) {
            const prevNodeIndex = tree.findIndex(
              (t) => t.getIndex() == prevState.nodeIndex,
            );

            if (prevNodeIndex + 1 < tree.length) {
              editorSelection.current = {
                nodeIndex: tree[prevNodeIndex + 1].getIndex(),
                offset: 0,
                isAtStart: false,
              };
            } else if (prevNodeIndex - 1 >= 0) {
              editorSelection.current = {
                nodeIndex: tree[prevNodeIndex - 1].getIndex(),
                offset: tree[prevNodeIndex - 1].getChildLength(),
                isAtStart: false,
              };
            }
          } else {
            editorSelection.current = {
              nodeIndex: prevState.nodeIndex,
              offset: newTree[selectedNodeIdx].getChildLength(),
              isAtStart: false,
            };
          }
        }

        setTree(newTree);

        requestAnimationFrame(() => {
          moveToNodeBySelection(editorSelection.current);
        });
        return;
      }

      // todo: handle
      if (event.ctrlKey || event.altKey || event.shiftKey) return;

      if (key == HOME) {
        if (editorSelection.current != null) editorSelection.current.offset = 0;
        if (inputRef.current != null) setCaretPosition(inputRef.current, 0);
        return;
      }

      if (key == END) {
        if (inputRef.current != null && tree != null) {
          setCaretToEnd(inputRef.current);
          const el = inputRef.current.childNodes[0] as HTMLElement;
          const nodeIndex =
            el.dataset.nodeIndex != undefined
              ? Number(el.dataset.nodeIndex)
              : undefined;
          const node = tree.find((n) => n.getIndex() == nodeIndex);
          if (editorSelection.current != null && node != null)
            editorSelection.current.offset +=
              (node as TextNode).getChildren()?.length ?? 0;
        }
        return;
      }

      if (isOnlyNavigationKey(event)) {
        if (key == ARROW_LEFT || key == ARROW_RIGHT) {
          const selection = document.getSelection();
          if (selection == null) return;

          const anchorNode = selection.anchorNode;
          const focusNode = selection.focusNode;
          const anchorOffset = selection.anchorOffset;
          const focusOffset = selection.focusOffset;

          selection.modify(
            'move',
            key == ARROW_LEFT ? 'backward' : 'forward',
            'character',
          );

          const newAnchorNode = selection.anchorNode;
          const newFocusNode = selection.focusNode;
          const newAnchorOffset = selection.anchorOffset;
          const newFocusOffset = selection.focusOffset;

          const selectionHasChanged =
            newAnchorNode != anchorNode ||
            newFocusNode != focusNode ||
            newAnchorOffset != anchorOffset ||
            newFocusOffset != focusOffset;

          const currentNode = getNodeBeforeSelection();
          const nodeIndex =
            currentNode != null
              ? (currentNode as HTMLElement).dataset.nodeIndex
              : null;

          if (nodeIndex != null) {
            editorSelection.current = {
              nodeIndex: Number(nodeIndex),
              offset: editorSelection.current?.offset ?? 0,
              isAtStart: false,
            };
          } else
            editorSelection.current = {
              nodeIndex: 0, // it is at the begining
              offset: 0,
              isAtStart: true,
            };

          if (editorSelection.current != undefined && selectionHasChanged) {
            const diff = key == ARROW_LEFT ? -1 : 1;
            editorSelection.current.offset += diff;
          }
        }

        return;
      }

      const text = key;
      if (tree == null || tree.length == 0) {
        const textNode = createTextNodeAndUpdateEditorSelection(text);
        setTree([textNode]);
      } else {
        const node = getEditorSelectedNode()!;
        if (node.getType() == 'text') {
          const textNode = node as TextNode;
          const nodeChildren = textNode.getChildren();
          textNode.insertText(text, editorSelection.current?.offset ?? 0);

          history.current.push({
            transactionId: getTransactionId(),
            command: COMMAND_INSERT_TEXT,
            nodeIndex: textNode.getIndex(),
            prevState: nodeChildren,
            selection:
              editorSelection.current != null
                ? { ...editorSelection.current }
                : null,
          });

          if (editorSelection.current != null) {
            editorSelection.current.offset += text.length;
          } else {
            editorSelection.current = {
              nodeIndex: textNode.getIndex(),
              offset: text.length,
              isAtStart: false,
            };
          }
        } else if (node.getType() == 'emoji') {
          const textNode = createTextNodeAndUpdateEditorSelection(text);
          setTree([...tree, textNode]);
        }

        setTree([node]);
      }

      requestAnimationFrame(
        () =>
          inputRef.current != null &&
          editorSelection.current != null &&
          setCaretPosition(inputRef.current, editorSelection.current.offset),
      );
    },
    [tree],
  );

  const insertEmoji = (emoji: string) => {
    const emojiNode = new EmojiNode(assignNodeIndex(), emoji, renderEmoji);

    if (editorSelection.current?.isAtStart) {
      setTree((tree) => (tree ? [emojiNode, ...tree] : [emojiNode]));
    } else {
      const selectedNode = getEditorSelectedNode();
      selectedNode?.getIndex();
      const selectedNodeOffset = editorSelection.current?.offset ?? 0;

      if (selectedNode != null) {
        const selectedNodeTreeIndex = getEditorSelectedNodeIndexInTree();
        if (selectedNode.getType() == 'text') {
        } else {
          setTree((tree) =>
            tree
              ? [
                  ...tree.slice(0, selectedNodeTreeIndex + 1),
                  emojiNode,
                  ...tree.slice(selectedNodeTreeIndex + 1),
                ]
              : [emojiNode],
          );
        }
      } else {
        setTree((tree) => (tree ? [...tree, emojiNode] : [emojiNode]));
      }
    }

    editorSelection.current = {
      nodeIndex: emojiNode.getIndex(),
      offset: 0,
      isAtStart: false,
    };

    history.current.push({
      transactionId: getTransactionId(),
      command: COMMAND_INSERT_EMOJI,
      nodeIndex: emojiNode.getIndex(),
      prevState: null,
    });

    inputRef.current?.focus();
  };

  const createTextNodeAndUpdateEditorSelection = (text: string) => {
    const textNode = new TextNode(assignNodeIndex());
    textNode.setChild(text);

    editorSelection.current = {
      nodeIndex: textNode.getIndex(),
      offset: textNode.getChildren()?.length ?? 0,
      isAtStart: false,
    };

    history.current.push({
      transactionId: getTransactionId(),
      command: COMMAND_INSERT_TEXT,
      nodeIndex: textNode.getIndex(),
      prevState: null,
    });
    return textNode;
  };

  const assignNodeIndex = () => {
    ++nodeIndexRef.current;
    return nodeIndexRef.current;
  };

  const getTransactionId = () => {
    ++transactionIdRef.current;
    return transactionIdRef.current;
  };

  const getEditorSelectedNode = () => {
    const nodeIndex = editorSelection.current?.nodeIndex;
    if (nodeIndex == undefined) return null;
    return tree?.find((t) => t.getIndex() == nodeIndex) ?? null;
  };

  const getEditorSelectedNodeIndexInTree = () => {
    return (
      tree?.findIndex(
        (t) => t.getIndex() == editorSelection.current?.nodeIndex,
      ) ?? -1
    );
  };

  useLayoutEffect(() => {
    if (editorSelection.current) {
      const nodeIndex = editorSelection.current!.nodeIndex;
      const nodeElement = document.querySelectorAll(
        `[data-node-index="${nodeIndex}"]`,
      )?.[0];
      if (nodeElement == null) return;
      setCaretAfter(nodeElement);
    }
  }, [tree]);

  return {
    tree,
    insertEmoji,
    handlers: {
      handleKeyDown,
    },
  };
};
