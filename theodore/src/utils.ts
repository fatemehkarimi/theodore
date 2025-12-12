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

export const convertRangeBoundyPointToParagraphBoundaryPoint = (
  container: Node,
  initialOffset: number,
): { node: Node; offset: number } => {
  const startOffset = initialOffset;
  let startContainer = container;
  let node = startContainer;
  let offset = initialOffset;

  if (node.nodeType == Node.TEXT_NODE && node.parentNode != null) {
    const spanParentNode = node.parentNode;
    const pNode = spanParentNode.parentNode;
    if (pNode != null) {
      offset =
        Array.from(pNode.childNodes).findIndex(
          (c: Node) => c == spanParentNode,
        ) + 1;
    }
    return { node: pNode as Node, offset };
  }

  /* firefox differs from chrome and safari in startContainer. in chrome and safari,
      the start container is the P tag, but in firefox it is the span. here we convert
      firefox range to chrome range.
    */
  if (!isPTag(node)) {
    node = node.parentNode as HTMLElement;
    const indexOfChild = Array.from(node.childNodes).findIndex(
      (c) => c === startContainer,
    );

    if (indexOfChild == 0) {
      offset = startOffset;
    }

    if (startOffset == 1) offset = indexOfChild + 1;
    else offset = indexOfChild;
  }

  return { node, offset };
};

export const isTextNode = (node: Node) => node.nodeType == Node.TEXT_NODE;

export function computeLineHeightPx(
  computedStyle: CSSStyleDeclaration,
): number | null {
  const raw = computedStyle.lineHeight;
  const fontSizePx = parseFloat(computedStyle.fontSize || '');
  const hasFontSize = Number.isFinite(fontSizePx);

  if (!raw) return null;
  // https://medium.com/design-bootcamp/ux-golden-tip-1-the-magic-number-for-line-height-aae93cd1a35
  if (raw === 'normal') return hasFontSize ? Math.ceil(fontSizePx * 1.4) : null;

  const numeric = parseFloat(raw);
  if (!Number.isFinite(numeric)) return null;

  const trimmed = raw.trim();
  if (trimmed.endsWith('px')) return numeric;
  if (trimmed.endsWith('%'))
    return hasFontSize ? (numeric / 100) * fontSizePx : null;

  return hasFontSize ? numeric * fontSizePx : numeric;
}

export const copyTextToClipboard = (text: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      navigator.clipboard.writeText(text);
      return;
    } catch {}
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';

  const selection = document.getSelection();
  const originalRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
    if (originalRange && selection) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
  }
};

export function getTextFromDomSelection() {
  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0) return undefined;

  const parts: string[] = [];

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    const fragment = range.cloneContents();

    const container = document.createElement('div');
    container.appendChild(fragment);

    const images = container.querySelectorAll('img');
    images.forEach((img) => {
      const alt = img.getAttribute('alt') || '';
      const textNode = document.createTextNode(alt);
      img.replaceWith(textNode);
    });

    const paragraphs = container.querySelectorAll('p');
    Array.from(paragraphs)
      .slice(0, paragraphs.length - 1)
      .forEach((p) => {
        const hasText =
          (p.textContent && p.textContent.trim().length > 0) ||
          p.querySelector('br');
        if (!hasText) return;

        p.appendChild(document.createTextNode('\n'));
      });

    const text = container.textContent || '';
    parts.push(text);
  }

  return parts.join('');
}
