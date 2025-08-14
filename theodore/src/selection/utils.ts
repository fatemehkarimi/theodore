import { Selection as EditorSelection } from '../types';

// checks if a node is an empty paragraph node
// it is empty if it has only one child, which is a <br />
export const isEmptyParagraph = (node: Node) => {
  if (node.nodeType != Node.ELEMENT_NODE) return false;
  if (node.nodeName == 'BR') return true;
  const childNodes = Array.from(node.childNodes);
  if (childNodes.length > 1) return false;

  const firstChild = childNodes[0];
  return firstChild.nodeName == 'BR';
};

export const getFirstNode = (node: Node) => {
  const firstNode = node.childNodes[0];
  if (
    firstNode?.nodeType == Node.ELEMENT_NODE &&
    firstNode.childNodes[0]?.nodeType == Node.TEXT_NODE
  ) {
    return firstNode.childNodes[0];
  } else return firstNode;
};

// checks if the first child of a node is a text node,
// if so, returns it, otherwise returns the node
export const getNodeOrFirstTextNode = (node: Node) => {
  const firstNode = getFirstNode(node);
  if (firstNode?.nodeType == Node.TEXT_NODE) return firstNode;
  else return node;
};

// converts dom selection to editor selection.
export const convertDomSelectionToEditorSelection = (
  node: Node,
  offset: number,
): EditorSelection => {
  if (node.nodeType == Node.ELEMENT_NODE) {
    if (isEmptyParagraph(node) || offset == 0) {
      const nodeIndex = (node as HTMLElement).dataset.nodeIndex;
      if (nodeIndex != undefined)
        return {
          nodeIndex: Number(nodeIndex),
          offset,
        };
      else return null;
    }

    let currentNode = node.childNodes[offset - 1];
    while (
      currentNode.nodeType != Node.TEXT_NODE &&
      currentNode.childNodes.length > 0
    ) {
      const childNode = currentNode.childNodes[0];
      const childNodeIndex = (childNode as HTMLElement)?.dataset?.nodeIndex; // child node can be a text node
      const nodeIndex = (currentNode as HTMLElement).dataset.nodeIndex;

      if (childNodeIndex == undefined && nodeIndex != undefined) {
        let finalOffset = offset;
        if (childNode.nodeType == Node.TEXT_NODE)
          finalOffset = childNode.textContent?.length ?? offset;

        return {
          nodeIndex: Number(nodeIndex),
          offset: finalOffset,
        };
      }
    }
    return null;
  }
  if (node.nodeType == Node.TEXT_NODE) {
    const parentNode = node.parentNode as HTMLElement;
    const parentNodeIndex = parentNode?.dataset.nodeIndex;
    if (parentNodeIndex != null) {
      return {
        nodeIndex: Number(parentNodeIndex),
        offset,
      };
    }
  }
  return null;
};
