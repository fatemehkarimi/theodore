import { useLayoutEffect, type MutableRefObject } from 'react';
import {
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  BACKSPACE,
  DELETE,
  END,
  ENTER,
  HOME,
} from '../keys';
import EmojiNode from '../nodes/emojiNode/EmojiNode';
import { Node as EditorNode } from '../nodes/Node';
import ParagraphNode from '../nodes/paragraphNode/ParagraphNode';
import { TextNode } from '../nodes/textNode/TextNode';
import {
  convertDomSelectionToEditorSelection,
  moveToNodeBySelection,
  selectRangeInDom,
  setCaretAfter,
  setCaretPosition,
} from '../selection/selection';
import type { EditorState, RenderEmoji, TextNodeDesc, Tree } from '../types';
import { isDevelopment } from '../utils';
import {
  COMMAND_INSERT_EMOJI,
  COMMAND_INSERT_PARAGRAPH,
  COMMAND_INSERT_PARAGRAPH_AFTER,
  COMMAND_INSERT_TEXT,
  COMMAND_REMOVE_NODE,
  COMMAND_REPLACE_PARAGRAPH,
  COMMAND_REPLACE_TEXT,
} from './commands';
import {
  areNodeSelectionEqual,
  isEditorSelectionCollapsed,
} from './selection/useSelection';
import {
  ALWAYS_IN_DOM_NODE_INDEX,
  ALWAYS_IN_DOM_NODE_SELECTION,
  findNode,
  findNodeAfter,
  findNodeBefore,
  getDomNodeByNodeIndex,
  getNextNode,
  getNodeIndexInTree,
  getParagraphIndexInTree,
  getSelectionAfterNodeRemove,
  removeNodeFromTree,
} from './utils';

