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
import type { onSelectionChangeFn, RenderEmoji, Selection } from '../types';
import { COMMAND_INSERT_EMOJI, COMMAND_INSERT_TEXT } from './commands';
import { useSelection } from './useSelection';

type History = {
  command: string;
  nodeIndex: number;
  prevState: string | null;
  transactionId: number;
  selection: Selection;
};
const useController = (
  inputRef: MutableRefObject<HTMLDivElement | null>,
  renderEmoji: RenderEmoji,
  listeners?: {
    onSelectionChange?: onSelectionChangeFn;
  },
) => {
  const { getSelection, setSelection } = useSelection(
    listeners?.onSelectionChange,
  );
  const [tree, setTree] = useState<Node[] | null>(null);
  const nodeIndexRef = useRef<number>(0);
  const transactionIdRef = useRef<number>(0);
  const history = useRef<History[]>([]);

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
          setSelection(prevState.selection);
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
              setSelection({
                nodeIndex: tree[prevNodeIndex + 1].getIndex(),
                offset: 0,
                isAtStart: false,
              });
            } else if (prevNodeIndex - 1 >= 0) {
              setSelection({
                nodeIndex: tree[prevNodeIndex - 1].getIndex(),
                offset: tree[prevNodeIndex - 1].getChildLength(),
                isAtStart: false,
              });
            }
          } else {
            setSelection({
              nodeIndex: prevState.nodeIndex,
              offset: newTree[selectedNodeIdx].getChildLength(),
              isAtStart: false,
            });
          }
        }

        setTree(newTree);

        requestAnimationFrame(() => {
          moveToNodeBySelection(getSelection());
        });
        return;
      }

      // todo: handle
      if (event.ctrlKey || event.altKey || event.shiftKey) return;

      if (key == HOME) {
        if (getSelection() != null)
          setSelection({ ...getSelection()!, offset: 0 });
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
          if (getSelection() != null && node != null)
            setSelection({
              ...getSelection()!,
              offset:
                getSelection()!.offset +
                ((node as TextNode).getChildren()?.length ?? 0),
            });
        }
        return;
      }

      if (isOnlyNavigationKey(event)) {
        if (key == ARROW_LEFT || key == ARROW_RIGHT) {
          const docSelection = document.getSelection();
          if (docSelection == null) return;

          const anchorNode = docSelection.anchorNode;
          const focusNode = docSelection.focusNode;
          const anchorOffset = docSelection.anchorOffset;
          const focusOffset = docSelection.focusOffset;

          docSelection.modify(
            'move',
            key == ARROW_LEFT ? 'backward' : 'forward',
            'character',
          );

          const newAnchorNode = docSelection.anchorNode;
          const newFocusNode = docSelection.focusNode;
          const newAnchorOffset = docSelection.anchorOffset;
          const newFocusOffset = docSelection.focusOffset;

          const currentNode = getNodeBeforeSelection();
          const nodeIndex =
            currentNode != null
              ? (currentNode as HTMLElement).dataset.nodeIndex
              : null;

          const node =
            nodeIndex != null ? getNodeInTreeByIndex(Number(nodeIndex)) : null;
          const offset = node?.getType() == 'text' ? newAnchorOffset : 0;
          if (nodeIndex != null) {
            setSelection({
              nodeIndex: Number(nodeIndex),
              offset: offset,
              isAtStart: false,
            });
          } else
            setSelection({
              nodeIndex: 0, // it is at the begining
              offset: 0,
              isAtStart: true,
            });
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
          textNode.insertText(text, getSelection()?.offset ?? 0);

          history.current.push({
            transactionId: getTransactionId(),
            command: COMMAND_INSERT_TEXT,
            nodeIndex: textNode.getIndex(),
            prevState: nodeChildren,
            selection: getSelection() != null ? { ...getSelection()! } : null,
          });

          if (getSelection() != null) {
            setSelection({
              ...getSelection()!,
              offset: getSelection()!.offset + text.length,
            });
          } else {
            setSelection({
              nodeIndex: textNode.getIndex(),
              offset: text.length,
              isAtStart: false,
            });
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
          getSelection() != null &&
          setCaretPosition(inputRef.current, getSelection()!.offset),
      );
    },
    [tree],
  );

  const insertEmoji = (emoji: string) => {
    const emojiNode = new EmojiNode(assignNodeIndex(), emoji, renderEmoji);

    if (getSelection()?.isAtStart) {
      setTree((tree) => (tree ? [emojiNode, ...tree] : [emojiNode]));
    } else {
      const selectedNode = getEditorSelectedNode();
      const selectedNodeOffset = getSelection()?.offset ?? 0;

      if (selectedNode != null) {
        const selectedNodeTreeIndex = getEditorSelectedNodeIndexInTree();
        if (selectedNode.getType() == 'text') {
          const selectedTextNode = selectedNode as TextNode;
          if (
            selectedNodeOffset == selectedTextNode.getChildLength() ||
            selectedNodeOffset == 0
          ) {
            setTree((tree) =>
              tree
                ? [
                    ...tree.slice(0, selectedNodeTreeIndex + 1),
                    emojiNode,
                    ...tree.slice(selectedNodeTreeIndex + 1),
                  ]
                : [emojiNode],
            );
          } else {
            const text = selectedTextNode.getChildren();
            if (text != null) {
              const [before, after] = [
                text.slice(0, selectedNodeOffset),
                text.slice(selectedNodeOffset),
              ].map((part) => {
                const textNode = new TextNode(assignNodeIndex());
                textNode.setChild(part);
                return textNode;
              });

              setTree((tree) =>
                tree
                  ? [
                      ...tree.slice(0, selectedNodeTreeIndex),
                      before,
                      emojiNode,
                      after,
                      ...tree.slice(selectedNodeTreeIndex + 1),
                    ]
                  : [before, emojiNode, after],
              );
            } else {
              throw new Error(
                'tries to insert emoji at a text node with null content',
              );
            }
          }
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

    setSelection({
      nodeIndex: emojiNode.getIndex(),
      offset: 0,
      isAtStart: false,
    });

    history.current.push({
      transactionId: getTransactionId(),
      command: COMMAND_INSERT_EMOJI,
      nodeIndex: emojiNode.getIndex(),
      prevState: null,
      selection: getSelection() != null ? { ...getSelection()! } : null,
    });

    inputRef.current?.focus();
  };

  const createTextNodeAndUpdateEditorSelection = (text: string) => {
    const textNode = new TextNode(assignNodeIndex());
    textNode.setChild(text);

    setSelection({
      nodeIndex: textNode.getIndex(),
      offset: textNode.getChildren()?.length ?? 0,
      isAtStart: false,
    });

    history.current.push({
      transactionId: getTransactionId(),
      command: COMMAND_INSERT_TEXT,
      nodeIndex: textNode.getIndex(),
      prevState: null,
      selection: getSelection() != null ? { ...getSelection()! } : null,
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
    const nodeIndex = getSelection()?.nodeIndex;
    if (nodeIndex == undefined) return null;
    return tree?.find((t) => t.getIndex() == nodeIndex) ?? null;
  };

  const getNodeInTreeByIndex = (nodeIndex: number) => {
    return tree?.find((t) => t.getIndex() == nodeIndex) ?? null;
  };

  const getEditorSelectedNodeIndexInTree = () => {
    return (
      tree?.findIndex((t) => t.getIndex() == getSelection()?.nodeIndex) ?? -1
    );
  };

  useLayoutEffect(() => {
    if (getSelection() != null) {
      const nodeIndex = getSelection()!.nodeIndex;
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

export { useController };
