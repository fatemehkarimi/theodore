import type { Node } from '../../nodes/Node';
import type { SelectionDesc, Tree } from '../../types';

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
