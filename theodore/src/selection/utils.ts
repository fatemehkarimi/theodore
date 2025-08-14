// this function checks if a node is an empty paragraph node
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

// this function checks if the first child of a node is a text node,
// if so, returns it, otherwise returns the node
export const getNodeOrFirstTextNode = (node: Node) => {
  const firstNode = getFirstNode(node);
  if (firstNode?.nodeType == Node.TEXT_NODE) return firstNode;
  else return node;
};
