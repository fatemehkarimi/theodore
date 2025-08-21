import type { Node } from '../../nodes/Node';

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
