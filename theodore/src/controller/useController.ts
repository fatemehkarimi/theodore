import {
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import {
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  END,
  ENTER,
  HOME,
} from '../keys';
import EmojiNode from '../nodes/emojiNode/EmojiNode';
import { Node as EditorNode } from '../nodes/Node';
import ParagraphNode from '../nodes/paragraphNode/ParagraphNode';
import TextNode from '../nodes/textNode/TextNode';
import {
  getNodeBeforeSelection,
  moveCursor,
  moveToNodeBySelection,
  setCaretAfter,
  setCaretPosition,
  setCaretToBegining,
} from '../selection/selection';
import { isOnlyNavigationKey } from '../keys';
import type { onSelectionChangeFn, RenderEmoji, TextNodeDesc } from '../types';
import {
  COMMAND_INSERT_EMOJI,
  COMMAND_INSERT_PARAGRAPH,
  COMMAND_INSERT_TEXT,
  COMMAND_REPLACE_PARAGRAPH,
  COMMAND_REPLACE_TEXT,
} from './commands';
import { useHistory } from './useHistory';
import { useSelection } from './useSelection';
import { getNextNode } from './utils';
import { convertDomSelectionToEditorSelection } from '../selection/selection';

const useController = (
  inputRef: MutableRefObject<HTMLDivElement | null>,
  renderEmoji: RenderEmoji,
  listeners?: {
    onSelectionChange?: onSelectionChangeFn;
  },
) => {
  const { getSelection, setSelection } = useSelection(
    { nodeIndex: 1, offset: 0 },
    listeners?.onSelectionChange,
  );
  const history = useHistory(getSelection);
  const nodeIndexRef = useRef<number>(1); // starts at 1 because 1 is a paragraph node that is always in dom
  const [tree, setTree] = useState<EditorNode[][]>([[new ParagraphNode(1)]]);

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    event.preventDefault();
    const key = event.key;

    if (event.ctrlKey && key == 'z') {
      if (tree == null) return;
      let transactionId = undefined;
      do {
        const prevState = history.pop();
        if (prevState == null) return;
        if (transactionId == undefined) transactionId = prevState.transactionId;
        setTree((tree) => {
          if (tree.length <= 1 && tree[0]?.[0]?.getIndex() == 0) return tree;
          const newTree = tree
            .map((subTree) => {
              const pNode = subTree[0];
              if (
                pNode.getIndex() == prevState.nodeIndex &&
                prevState.command == COMMAND_REPLACE_PARAGRAPH
              ) {
                if (prevState.prevState != null) {
                  const prevNodes = prevState.prevState as EditorNode[];
                  return prevNodes;
                }
              } else if (
                pNode.getIndex() == prevState.nodeIndex &&
                prevState.command == COMMAND_INSERT_PARAGRAPH
              )
                return [];

              return subTree
                .map((node) => {
                  if (node.getIndex() == prevState.nodeIndex) {
                    if (prevState.command == COMMAND_INSERT_TEXT) {
                      if (prevState.prevState != null) {
                        // todo: fix when command is insert the node type can't be an object
                        (node as TextNode).setChild(
                          prevState.prevState as string,
                        );
                        return node;
                      } else return null;
                    } else if (prevState.command == COMMAND_REPLACE_TEXT) {
                      if (prevState.prevState != null) {
                        const node = TextNode.fromDescriptor(
                          prevState.prevState as TextNodeDesc,
                        );
                        return node;
                      } else return null;
                    } else return null;
                  } else return node;
                })
                .filter((node) => node != null);
            })
            .filter((subTree) => subTree.length > 0);
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
      // if (tree == null) return;
      // setSelection(null);
      // requestAnimationFrame(() => {
      //   inputRef.current != null && setCaretToBegining(inputRef.current);
      // });
    } else if (key == END) {
      if (inputRef.current != null && tree != null) {
        // setCaretToEnd(inputRef.current);
        // const last = tree ? tree[tree.length - 1] : null;
        // const selection: Selection =
        //   last == null
        //     ? null
        //     : {
        //         nodeIndex: last.getIndex(),
        //         offset: last.getType() == 'text' ? last.getChildLength() : 0,
        //       };
        // setSelection(selection);
      }
    } else if (key == ENTER) insertNewParagraph();
    else if (key == ARROW_LEFT || key == ARROW_RIGHT)
      handleNavigateLeftOrRight(key);
    else if (key == ARROW_UP || key == ARROW_DOWN) handleNavigateUpOrDown(key);
    else {
      const text = key;
      const node = getEditorSelectedNode();
      if (node == null || node.getType() != 'text') {
        const textNode = new TextNode(assignNodeIndex());
        textNode.setChild(text);
        const selection = getSelection();
        const [subtreeIdx, nodeIdxInTree] = getEditorSelectedNodeIndexInTree();

        setTree((tree) => {
          const newTree = [...tree];
          if (subtreeIdx == -1 || selection == null) {
            const newSubTree = [
              newTree[0][0],
              textNode,
              ...newTree[0].slice(1),
            ];
            newTree[0] = newSubTree;
            return newTree;
          }

          const subtree = newTree[subtreeIdx];
          const newsubTree = [
            ...subtree.slice(0, nodeIdxInTree + 1),
            textNode,
            ...subtree.slice(nodeIdxInTree + 1),
          ];
          newTree[subtreeIdx] = newsubTree;
          return newTree;
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
        const subTreeIdx = getSelectedParagraphIndexInTree();

        setTree((tree) => {
          const newTree = [...tree];
          newTree[subTreeIdx] = [...tree[subTreeIdx]];
          return newTree;
        });

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

      requestAnimationFrame(
        () =>
          inputRef.current != null &&
          getSelection() != null &&
          moveToNodeBySelection(getSelection()),
      );
    }
  };

  const handleNavigateUpOrDown = (
    key: typeof ARROW_UP | typeof ARROW_DOWN,
  ) => {};

  const handleNavigateLeftOrRight = (
    key: typeof ARROW_LEFT | typeof ARROW_RIGHT,
  ) => {
    moveCursor(key == ARROW_LEFT ? 'backward' : 'forward', 'character');
    const docSelection = document.getSelection();
    if (docSelection == null) return;

    const range = docSelection.getRangeAt(0);
    const newSelection = convertDomSelectionToEditorSelection(range);
    setSelection(newSelection);
  };

  const handleInputSelectionChange = () => {
    const selection = document.getSelection();
    if (selection == null) return;

    const range = selection.getRangeAt(0);
    if (!inputRef.current?.contains(range.commonAncestorContainer)) {
      return;
    }

    const editorSelection = convertDomSelectionToEditorSelection(range);
    if (editorSelection == null) return;
    const { nodeIndex, offset } = editorSelection;

    const currentSelection = getSelection();
    if (currentSelection == null) {
      setSelection({
        nodeIndex,
        offset: offset,
      });
    } else if (
      nodeIndex != currentSelection.nodeIndex ||
      offset != currentSelection.offset
    ) {
      setSelection({
        nodeIndex,
        offset: offset,
      });
    }
  };

  const insertNewParagraph = () => {
    const paragraphNode = new ParagraphNode(assignNodeIndex());
    const selection = getSelection();

    if (selection == null) return; //todo: fix, selection cannot be null

    const selectedNode = getEditorSelectedNode();
    const [pIdx, nodeIdx] = getEditorSelectedNodeIndexInTree();

    const selectedParagraphClone = [...tree[pIdx]];
    const selectedParagraphNode = selectedParagraphClone[0];
    const lastNodeOfSelectedP =
      selectedParagraphClone[selectedParagraphClone.length - 1];

    let nextSelectionNodeIdx = paragraphNode.getIndex();

    if (selectedNode?.isTextNode()) {
      const text = (selectedNode as TextNode).getChildren();

      const isInsertedAtBegining = selection.offset == 0;
      const isInsertedAtEnd =
        selection.nodeIndex == lastNodeOfSelectedP.getIndex()
          ? lastNodeOfSelectedP.getType() == 'text'
            ? selection.offset == lastNodeOfSelectedP.getChildLength()
            : true
          : false;

      if (isInsertedAtBegining || isInsertedAtEnd) {
        const slicePostion = isInsertedAtBegining ? nodeIdx : nodeIdx + 1;
        const pSubTree = tree[pIdx].slice(0, slicePostion);
        const newPSubTree = [paragraphNode, ...tree[pIdx].slice(slicePostion)];

        setTree(() => {
          return [
            ...tree.slice(0, pIdx),
            pSubTree,
            newPSubTree,
            ...tree.slice(pIdx + 1),
          ];
        });

        if (isInsertedAtBegining) {
          if (newPSubTree[1] != null && newPSubTree[1].getType() == 'text')
            nextSelectionNodeIdx = newPSubTree[1].getIndex();

          history.push([
            {
              command: COMMAND_REPLACE_PARAGRAPH,
              nodeIndex: selectedParagraphNode.getIndex(),
              prevState: selectedParagraphClone,
            },
          ]);
        }
      } else {
        if (text != null) {
          const pSubTree = tree[pIdx].slice(0, nodeIdx);
          const newPSubTree = [paragraphNode];

          const beforeText = text.slice(0, selection.offset);
          const afterText = text.slice(selection.offset);

          if (beforeText.length > 0) {
            const textNode = new TextNode(assignNodeIndex());
            textNode.setChild(beforeText);
            pSubTree.push(textNode);
          }

          if (afterText.length > 0) {
            const textNode = new TextNode(assignNodeIndex());
            textNode.setChild(afterText);
            newPSubTree.push(textNode);
          }
          newPSubTree.push(...tree[pIdx].slice(nodeIdx + 1));

          if (newPSubTree[1] != null && newPSubTree[1].getType() == 'text')
            nextSelectionNodeIdx = newPSubTree[1].getIndex();

          setTree(() => {
            return [
              ...tree.slice(0, pIdx),
              pSubTree,
              newPSubTree,
              ...tree.slice(pIdx + 1),
            ];
          });

          history.push([
            {
              command: COMMAND_REPLACE_PARAGRAPH,
              nodeIndex: selectedParagraphNode.getIndex(),
              prevState: selectedParagraphClone,
            },
          ]);
        } else {
          throw new Error(
            'tries to insert paragraph at a text node with null content',
          );
        }
      }
    } else {
      const pSubTree = tree[pIdx].slice(0, nodeIdx + 1);
      const newPSubTree = [paragraphNode, ...tree[pIdx].slice(nodeIdx + 1)];

      setTree(() => {
        return [
          ...tree.slice(0, pIdx),
          pSubTree,
          newPSubTree,
          ...tree.slice(pIdx + 1),
        ];
      });

      history.push([
        {
          command: COMMAND_REPLACE_PARAGRAPH,
          nodeIndex: selectedParagraphNode.getIndex(),
          prevState: selectedParagraphClone,
        },
      ]);
    }

    history.pushAndCommit([
      {
        command: COMMAND_INSERT_PARAGRAPH,
        nodeIndex: paragraphNode.getIndex(),
        prevState: null,
      },
    ]);

    setSelection({
      nodeIndex: nextSelectionNodeIdx,
      offset: 0,
    });
  };

  const insertNodeInSelection = (node: EditorNode) => {
    const selectedNode = getEditorSelectedNode();
    const selectedNodeOffset = getSelection()?.offset ?? 0;

    if (selectedNode != null) {
      const [subtreeIdx, nodeIdxInTree] = getEditorSelectedNodeIndexInTree();
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
        setTree((tree) => {
          const newTree = [...tree];
          const subTree = newTree[subtreeIdx];
          const newSubTree = [
            ...subTree.slice(0, nodeIdxInTree + offset),
            node,
            ...subTree.slice(nodeIdxInTree + offset),
          ];
          newTree[subtreeIdx] = newSubTree;
          return newTree;
        });
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

          setTree((tree) => {
            const newTree = [...tree];
            const subTree = newTree[subtreeIdx];
            const newSubTree = [
              ...subTree.slice(0, nodeIdxInTree),
              before,
              node,
              after,
              ...subTree.slice(nodeIdxInTree + 1),
            ];
            newTree[subtreeIdx] = newSubTree;
            return newTree;
          });

          history.push([
            {
              command: COMMAND_INSERT_TEXT,
              nodeIndex: after.getIndex(),
              prevState: null,
            },
            {
              command: COMMAND_REPLACE_TEXT,
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
      // todo: remove: null selection is not meaningful anymore
      setTree((tree) => {
        const newTree = [...tree];
        newTree[0] = [newTree[0][0], node, ...newTree[0].slice(1)];
        return newTree;
      });
    }

    history.pushAndCommit([
      {
        command: COMMAND_INSERT_EMOJI,
        nodeIndex: node.getIndex(),
        prevState: null,
      },
    ]);
    setSelection({
      nodeIndex: node.getIndex(),
      offset: 0,
    });

    inputRef.current?.focus();
  };

  const insertEmoji = (emoji: string) => {
    const emojiNode = new EmojiNode(assignNodeIndex(), emoji, renderEmoji);
    insertNodeInSelection(emojiNode);
  };

  const assignNodeIndex = () => {
    ++nodeIndexRef.current;
    return nodeIndexRef.current;
  };

  const getEditorSelectedNode = () => {
    const nodeIndex = getSelection()?.nodeIndex;
    return getNodeInTreeByIndex(nodeIndex);
  };

  const getNodeInTreeByIndex = (nodeIndex: number | undefined) => {
    if (nodeIndex == undefined) return null;
    return tree.flat().find((node) => node.getIndex() == nodeIndex) ?? null;
  };

  const getEditorSelectedNodeIndexInTree = () => {
    const subtreeIdx = tree.findIndex((subtree) =>
      subtree.find((t) => t.getIndex() == getSelection()?.nodeIndex),
    );

    if (subtreeIdx == -1) return [-1, -1];
    const nodeIdx = tree[subtreeIdx].findIndex(
      (node) => node.getIndex() == getSelection()?.nodeIndex,
    );

    return [subtreeIdx, nodeIdx];
  };

  const getSelectedParagraphIndexInTree = () => {
    const selection = getSelection();
    if (selection == null) return 0;
    const [subTreeIdx] = getEditorSelectedNodeIndexInTree();
    return subTreeIdx;
  };

  useLayoutEffect(() => {
    let selection = getSelection();
    const selectedNode = getEditorSelectedNode();
    const nextSelectedNode =
      selectedNode != null ? getNextNode(tree, selectedNode) : null;
    if (
      selectedNode?.getType() == 'emoji' &&
      nextSelectedNode?.getType() == 'text'
    ) {
      setSelection({
        nodeIndex: nextSelectedNode.getIndex(),
        offset: 0,
      });
    }

    selection = getSelection();
    if (selection != null) {
      const nodeIndex = selection.nodeIndex;
      const node = getEditorSelectedNode();
      let nodeElement = document.querySelectorAll(
        `[data-node-index="${nodeIndex}"]`,
      )?.[0] as Element | null;
      if (nodeElement == null) return;

      if (node?.isTextNode()) setCaretPosition(nodeElement, selection.offset);
      else setCaretAfter(nodeElement);
    }
  }, [tree]);

  return {
    tree,
    insertEmoji,
    insertNewParagraph,
    handlers: {
      handleKeyDown,
      handleSelectionChange: handleInputSelectionChange,
    },
  };
};

export { useController };
