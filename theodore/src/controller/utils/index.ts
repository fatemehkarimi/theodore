import emojiRegex from 'emoji-regex';
import type { KeyboardEvent, MutableRefObject } from 'react';
import { isDevelopment } from '../../environment';
import { ARROW_RIGHT, END } from '../../keys';
import type { Node as EditorNode } from '../../nodes/Node';
import { TextNode } from '../../nodes/textNode/TextNode';
import type { Tree } from '../../types';
import type { SelectionDesc } from '../selection/types';

type TextNodeUpdater = (textNode: TextNode) => void;

const ALWAYS_IN_DOM_NODE_INDEX = 1;
const ALWAYS_IN_DOM_NODE_SELECTION = {
  nodeIndex: ALWAYS_IN_DOM_NODE_INDEX,
  offset: 0,
};

const setCaretBeforeSuggestionHint = (hint: HTMLElement) => {
  const selection = document.getSelection();
  if (selection == null) return;

  const range = document.createRange();
  range.setStartBefore(hint);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const getParagraphBoundaryPoint = (
  range: Range,
  allowSelectionInsideText: boolean,
) => {
  let node = range.startContainer;
  let offset = range.startOffset;

  if (node.nodeType == Node.TEXT_NODE) {
    if (!allowSelectionInsideText && offset < (node.textContent?.length ?? 0))
      return null;

    const spanParentNode = node.parentNode;
    const pNode = spanParentNode?.parentNode;
    if (spanParentNode == null || pNode == null) return null;

    return {
      node: pNode,
      offset:
        Array.from(pNode.childNodes).findIndex(
          (child) => child == (spanParentNode as Node),
        ) + 1,
    };
  }

  if (node.nodeType == Node.ELEMENT_NODE && node.nodeName != 'P') {
    const childNode = node;
    node = childNode.parentNode as Node;
    const childIndex = Array.from(node.childNodes).findIndex(
      (child) => child == childNode,
    );
    offset = offset == 1 ? childIndex + 1 : childIndex;
  }

  return { node, offset };
};

const keepCaretBeforeSuggestionHint = (
  event: KeyboardEvent,
  inputRef: MutableRefObject<HTMLDivElement | null>,
) => {
  if (event.shiftKey || ![ARROW_RIGHT, END].includes(event.key)) return;

  const selection = document.getSelection();
  if (selection == null || !selection.isCollapsed || selection.rangeCount == 0)
    return;

  const range = selection.getRangeAt(0);
  if (!inputRef.current?.contains(range.commonAncestorContainer)) return;

  const boundaryPoint = getParagraphBoundaryPoint(range, event.key == END);
  if (boundaryPoint == null || boundaryPoint.node.nodeType != Node.ELEMENT_NODE)
    return;

  const childNodes = Array.from(boundaryPoint.node.childNodes);
  const nextChild = childNodes[boundaryPoint.offset];
  const lastChild = childNodes[childNodes.length - 1];
  const trailingSuggestionHint =
    lastChild instanceof HTMLElement &&
    lastChild.dataset.suggestionHint === 'true'
      ? lastChild
      : null;

  if (trailingSuggestionHint == null) return;

  if (event.key == END || nextChild == trailingSuggestionHint) {
    event.preventDefault();
    setCaretBeforeSuggestionHint(trailingSuggestionHint);
  }
};

export function getNode(
  tree: readonly EditorNode[][] | null,
  currentNode: EditorNode,
): EditorNode | null {
  if (tree == null) return null;

  let subTreeIdx = -1;
  let nodeIdx = -1;
  for (let i = 0; i < tree.length; i++) {
    const subTree = tree[i];
    for (let j = 0; j < subTree.length; j++) {
      const node = subTree[j];
      if (node.getIndex() == currentNode.getIndex()) {
        subTreeIdx = i;
        nodeIdx = j;
        break;
      }
    }
    if (subTreeIdx != -1 && nodeIdx != -1) break;
  }

  if (nodeIdx + 1 < tree[subTreeIdx].length) {
    return tree[subTreeIdx][nodeIdx + 1];
  } else if (subTreeIdx + 1 < tree.length) {
    return tree[subTreeIdx + 1][0];
  }
  return currentNode;
}

export function getNextNode(
  tree: readonly EditorNode[][] | null,
  currentNode: EditorNode,
): EditorNode | null {
  if (tree == null) return null;

  let subTreeIdx = -1;
  let nodeIdx = -1;
  for (let i = 0; i < tree.length; i++) {
    const subTree = tree[i];
    for (let j = 0; j < subTree.length; j++) {
      const node = subTree[j];
      if (node.getIndex() == currentNode.getIndex()) {
        subTreeIdx = i;
        nodeIdx = j;
        break;
      }
    }
    if (subTreeIdx != -1 && nodeIdx != -1) break;
  }

  if (nodeIdx + 1 < tree[subTreeIdx].length) {
    return tree[subTreeIdx][nodeIdx + 1];
  } else if (subTreeIdx + 1 < tree.length) {
    return tree[subTreeIdx + 1][0];
  }
  return currentNode;
}

const getNodeIndexInTree = (tree: Tree, nodeIndex: number | undefined) => {
  const subtreeIdx = tree.findIndex((subtree) =>
    subtree.find((t) => t.getIndex() == nodeIndex),
  );

  if (subtreeIdx == -1) return [-1, -1];
  const nodeIdx = tree[subtreeIdx].findIndex(
    (node) => node.getIndex() == nodeIndex,
  );

  return [subtreeIdx, nodeIdx];
};

const getParagraphIndexInTree = (tree: Tree, nodeIndex: number | undefined) => {
  const [subTreeIdx] = getNodeIndexInTree(tree, nodeIndex);
  return subTreeIdx;
};

const findNode = (tree: Tree, nodeIndex: number | undefined) => {
  return tree.flat().find((node) => node.getIndex() == nodeIndex);
};

const cloneTree = (tree: Tree): Tree => {
  return tree.map((subtree) => subtree.map((node) => node.clone()));
};

const updateTextNodeInTree = (
  tree: Tree,
  nodeIndex: number | undefined,
  updateTextNode: TextNodeUpdater,
): [Tree, TextNode | null] => {
  const [subtreeIdx, nodeIdx] = getNodeIndexInTree(tree, nodeIndex);
  if (subtreeIdx == -1 || nodeIdx == -1) return [tree, null];

  const node = tree[subtreeIdx][nodeIdx];
  if (!node.isTextNode()) return [tree, null];

  const textNode = (node as TextNode).clone();
  updateTextNode(textNode);

  const newTree = [...tree];
  const newSubTree = [...tree[subtreeIdx]];
  newSubTree[nodeIdx] = textNode;
  newTree[subtreeIdx] = newSubTree;

  return [newTree, textNode];
};

const findNodeAfter = (tree: Tree, nodeIndex: number | undefined) => {
  if (nodeIndex == undefined) return null;
  const [pIdx, nodeIdx] = getNodeIndexInTree(tree, nodeIndex);
  if (pIdx == -1 || nodeIdx == -1) return null;
  if (nodeIdx + 1 < tree[pIdx].length) {
    return tree[pIdx][nodeIdx + 1];
  } else if (pIdx + 1 < tree.length) {
    return tree[pIdx + 1][0];
  }
  return null;
};

const findNodeBefore = (tree: Tree, nodeIndex: number | undefined) => {
  if (nodeIndex == undefined) return null;
  const [pIdx, nodeIdx] = getNodeIndexInTree(tree, nodeIndex);
  if (pIdx == -1 || nodeIdx == -1) return null;
  if (nodeIdx - 1 >= 0) {
    return tree[pIdx][nodeIdx - 1];
  }
  if (tree.length > 1) {
    return tree[pIdx - 1][tree[pIdx - 1].length - 1];
  }
  return null;
};

const getDomNodeByNodeIndex = (nodeIndex: number) => {
  return document.querySelectorAll(
    `[data-node-index="${nodeIndex}"]`,
  )?.[0] as Element | null;
};

const reconcileTextNodeContentFromContentEditable = (
  container: HTMLDivElement,
  currentTree: Tree,
): [Tree | null, boolean] => {
  let renderedTree = cloneTree(currentTree);
  const metTextNodes = new Set<number>();

  for (const child of Array.from(container.children)) {
    const pNodeIndexStr = (child as HTMLElement).getAttribute(
      'data-node-index',
    );
    if (pNodeIndexStr != null && child.tagName == 'P') {
      for (const grandChild of Array.from(child.children)) {
        if (grandChild.tagName == 'BR') continue;
        else if (grandChild.tagName == 'SPAN') {
          const firstChild = grandChild.firstChild;
          if (!firstChild) continue;
          const isText = firstChild.nodeType === Node.TEXT_NODE;
          const isImage = firstChild instanceof HTMLImageElement;
          const nodeIndex = (grandChild as HTMLElement).getAttribute(
            'data-node-index',
          );
          if (nodeIndex == null) {
            if (isDevelopment)
              throw new Error(
                'invalid case. span first child has no data-node-index',
              );
            else return [null, false];
          }
          if (isText) {
            const textContent = firstChild.textContent ?? '';
            const node = findNode(renderedTree, Number(nodeIndex));
            metTextNodes.add(Number(nodeIndex));
            if (node != null && node.isTextNode()) {
              [renderedTree] = updateTextNodeInTree(
                renderedTree,
                Number(nodeIndex),
                (textNode) => textNode.setChild(textContent),
              );
            }
          } else if (isImage) {
          }
        } else {
          if (isDevelopment)
            throw new Error(
              'invalid case. saw tags other than br, span, img ' +
                grandChild.tagName,
            );
        }
      }
    } else {
      if (isDevelopment)
        throw new Error(
          'invalid case. a non p tag or a node without nodeIndex is in contenteditable',
        );
    }
  }

  let doesBrowserRemovedAnyNode = false;
  for (let i = 0; i < renderedTree.length; ++i) {
    for (let j = 0; j < renderedTree[i].length; ++j) {
      const node = renderedTree[i][j];
      // if you haven't see the node in dom iteration, then the node is removed
      // by the browser
      if (node.isTextNode() && !metTextNodes.has(node.getIndex())) {
        [renderedTree] = updateTextNodeInTree(
          renderedTree,
          node.getIndex(),
          (textNode) => textNode.setChild(''),
        );
        doesBrowserRemovedAnyNode = true;
      }
    }
  }

  return [renderedTree, doesBrowserRemovedAnyNode];
};

const removeNodeFromTree = (tree: Tree, nodeIndex: number) => {
  const [subTreeIdx, nodeIdx] = getNodeIndexInTree(tree, nodeIndex);
  const newTree = [...tree];
  newTree[subTreeIdx] = [
    ...tree[subTreeIdx].slice(0, nodeIdx),
    ...tree[subTreeIdx].slice(nodeIdx + 1),
  ];
  return newTree;
};

const getSelectionAfterNodeRemove = (
  tree: Tree,
  nodeIndex: number,
): SelectionDesc => {
  const prevNode = findNodeBefore(tree, nodeIndex);
  if (prevNode) {
    if (prevNode.isTextNode())
      return {
        nodeIndex: prevNode.getIndex(),
        offset: prevNode.getChildLength(),
      };
    /*else if (prevNode.getType() == 'paragraph') {
      const pIdx = getParagraphIndexInTree(tree, prevNode.getIndex());
      if (pIdx == -1) return ALWAYS_IN_DOM_NODE_SELECTION;
      const p = tree[pIdx];
      if (p.length == 1)
        return {
          nodeIndex: prevNode.getIndex(),
          offset: 0,
        };
      const lastChildOfPrevNode = p[p.length - 1];
      return {
        nodeIndex: lastChildOfPrevNode.getIndex(),
        offset: lastChildOfPrevNode.isTextNode()
          ? lastChildOfPrevNode.getChildLength()
          : 0,
      };
    }*/ else
      return {
        nodeIndex: prevNode.getIndex(),
        offset: 0,
      };
  } else return ALWAYS_IN_DOM_NODE_SELECTION;
};

const isEmoji = (text: string): boolean => {
  if (!text || text.length === 0) return false;
  const emojiRegex = /\p{Extended_Pictographic}/u;
  return emojiRegex.test(text);
};

const getFirstEmoji = (s: string): string | null =>
  s.match(
    /\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*|[\u{1F1E6}-\u{1F1FF}]{2}/u,
  )?.[0] ?? null;

const insertNodesInBetween = (
  tree: Tree,
  nodesToInsert: (EditorNode | EditorNode[])[],
  prevNode: number | undefined,
  nextNode: number | undefined,
) => {
  const [prevNodePIdx, prevNodeIdx] = getNodeIndexInTree(tree, prevNode);
  const [nextNodePIdx, nextNodeIdx] = getNodeIndexInTree(tree, nextNode);

  if (prevNodeIdx == -1) return tree;
  const newTree = tree.slice(0, prevNodePIdx);

  const newStartP = tree[prevNodePIdx].slice(0, prevNodeIdx + 1);
  let newStartPAppended = false;

  for (const node of nodesToInsert) {
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
    const firstNode = remainingNodes.length > 0 ? remainingNodes[0] : null;
    if (firstNode != null && firstNode.getType() == 'paragraph')
      newTree.push(remainingNodes);
    else newTree[newTree.length - 1].push(...remainingNodes);
    newTree.push(...tree.slice(nextNodePIdx + 1));
  }
  return newTree;
};

const EMOJI_REGEX_EMOJI_DETECTOR = emojiRegex();
const segmentText = (text: string): string[] => {
  if (typeof (Intl as any).Segmenter === 'function') {
    return [
      ...new (Intl as any).Segmenter(undefined, {
        granularity: 'grapheme',
      }).segment(text),
    ].map((data: any) => data.segment);
  } else {
    const result: string[] = [];
    let start = 0;

    for (const match of text.matchAll(EMOJI_REGEX_EMOJI_DETECTOR)) {
      const emojiStart = match.index ?? 0;
      const emoji = match[0];

      if (emojiStart > start) {
        result.push(text.slice(start, emojiStart));
      }
      result.push(emoji);
      start = emojiStart + emoji.length;
    }

    if (start < text.length) {
      result.push(text.slice(start));
    }

    if (result.length === 0) return [text];
    return result;
  }
};

const isElementInView = (container: HTMLElement | null, element: Element) => {
  const elRect = element.getBoundingClientRect();
  let isInView = false;
  if (container != null) {
    const containerRect = container.getBoundingClientRect();
    isInView =
      elRect.top < containerRect.top ||
      elRect.bottom > containerRect.bottom ||
      elRect.left < containerRect.left ||
      elRect.right > containerRect.right;
  } else {
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    isInView = elRect.top < 0 || elRect.bottom > viewportHeight;
  }
  return isInView;
};

const findSelectedNodeToInsertText = (
  tree: Tree,
  nodeIndex: number | undefined,
) => {
  const node = findNode(tree, nodeIndex);
  if (node != null && node.getType() == 'paragraph') {
    const nextNode = findNodeAfter(tree, node.getIndex());
    if (nextNode != null && nextNode.getType() == 'text') return nextNode;
  }
  return node;
};

export function breakAndReplaceTextNode(
  tree: Tree,
  textNode: TextNode,
  splitPosition: number,
  assignNodeIndex: () => number,
): [Tree, TextNode, TextNode] {
  const text = textNode.getChildren();
  if (text == null) {
    throw new Error('tries to insert emoji at a text node with null content');
  }
  const [beforeText, afterText] = [
    text.slice(0, splitPosition),
    text.slice(splitPosition),
  ];
  const afterTextNode = new TextNode(assignNodeIndex());
  afterTextNode.setChild(afterText);

  const beforeTextNode = textNode.clone();
  beforeTextNode.setChild(beforeText);

  const [subtreeIdx, nodeIdxInTree] = getNodeIndexInTree(
    tree,
    textNode.getIndex(),
  );
  const subTree = tree[subtreeIdx];
  const newSubTree = [
    ...subTree.slice(0, nodeIdxInTree),
    beforeTextNode,
    afterTextNode,
    ...subTree.slice(nodeIdxInTree + 1),
  ];
  const newTree = [...tree];
  newTree[subtreeIdx] = newSubTree;

  return [newTree, beforeTextNode, afterTextNode];
}

const isSelectionAnchorSameAsFocus = () => {
  const selection = document.getSelection();
  if (selection == null || selection.rangeCount == 0) return false;
  const range = selection.getRangeAt(0);

  return range.startContainer == range.endContainer;
};

const findGhostNode = (tree: Tree) => {
  return tree.flat().find((node) => node.isGhost());
};

export {
  ALWAYS_IN_DOM_NODE_INDEX,
  ALWAYS_IN_DOM_NODE_SELECTION,
  getNodeIndexInTree,
  getParagraphIndexInTree,
  findNode,
  cloneTree,
  updateTextNodeInTree,
  findNodeAfter,
  findNodeBefore,
  getDomNodeByNodeIndex,
  reconcileTextNodeContentFromContentEditable,
  removeNodeFromTree,
  getSelectionAfterNodeRemove,
  isEmoji,
  getFirstEmoji,
  insertNodesInBetween,
  segmentText,
  isElementInView,
  findSelectedNodeToInsertText,
  isSelectionAnchorSameAsFocus,
  keepCaretBeforeSuggestionHint,
  findGhostNode,
};
