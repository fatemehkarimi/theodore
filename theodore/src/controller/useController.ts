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
  setCaretToBegining,
  setCaretToEnd,
} from '../selection/selection';
import type {
  onSelectionChangeFn,
  RenderEmoji,
  Selection,
  TextNodeDesc,
} from '../types';
import {
  COMMAND_INSERT_EMOJI,
  COMMAND_INSERT_TEXT,
  COMMAND_REPLACE,
} from './commands';
import { useHistory } from './useHistory';
import { useSelection } from './useSelection';

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
  const history = useHistory(getSelection);
  const [tree, setTree] = useState<Node[] | null>(null);
  const nodeIndexRef = useRef<number>(0);

  const handleKeyDown: React.KeyboardEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      const key = event.key;

      if (event.ctrlKey && key == 'z') {
        if (tree == null) return;
        let transactionId = undefined;
        do {
          const prevState = history.pop();
          if (prevState == null) return;
          if (transactionId == undefined)
            transactionId = prevState.transactionId;
          setTree((tree) => {
            if (tree == null) return null;
            const newTree = tree
              .map((t) => {
                if (t.getIndex() == prevState.nodeIndex) {
                  if (prevState.command == COMMAND_INSERT_TEXT) {
                    if (prevState.prevState != null) {
                      // todo: fix when command is insert the node type can't be an object
                      (t as TextNode).setChild(prevState.prevState as string);
                      return t;
                    } else return null;
                  } else {
                    prevState.command == COMMAND_REPLACE;
                  }
                  {
                    if (prevState.prevState != null) {
                      window.console.log('here prevState= ', prevState);
                      const node = TextNode.fromDescriptor(
                        prevState.prevState as TextNodeDesc,
                      );
                      return node;
                    } else return null;
                  }
                } else return t;
              })
              .filter((t) => t != null);
            return newTree;
          });
          setSelection(prevState.selection);
        } while (transactionId == history.top()?.transactionId);

        requestAnimationFrame(() => {
          moveToNodeBySelection(getSelection());
        });
        return;
      }

      // todo: handle
      if (event.ctrlKey || event.altKey || event.shiftKey) return;

      if (key == HOME) {
        if (tree == null) return;
        setSelection(null);

        requestAnimationFrame(() => {
          inputRef.current != null && setCaretToBegining(inputRef.current);
        });
        return;
      }

      if (key == END) {
        if (inputRef.current != null && tree != null) {
          setCaretToEnd(inputRef.current);
          const last = tree ? tree[tree.length - 1] : null;
          const selection: Selection =
            last == null
              ? null
              : {
                  nodeIndex: last.getIndex(),
                  offset: last.getType() == 'text' ? last.getChildLength() : 0,
                };
          setSelection(selection);
        }
        return;
      }

      if (isOnlyNavigationKey(event)) {
        if (key == ARROW_LEFT || key == ARROW_RIGHT) {
          const docSelection = document.getSelection();
          if (docSelection == null) return;

          docSelection.modify(
            'move',
            key == ARROW_LEFT ? 'backward' : 'forward',
            'character',
          );
          const newAnchorOffset = docSelection.anchorOffset;
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
            });
          } else setSelection(null);
        }

        return;
      }

      const text = key;
      if (tree == null || tree.length == 0) {
        const textNode = createTextNodeAndUpdateEditorSelection(text);
        setTree([textNode]);
      } else {
        const node = getEditorSelectedNode();
        if (node == null || node.getType() != 'text') {
          const textNode = new TextNode(assignNodeIndex());
          textNode.setChild(text);
          const selection = getSelection();
          const selectedNodeIndexInTree = getEditorSelectedNodeIndexInTree();

          setTree((tree) => {
            if (!tree) return [textNode];
            if (selection == null) return [textNode, ...tree];
            return [
              ...tree.slice(0, selectedNodeIndexInTree + 1),
              textNode,
              ...tree.slice(selectedNodeIndexInTree + 1),
            ];
          });
          history.pushAndCommit([
            {
              command: COMMAND_INSERT_TEXT,
              nodeIndex: textNode.getIndex(),
              prevState: null,
            },
          ]);
          setSelection({
            nodeIndex: textNode.getIndex(),
            offset: textNode.getChildLength(),
          });
        } else if (node.getType() == 'text') {
          const textNode = node as TextNode;
          const prevText = textNode.getChildren();
          const offset = getSelection()?.offset ?? 0;
          textNode.insertText(text, offset);

          history.pushAndCommit([
            {
              command: COMMAND_INSERT_TEXT,
              nodeIndex: textNode.getIndex(),
              prevState: prevText,
            },
          ]);
          setSelection({
            nodeIndex: textNode.getIndex(),
            offset: offset + text.length,
          });
        }
      }

      requestAnimationFrame(
        () =>
          inputRef.current != null &&
          getSelection() != null &&
          moveToNodeBySelection(getSelection()),
      );
    },
    [tree],
  );

  const insertEmoji = (emoji: string) => {
    const emojiNode = new EmojiNode(assignNodeIndex(), emoji, renderEmoji);

    const selectedNode = getEditorSelectedNode();
    const selectedNodeOffset = getSelection()?.offset ?? 0;

    if (selectedNode != null) {
      const selectedNodeTreeIndex = getEditorSelectedNodeIndexInTree();
      const isInsertAtBeginingOrEndOfTextNode =
        selectedNode.getType() == 'text' &&
        (selectedNodeOffset == (selectedNode as TextNode).getChildLength() ||
          selectedNodeOffset == 0);

      if (
        selectedNode.getType() != 'text' ||
        isInsertAtBeginingOrEndOfTextNode
      ) {
        const offset =
          selectedNode.getType() == 'text' && selectedNodeOffset == 0 ? 0 : 1;
        setTree((tree) =>
          tree
            ? [
                ...tree.slice(0, selectedNodeTreeIndex + offset),
                emojiNode,
                ...tree.slice(selectedNodeTreeIndex + offset),
              ]
            : [emojiNode],
        );
      } else {
        const selectedTextNode = selectedNode as TextNode;
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

          history.push([
            {
              command: COMMAND_INSERT_TEXT,
              nodeIndex: after.getIndex(),
              prevState: null,
            },
            {
              command: COMMAND_REPLACE,
              nodeIndex: before.getIndex(),
              prevState: selectedTextNode.toDescriptor(),
            },
          ]);
        } else {
          throw new Error(
            'tries to insert emoji at a text node with null content',
          );
        }
      }
    } else {
      setTree((tree) => (tree ? [emojiNode, ...tree] : [emojiNode]));
    }

    history.pushAndCommit([
      {
        command: COMMAND_INSERT_EMOJI,
        nodeIndex: emojiNode.getIndex(),
        prevState: null,
      },
    ]);
    setSelection({
      nodeIndex: emojiNode.getIndex(),
      offset: 0,
    });

    inputRef.current?.focus();
  };

  const createTextNodeAndUpdateEditorSelection = (text: string) => {
    const textNode = new TextNode(assignNodeIndex());
    textNode.setChild(text);

    setSelection({
      nodeIndex: textNode.getIndex(),
      offset: textNode.getChildren()?.length ?? 0,
    });

    history.pushAndCommit([
      {
        command: COMMAND_INSERT_TEXT,
        nodeIndex: textNode.getIndex(),
        prevState: null,
      },
    ]);
    return textNode;
  };

  const assignNodeIndex = () => {
    ++nodeIndexRef.current;
    return nodeIndexRef.current;
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
