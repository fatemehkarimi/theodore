import Graphemer from 'graphemer';
import type { Node } from '../../nodes/Node';
import type { Tree } from '../../types';
import type { SelectionDesc } from '../selection/types';

export const ALWAYS_IN_DOM_NODE_INDEX = 1;
export const ALWAYS_IN_DOM_NODE_SELECTION = {
  nodeIndex: ALWAYS_IN_DOM_NODE_INDEX,
  offset: 0,
};

export function getNode(
  tree: readonly Node[][] | null,
  currentNode: Node,
): Node | null {
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
  tree: readonly Node[][] | null,
  currentNode: Node,
): Node | null {
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

export const getNodeIndexInTree = (
  tree: Tree,
  nodeIndex: number | undefined,
) => {
  const subtreeIdx = tree.findIndex((subtree) =>
    subtree.find((t) => t.getIndex() == nodeIndex),
  );

  if (subtreeIdx == -1) return [-1, -1];
  const nodeIdx = tree[subtreeIdx].findIndex(
    (node) => node.getIndex() == nodeIndex,
  );

  return [subtreeIdx, nodeIdx];
};

export const getParagraphIndexInTree = (
  tree: Tree,
  nodeIndex: number | undefined,
) => {
  const [subTreeIdx] = getNodeIndexInTree(tree, nodeIndex);
  return subTreeIdx;
};

export const findNode = (tree: Tree, nodeIndex: number | undefined) => {
  return tree.flat().find((node) => node.getIndex() == nodeIndex);
};

export const findNodeAfter = (tree: Tree, nodeIndex: number | undefined) => {
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

export const findNodeBefore = (tree: Tree, nodeIndex: number | undefined) => {
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

export const getDomNodeByNodeIndex = (nodeIndex: number) => {
  return document.querySelectorAll(
    `[data-node-index="${nodeIndex}"]`,
  )?.[0] as Element | null;
};

export const removeNodeFromTree = (tree: Tree, nodeIndex: number) => {
  const [subTreeIdx, nodeIdx] = getNodeIndexInTree(tree, nodeIndex);
  const newTree = [...tree];
  newTree[subTreeIdx] = [
    ...tree[subTreeIdx].slice(0, nodeIdx),
    ...tree[subTreeIdx].slice(nodeIdx + 1),
  ];
  return newTree;
};

export const getSelectionAfterNodeRemove = (
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

export const isEmoji = (text: string): boolean => {
  if (!text || text.length === 0) return false;
  const emojiRegex = /\p{Extended_Pictographic}/u;
  return emojiRegex.test(text);
};

export const getFirstEmoji = (s: string): string | null =>
  s.match(
    /\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*|[\u{1F1E6}-\u{1F1FF}]{2}/u,
  )?.[0] ?? null;

export const insertNodesInBetween = (
  tree: Tree,
  nodesToInsert: (Node | Node[])[],
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

export const segmentText = (text: string): string[] => {
  if (typeof (Intl as any).Segmenter === 'function') {
    return [
      ...new (Intl as any).Segmenter(undefined, {
        granularity: 'grapheme',
      }).segment(text),
    ].map((data: any) => data.segment);
  } else {
    const graphemer = new Graphemer();
    return graphemer.splitGraphemes(text);
  }
};

export const isElementInView = (
  container: HTMLElement | null,
  element: Element,
) => {
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

export const findSelectedNodeToInsertText = (
  tree: Tree,
  nodeIndex: number | undefined,
) => {
  const node = findNode(tree, nodeIndex);
  if (node != null && node.getType() == 'paragraph') {
    const nextNode = findNodeAfter(tree, node.getIndex());
    if (nextNode != null && nextNode.getType() != 'paragraph') return nextNode;
  }
  return node;
};