const useController = (
  inputRef: MutableRefObject<HTMLDivElement | null>,
  renderEmoji: RenderEmoji,
  editorState: EditorState,
) => {
  const { selectionHandle, historyHandle, assignNodeIndex, tree, setTree } =
    editorState;
  const { getSelection, setSelection } = selectionHandle;
  const { history } = historyHandle;

  const handleKeyDown: React.KeyboardEventHandler = (event) => {
    const key = event.key;
    let delegateHandleToBrowser = false;
    console.log('handleKeyDown', key);

    if (event.ctrlKey && key == 'z') {
      if (tree == null) return;
      let transactionId = undefined;
      do {
        const prevState = history.pop();
        if (prevState == null) return;
        if (transactionId == undefined) transactionId = prevState.transactionId;
        setTree((tree) => {
          if (tree.length <= 1 && tree[0]?.[0]?.getIndex() == 0) return tree;

          if (prevState.command == COMMAND_REMOVE_NODE) {
            const prevNode = prevState.prevNodeIndexInTree;
            const nextNode = prevState.nextNodeIndexInTree;

            const [prevNodePIdx, prevNodeIdx] = getNodeIndexInTree(
              tree,
              prevNode,
            );
            const [nextNodePIdx, nextNodeIdx] = getNodeIndexInTree(
              tree,
              nextNode,
            );

            if (prevNodeIdx == -1) return tree;
            const newTree = tree.slice(0, prevNodePIdx);

            const newStartP = tree[prevNodePIdx].slice(0, prevNodeIdx + 1);
            let newStartPAppended = false;

            const deletedNodes = prevState.prevState as (
              | EditorNode
              | EditorNode[]
            )[];
            for (const node of deletedNodes) {
              if (Array.isArray(node)) {
                if (node.length == 0) continue;
                const firstNode = node[0];
                if (firstNode.getType() == 'paragraph') {
                  if (!newStartPAppended) {
                    newTree.push(newStartP);
                    newStartPAppended = true;
                  }
                  newTree.push(node);
                } else newStartP.push(...node);
              } else if (node.getType() == 'paragraph') {
                if (!newStartPAppended) {
                  newTree.push(newStartP);
                  newStartPAppended = true;
                }
                newTree.push([node]);
              } else if (!newStartPAppended) {
                newStartP.push(node);
              } else newTree[newTree.length - 1].push(node);
            }

            if (!newStartPAppended) newTree.push(newStartP);
            if (nextNodeIdx != -1) {
              const remainingNodes = tree[nextNodePIdx].slice(nextNodeIdx);
              const firstNode =
                remainingNodes.length > 0 ? remainingNodes[0] : null;
              if (firstNode != null && firstNode.getType() == 'paragraph')
                newTree.push(remainingNodes);
              else newTree[newTree.length - 1].push(...remainingNodes);
              newTree.push(...tree.slice(nextNodePIdx + 1));
            }
            return newTree;
          }

          if (prevState.command == COMMAND_INSERT_PARAGRAPH_AFTER) {
            if (prevState.prevState == null) return tree;
            if (prevState.prevNodeIndexInTree == undefined)
              return [prevState.prevState as EditorNode[], ...tree];
            const basePIdx = getParagraphIndexInTree(
              tree,
              prevState.prevNodeIndexInTree,
            );

            const newTree = tree.slice(0, basePIdx + 1);
            newTree.push(prevState.prevState as EditorNode[]);
            newTree.push(...tree.slice(basePIdx + 1));

            return newTree;
          }

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
                      if (prevState.prevState != null && node.isTextNode()) {
                        (node as TextNode).setChild(
                          prevState.prevState as string,
                        );
                        return node;
                      } else return null;
                    } else if (prevState.command == COMMAND_REPLACE_TEXT) {
                      if (prevState.prevState != null) {
                        const newNode = TextNode.fromDescriptor(
                          prevState.prevState as TextNodeDesc,
                        );
                        // we keep the original node because it may be in the
                        // history of other commands
                        const newText = newNode.getChildren();
                        if (newText != null)
                          (node as TextNode).setChild(newText);
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
        if (prevState.selection != null)
          setSelection(
            prevState.selection?.startSelection,
            prevState.selection?.endSelection,
          );
      } while (transactionId == history.top()?.transactionId);
      return;
    }

    // todo: handle
    if (event.ctrlKey || event.altKey || event.shiftKey) return;
    if (
      [ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, HOME, END].includes(key)
    ) {
      delegateHandleToBrowser = true;
    } else if (key == ENTER) insertNewParagraph();
    else if (key == BACKSPACE || key == DELETE) {
      handleDelete(key);
    } else handleInsertText(key);

    if (!delegateHandleToBrowser) event.preventDefault();
  };

  const handleOnBeforeInput: React.FormEventHandler<HTMLDivElement> = (
    event,
  ) => {
    event.preventDefault();
    const native = event.nativeEvent as unknown as InputEvent;
    const data = (native as any)?.data as string | null | undefined;

    if (data) handleInsertText(data);
  };

  const handleInsertText = (text: string) => {
    const newTree = removeNodesInSelection();
    const node = findNode(newTree, getSelection()?.startSelection.nodeIndex);
    if (node == null || node.getType() != 'text') {
      const textNode = new TextNode(assignNodeIndex());
      textNode.setChild(text);
      const selection = getSelection();

      setTree(() => {
        const [subtreeIdx, nodeIdxInTree] = getNodeIndexInTree(
          newTree,
          node?.getIndex(),
        );
        const finalTree = [...newTree];
        if (subtreeIdx == -1 || selection == null) {
          const newSubTree = [
            finalTree[0][0],
            textNode,
            ...finalTree[0].slice(1),
          ];
          finalTree[0] = newSubTree;
          return finalTree;
        }

        const subtree = finalTree[subtreeIdx];
        const newsubTree = [
          ...subtree.slice(0, nodeIdxInTree + 1),
          textNode,
          ...subtree.slice(nodeIdxInTree + 1),
        ];
        finalTree[subtreeIdx] = newsubTree;
        return finalTree;
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
      // selection should be always collapsed when it wants to insert the new node
      const selectedNode = getSelection()?.startSelection.nodeIndex;
      if (selectedNode == null) {
        if (isDevelopment)
          throw new Error('selectedNode cannot be null when inserting text');
        else return;
      }
      const offset = getSelection()?.startSelection.offset ?? 0;
      textNode.insertText(text, offset);
      const subTreeIdx = getParagraphIndexInTree(newTree, selectedNode);

      setTree(() => {
        const finalTree = [...newTree];
        finalTree[subTreeIdx] = [...newTree[subTreeIdx]];
        return finalTree;
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

    requestAnimationFrame(() => {
      if (inputRef.current != null) {
        const selection = getSelection();
        if (selection != null) moveToNodeBySelection(selection.startSelection);
      }
    });
  };

  const handleDelete = (key: typeof BACKSPACE | typeof DELETE) => {
    const selection = getSelection();
    if (selection == null) return;
    let newTree = removeNodesInSelection(true);

    const isCollapsed = isEditorSelectionCollapsed(selection);
    if (!isCollapsed) {
      setTree(newTree);
      history.commit();
      return;
    }

    const selectedNodes = getEditorSelectedNode();
    if (selectedNodes == null) return;
    const { startNode } = selectedNodes;
    if (startNode == null) return;
    const isBackward = key == BACKSPACE;

    // handling backspace
    if (startNode.isTextNode()) {
      const startTextNode = startNode as TextNode;

      // if selection is at the begining or end of text node
      if (
        (isBackward && selection.startSelection.offset == 0) ||
        (!isBackward &&
          startTextNode.getChildLength() == selection.startSelection.offset)
      ) {
        removeCharOrNode(newTree, isBackward, startNode);
        history.commit();
        return;
      }
      const text = startTextNode.getChildren() ?? '';
      const remainingText = isBackward
        ? text.slice(0, selection.startSelection.offset - 1) +
          text.slice(selection.startSelection.offset)
        : text.slice(0, selection.startSelection.offset) +
          text.slice(selection.startSelection.offset + 1);

      if (remainingText.length > 0) {
        history.pushAndCommit([
          {
            command: COMMAND_REPLACE_TEXT,
            nodeIndex: startTextNode.getIndex(),
            prevState: startTextNode.toDescriptor(),
          },
        ]);

        startTextNode.setChild(remainingText);
        setTree(makeTreeNonEmpty(newTree));
        setSelection({
          nodeIndex: startTextNode.getIndex(),
          offset: isBackward
            ? selection.startSelection.offset - 1
            : selection.startSelection.offset,
        });
      } else {
        const nodeBefore = findNodeBefore(newTree, startTextNode.getIndex());
        const nodeAfter = findNodeAfter(newTree, startTextNode.getIndex());
        newTree = removeNodeFromTree(newTree, startTextNode.getIndex());
        setTree(makeTreeNonEmpty(newTree));
        history.pushAndCommit([
          {
            command: COMMAND_REMOVE_NODE,
            nodeIndex: -1,
            prevState: [startTextNode],
            prevNodeIndexInTree: nodeBefore?.getIndex(),
            nextNodeIndexInTree: nodeAfter?.getIndex(),
          },
        ]);

        setSelection(
          getSelectionAfterNodeRemove(tree, startTextNode.getIndex()),
        );
      }
    } else if (startNode.getType() == 'emoji') {
      const nodeBefore = findNodeBefore(newTree, startNode.getIndex());
      const nodeAfter = findNodeAfter(newTree, startNode.getIndex());
      if (isBackward) {
        newTree = removeNodeFromTree(newTree, startNode.getIndex());
        setTree(makeTreeNonEmpty(newTree));
        history.pushAndCommit([
          {
            command: COMMAND_REMOVE_NODE,
            nodeIndex: -1,
            prevState: [startNode],
            prevNodeIndexInTree: nodeBefore?.getIndex(),
            nextNodeIndexInTree: nodeAfter?.getIndex(),
          },
        ]);

        setSelection(getSelectionAfterNodeRemove(tree, startNode.getIndex()));
      } else {
        removeCharOrNode(newTree, false, startNode);
        history.commit();
      }
    } else if (startNode.getType() == 'paragraph') {
      if (isBackward) {
        newTree = concatParagraph(newTree, startNode.getIndex(), isBackward);
        setTree(makeTreeNonEmpty(newTree));
        history.commit();
      } else {
        removeCharOrNode(newTree, isBackward, startNode);
        history.commit();
      }
    }
  };

  const removeCharOrNode = (
    _newTree: Tree,
    isBackward: boolean,
    startNode: EditorNode,
  ) => {
    let newTree = [..._newTree];
    const targetNode = isBackward
      ? findNodeBefore(newTree, startNode.getIndex())
      : findNodeAfter(newTree, startNode.getIndex());
    if (targetNode) {
      if (targetNode.isTextNode() && targetNode.getChildLength() > 1) {
        const textNode = targetNode as TextNode;
        const text = textNode.getChildren() ?? '';
        const remainingText = isBackward
          ? text.slice(0, text.length - 1)
          : text.slice(1);

        if (remainingText.length == 0 && isDevelopment)
          throw new Error(
            'remaining text length is empty and node should be removed from the tree',
          );
        history.push([
          {
            command: COMMAND_REPLACE_TEXT,
            nodeIndex: textNode.getIndex(),
            prevState: textNode.toDescriptor(),
          },
        ]);
        setTree(makeTreeNonEmpty(newTree));
        textNode.setChild(remainingText);

        if (isBackward)
          setSelection({
            nodeIndex: textNode.getIndex(),
            offset: remainingText.length,
          });
      } else if (targetNode.getType() == 'paragraph') {
        const [pIdx] = getNodeIndexInTree(newTree, startNode.getIndex());
        const paragraphNode = newTree[pIdx][0];
        newTree = concatParagraph(
          newTree,
          paragraphNode.getIndex(),
          isBackward,
        );
        history.commit();
        setTree(makeTreeNonEmpty(newTree));
      } else {
        const beforeTargetNode = findNodeBefore(newTree, targetNode.getIndex());
        const afterTargetNode = findNodeAfter(newTree, targetNode.getIndex());
        newTree = removeNodeFromTree(newTree, targetNode.getIndex());
        setTree(makeTreeNonEmpty(newTree));
        history.push([
          {
            command: COMMAND_REMOVE_NODE,
            nodeIndex: -1,
            prevState: [targetNode],
            prevNodeIndexInTree: beforeTargetNode?.getIndex(),
            nextNodeIndexInTree: afterTargetNode?.getIndex(),
          },
        ]);
      }
    }
  };

  const concatParagraph = (
    tree: Tree,
    pNodeIdx: number,
    isBackward: boolean,
  ) => {
    const [idx] = getNodeIndexInTree(tree, pNodeIdx);
    if (idx == 0 && isBackward) return [...tree];
    if (idx == tree.length - 1 && !isBackward) return [...tree];

    const selectedNode = isBackward
      ? findNodeBefore(tree, pNodeIdx)
      : findNodeAfter(tree, pNodeIdx);

    const offset = isBackward ? -1 : 0;
    const newTree = tree.slice(0, idx + offset);
    const secondParagraphClone = [...tree[idx + offset + 1]];
    const secondParagraphNodes = tree[idx + offset + 1].slice(1);
    const firstParagaphClone = [...tree[idx + offset]];
    const newParagraph = tree[idx + offset].concat(secondParagraphNodes);
    newTree.push(newParagraph);
    newTree.push(...tree.slice(idx + offset + 2));

    const nodeBefore = findNodeBefore(tree, secondParagraphClone[0].getIndex());
    const pBeforeIdx = nodeBefore
      ? getParagraphIndexInTree(tree, nodeBefore?.getIndex())
      : undefined;
    const pBeforeNode = pBeforeIdx != undefined ? tree[pBeforeIdx][0] : null;

    history.push([
      {
        command: COMMAND_INSERT_PARAGRAPH_AFTER,
        nodeIndex: -1,
        prevState: secondParagraphClone,
        prevNodeIndexInTree: pBeforeNode ? pBeforeNode.getIndex() : undefined,
      },
    ]);

    history.push([
      {
        command: COMMAND_REPLACE_PARAGRAPH,
        nodeIndex: firstParagaphClone[0].getIndex(),
        prevState: firstParagaphClone,
      },
    ]);

    if (isBackward && selectedNode) {
      setSelection({
        nodeIndex: selectedNode.getIndex(),
        offset: selectedNode.isTextNode() ? selectedNode.getChildLength() : 0,
      });
    }
    return newTree;
  };

  const removeNodesInSelection = (shouldRemoveEmptyTextNodes?: boolean) => {
    const selection = getSelection();
    const selectedNodes = getEditorSelectedNode();
    const isSelectionCollapsed = isEditorSelectionCollapsed(selection);
    const newTree: EditorNode[][] = isSelectionCollapsed ? [...tree] : [];

    if (isSelectionCollapsed) return newTree;
    if (selection == null || selectedNodes == null) return newTree;

    const { startNode, endNode } = selectedNodes;
    const { startSelection, endSelection } = selection;

    const [startPIdx, startIdx] = getNodeIndexInTree(
      tree,
      startNode?.getIndex(),
    );
    const [endPIdx, endIdx] = getNodeIndexInTree(tree, endNode?.getIndex());

    if (startPIdx == endPIdx) {
      if (startIdx == endIdx) {
        if (startNode?.isTextNode()) {
          const textNode = startNode as TextNode;
          const text = textNode.getChildren() ?? '';
          const remainingText =
            text.slice(0, startSelection.offset) +
            text.slice(endSelection.offset);

          const textNodeDescriptor = textNode.toDescriptor();
          if (shouldRemoveEmptyTextNodes && remainingText.length == 0) {
            newTree.push(...removeNodeFromTree(tree, textNode.getIndex()));
            history.push([
              {
                command: COMMAND_REMOVE_NODE,
                nodeIndex: textNode.getIndex(),
                prevState: [textNode],
                prevNodeIndexInTree: findNodeBefore(
                  tree,
                  textNode.getIndex(),
                )?.getIndex(),
                nextNodeIndexInTree: findNodeAfter(
                  tree,
                  textNode.getIndex(),
                )?.getIndex(),
              },
            ]);
            setSelection(
              getSelectionAfterNodeRemove(tree, textNode.getIndex()),
            );
          } else {
            textNode.setChild(remainingText);
            newTree.push(...tree);

            history.push([
              {
                command: COMMAND_REPLACE_TEXT,
                nodeIndex: textNode.getIndex(),
                prevState: textNodeDescriptor,
              },
            ]);
            setSelection({
              nodeIndex: textNode.getIndex(),
              offset: startSelection.offset,
            });
          }
        } else {
          if (isDevelopment)
            throw new Error(
              'impossible case and start end indices are equal only when selected node is text node or selection is collapsed.',
            );
        }

        return makeTreeNonEmpty(newTree);
      }

      newTree.push(...tree.slice(0, startPIdx));
      const newStartP = [...tree[startPIdx].slice(0, startIdx)];
      const deletedNodes = [];

      if (startNode) {
        if (!startNode.isTextNode()) newStartP.push(startNode);
        else {
          const textNode = startNode as TextNode;
          const currentText = textNode.getChildren() ?? '';
          const remainingText = currentText.slice(
            0,
            selection.startSelection.offset,
          );
          if (shouldRemoveEmptyTextNodes && remainingText.length == 0)
            deletedNodes.push(textNode);
          else {
            if (currentText != remainingText) {
              const textNodeDescriptor = textNode.toDescriptor();
              history.push([
                {
                  command: COMMAND_REPLACE_TEXT,
                  nodeIndex: textNode.getIndex(),
                  prevState: textNodeDescriptor,
                },
              ]);
              textNode.setChild(remainingText);
            }
            newStartP.push(textNode);
          }
        }
      }

      for (let i = startIdx + 1; i < endIdx; i++) {
        deletedNodes.push(tree[startPIdx][i]);
      }

      if (endNode?.getType() == 'emoji') deletedNodes.push(endNode);

      if (endNode && endNode.isTextNode()) {
        const textNode = endNode as TextNode;
        const currentText = textNode.getChildren() ?? '';
        const textNodeDescriptor = textNode.toDescriptor();
        const remainingText = currentText.slice(selection.endSelection.offset);
        if (shouldRemoveEmptyTextNodes && remainingText.length == 0) {
          deletedNodes.push(textNode);
        } else {
          if (currentText != remainingText) {
            history.push([
              {
                command: COMMAND_REPLACE_TEXT,
                nodeIndex: textNode.getIndex(),
                prevState: textNodeDescriptor,
              },
            ]);

            textNode.setChild(remainingText);
            newStartP.push(textNode);
          }
        }
      }

      if (deletedNodes.length > 0)
        history.push([
          {
            command: COMMAND_REMOVE_NODE,
            nodeIndex: -1,
            prevState: deletedNodes,
            prevNodeIndexInTree: findNodeBefore(
              tree,
              deletedNodes[0].getIndex(),
            )?.getIndex(),
            nextNodeIndexInTree: findNodeAfter(
              tree,
              deletedNodes[deletedNodes.length - 1].getIndex(),
            )?.getIndex(),
          },
        ]);

      newStartP.push(...tree[startPIdx].slice(endIdx + 1));
      newTree.push(newStartP);
      newTree.push(...tree.slice(endPIdx + 1));
      if (startNode) {
        const isStartNodeRemoved =
          deletedNodes.find((n) => n.getIndex() == startNode?.getIndex()) !=
          undefined;

        if (!isStartNodeRemoved)
          setSelection({
            nodeIndex: startNode.getIndex(),
            offset: startSelection.offset,
          });
        else {
          setSelection(getSelectionAfterNodeRemove(tree, startNode.getIndex()));
        }
      } else setSelection(ALWAYS_IN_DOM_NODE_SELECTION);
      return makeTreeNonEmpty(newTree);
    }

    newTree.push(...tree.slice(0, startPIdx));
    const newStartP = [...tree[startPIdx].slice(0, startIdx)];
    const deletedNodes: (EditorNode | EditorNode[])[] = [];

    if (startNode?.isTextNode()) {
      const textNode = startNode as TextNode;
      const currentText = textNode.getChildren() ?? '';
      const remainingText = currentText.slice(
        0,
        selection.startSelection.offset,
      );

      if (shouldRemoveEmptyTextNodes && remainingText.length == 0) {
        deletedNodes.push(textNode);
      } else {
        if (currentText != remainingText) {
          const textNodeDescriptor = textNode.toDescriptor();
          history.push([
            {
              command: COMMAND_REPLACE_TEXT,
              nodeIndex: textNode.getIndex(),
              prevState: textNodeDescriptor,
            },
          ]);
          textNode.setChild(remainingText);
        }
        newStartP.push(textNode);
      }
    } else if (startNode != null) newStartP.push(startNode);

    const startPToBeRemovedNodes = tree[startPIdx].slice(startIdx + 1);
    if (startPToBeRemovedNodes.length > 0)
      deletedNodes.push(startPToBeRemovedNodes);
    for (let i = startPIdx + 1; i < endPIdx; ++i) deletedNodes.push(tree[i]);
    const endPToBeRemovedNodes = tree[endPIdx].slice(0, endIdx);
    if (endPToBeRemovedNodes.length > 0)
      deletedNodes.push(endPToBeRemovedNodes);

    const newEndP = [];

    if (endNode && endNode.isTextNode()) {
      const textNode = endNode as TextNode;
      const currentText = textNode.getChildren() ?? '';
      const textNodeDescriptor = textNode.toDescriptor();
      const remainingText = currentText.slice(selection.endSelection.offset);
      if (shouldRemoveEmptyTextNodes && remainingText.length == 0) {
        deletedNodes.push(textNode);
      } else {
        if (currentText != remainingText) {
          history.push([
            {
              command: COMMAND_REPLACE_TEXT,
              nodeIndex: textNode.getIndex(),
              prevState: textNodeDescriptor,
            },
          ]);

          textNode.setChild(remainingText);
          newEndP.push(textNode);
        }
      }
    }

    newEndP.push(...tree[endPIdx].slice(endIdx + 1));

    if (endNode && !endNode?.isTextNode()) deletedNodes.push(endNode);

    const firstDeletedNode = Array.isArray(deletedNodes[0])
      ? deletedNodes[0][0]
      : deletedNodes[0];
    const lastIdx = deletedNodes.length - 1;
    const lastDeletedNode = Array.isArray(deletedNodes[lastIdx])
      ? deletedNodes[lastIdx][0]
      : deletedNodes[lastIdx];

    history.push([
      {
        command: COMMAND_REMOVE_NODE,
        prevState: deletedNodes,
        nodeIndex: -1,
        prevNodeIndexInTree: findNodeBefore(
          tree,
          firstDeletedNode.getIndex(),
        )?.getIndex(),
        nextNodeIndexInTree: findNodeAfter(
          tree,
          lastDeletedNode.getIndex(),
        )?.getIndex(),
      },
    ]);

    newStartP.push(...newEndP);
    newTree.push(newStartP);

    newTree.push(...tree.slice(endPIdx + 1));

    if (startNode) {
      const isStartNodeRemoved =
        deletedNodes
          .flat()
          .find((n) => n.getIndex() == startNode?.getIndex()) != undefined;

      if (!isStartNodeRemoved)
        setSelection({
          nodeIndex: startNode.getIndex(),
          offset: startSelection.offset,
        });
      else
        setSelection(getSelectionAfterNodeRemove(tree, startNode.getIndex()));
    } else setSelection(ALWAYS_IN_DOM_NODE_SELECTION);
    return makeTreeNonEmpty(newTree);
  };

  const handleInputSelectionChange = () => {
    const selection = document.getSelection();
    if (selection == null) return;

    const range = selection.getRangeAt(0);
    if (!inputRef.current?.contains(range.commonAncestorContainer)) {
      return;
    }

    const startSelection = convertDomSelectionToEditorSelection(
      range.startContainer,
      range.startOffset,
    );

    const endSelection = convertDomSelectionToEditorSelection(
      range.endContainer,
      range.endOffset,
    );

    if (startSelection == null) return;

    const currentSelection = getSelection();
    if (currentSelection == null) {
      setSelection({
        ...startSelection,
        ...endSelection,
      });
    } else if (
      !areNodeSelectionEqual(currentSelection.startSelection, startSelection) ||
      !areNodeSelectionEqual(currentSelection.endSelection, endSelection)
    ) {
      setSelection(
        {
          ...startSelection,
        },
        endSelection != undefined
          ? {
              ...endSelection,
            }
          : undefined,
      );
    }
  };

  const insertNewParagraph = () => {
    const newTree = removeNodesInSelection();
    const paragraphNode = new ParagraphNode(assignNodeIndex());
    const selection = getSelection()?.startSelection; // todo:  check;

    if (selection == null) return; //todo: fix, selection cannot be null

    const selectedNodes = getEditorSelectedNode();
    const selectedNode = selectedNodes?.startNode; // todo: check;
    if (selectedNode == null) return;
    const [pIdx, nodeIdx] = getNodeIndexInTree(
      newTree,
      selectedNode.getIndex(),
    );

    const selectedParagraphClone = [...newTree[pIdx]];
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
        const pSubTree = newTree[pIdx].slice(0, slicePostion);
        const newPSubTree = [
          paragraphNode,
          ...newTree[pIdx].slice(slicePostion),
        ];
        const finalTree = [
          ...newTree.slice(0, pIdx),
          pSubTree,
          newPSubTree,
          ...newTree.slice(pIdx + 1),
        ];

        setTree(finalTree);

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
          const pSubTree = newTree[pIdx].slice(0, nodeIdx);
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
          newPSubTree.push(...newTree[pIdx].slice(nodeIdx + 1));

          if (newPSubTree[1] != null && newPSubTree[1].getType() == 'text')
            nextSelectionNodeIdx = newPSubTree[1].getIndex();

          const finalTree = [
            ...newTree.slice(0, pIdx),
            pSubTree,
            newPSubTree,
            ...newTree.slice(pIdx + 1),
          ];

          setTree(finalTree);

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
      const pSubTree = newTree[pIdx].slice(0, nodeIdx + 1);
      const newPSubTree = [paragraphNode, ...newTree[pIdx].slice(nodeIdx + 1)];
      const finalTree = [
        ...newTree.slice(0, pIdx),
        pSubTree,
        newPSubTree,
        ...newTree.slice(pIdx + 1),
      ];

      setTree(finalTree);

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
    const newTree = removeNodesInSelection();
    const selectedNodes = getEditorSelectedNode();
    const selectedNodeOffset = getSelection()?.startSelection?.offset ?? 0;

    if (selectedNodes?.startNode != null) {
      const selectedNode = selectedNodes?.startNode;

      const [subtreeIdx, nodeIdxInTree] = getNodeIndexInTree(
        newTree,
        selectedNode.getIndex(),
      );
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

        // calculating tree
        const subTree = newTree[subtreeIdx];
        const newSubTree = [
          ...subTree.slice(0, nodeIdxInTree + offset),
          node,
          ...subTree.slice(nodeIdxInTree + offset),
        ];
        newTree[subtreeIdx] = newSubTree;
        setTree(newTree);
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

          // calculating tree
          const subTree = newTree[subtreeIdx];
          const newSubTree = [
            ...subTree.slice(0, nodeIdxInTree),
            before,
            node,
            after,
            ...subTree.slice(nodeIdxInTree + 1),
          ];
          newTree[subtreeIdx] = newSubTree;
          setTree(newTree);

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
      newTree[0] = [newTree[0][0], node, ...newTree[0].slice(1)];
      setTree(newTree);
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

  const getEditorSelectedNode = () => {
    const selection = getSelection();
    if (selection == null) return null;
    const startNodeIndex = selection.startSelection.nodeIndex;
    const startNode = getNodeInTreeByIndex(startNodeIndex);
    const endNodeIndex = selection.endSelection.nodeIndex;
    const endNode = getNodeInTreeByIndex(endNodeIndex);
    return { startNode, endNode };
  };

  const getNodeInTreeByIndex = (nodeIndex: number | undefined) => {
    if (nodeIndex == undefined) return null;
    return tree.flat().find((node) => node.getIndex() == nodeIndex) ?? null;
  };

  const makeTreeNonEmpty = (tree: Tree): Tree => {
    if (tree.length == 0) {
      setSelection(ALWAYS_IN_DOM_NODE_SELECTION);
      return [[new ParagraphNode(ALWAYS_IN_DOM_NODE_INDEX)]];
    }
    return [...tree];
  };

  useLayoutEffect(() => {
    let selection = getSelection();
    const selectedNodes = getEditorSelectedNode();
    // todo: check
    const nextSelectedNode =
      selectedNodes?.startNode != null
        ? getNextNode(tree, selectedNodes?.startNode)
        : null;
    if (
      selectedNodes?.startNode?.getType() == 'emoji' &&
      nextSelectedNode?.getType() == 'text'
    ) {
      setSelection({
        nodeIndex: nextSelectedNode.getIndex(),
        offset: 0,
      });
    }

    selection = getSelection();
    if (selection == null) return;

    const { startSelection, endSelection } = selection;
    if (isEditorSelectionCollapsed(selection)) {
      const nodeIndex = startSelection.nodeIndex;
      const selectedNodes = getEditorSelectedNode();
      const nodeElement = getDomNodeByNodeIndex(nodeIndex);
      if (nodeElement == null) return;
      if (selectedNodes?.startNode?.isTextNode())
        setCaretPosition(nodeElement, startSelection.offset);
      else setCaretAfter(nodeElement);
    } else {
      const selectedNodes = getEditorSelectedNode();
      const startNode = selectedNodes?.startNode;
      const endNode = selectedNodes?.endNode;
      if (startNode == null || endNode == null) return;
      selectRangeInDom(
        startNode,
        startSelection.offset,
        endNode,
        endSelection.offset,
      );
    }
  }, [tree]);

  return {
    insertEmoji,
    insertNewParagraph,
    handlers: {
      handleKeyDown,
      handleOnBeforeInput,
      handleSelectionChange: handleInputSelectionChange,
    },
  };
};

export { useController };
