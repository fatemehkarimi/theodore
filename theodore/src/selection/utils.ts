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

export const isPTag = (node: Node) => {
  return (
    node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'P'
  );
};

export const getReferencableNode = (node: Node) => {
  if (node.nodeType == Node.ELEMENT_NODE) return node;
  if (node.nodeType == Node.TEXT_NODE && node.parentNode != null)
    return node.parentNode;
  return node;
};

export const getCountCharsInNode = (node: Node): number => {
  if (node.nodeType == Node.TEXT_NODE)
    return (node as Text).textContent?.length ?? 0;

  if (node.nodeType == node.ELEMENT_NODE && node.childNodes.length == 0)
    return 1;

  const sum = Array.from(node.childNodes).reduce((sum, child) => {
    return sum + getCountCharsInNode(child);
  }, 0);

  return sum;
};

export const hasTextContent = (node: Node) => {
  if (node.nodeType == Node.TEXT_NODE) return true;
  if (node.childNodes.length == 0) return false;

  if (node.childNodes[0].nodeType == Node.TEXT_NODE) return true;
  return false;
};

export const getNodeTextContentLength = (node: Node): number => {
  if (node.nodeType == Node.TEXT_NODE)
    return (node as Text).textContent?.length ?? 0;
  if (node.nodeType == Node.ELEMENT_NODE)
    return Array.from(node.childNodes).reduce((sum, child) => {
      return sum + getNodeTextContentLength(child);
    }, 0);
  return 0;
};
