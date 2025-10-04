import { getDomNodeByNodeIndex } from '../controller/utils';
import type { EditorNodeSelection as EditorSelection } from '../controller/selection/types';
import { Node as EditorNode } from '../nodes/Node';
import {
  convertRangeBoundyPointToParagraphBoundaryPoint,
  getFirstNode,
  getNodeOrFirstTextNode,
  isEmptyParagraph,
} from '../utils';

export const setCaretToEnd = (inputEl: HTMLElement) => {
  if (!inputEl) return;

  const range = document.createRange();
  const sel = window.getSelection();
  if (sel == null) return;
  range.selectNodeContents(inputEl);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
};

export const setCaretToBegining = (inputEl: HTMLElement) => {
  if (!inputEl) return;

  const range = document.createRange();
  const sel = window.getSelection();
  if (sel == null) return;
  range.setStart(inputEl, 0);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
};

export function setCaretPosition(element: Node, position: number) {
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node as Text).length >= position) {
        const range = document.createRange();
        const selection = window.getSelection()!;
        range.setStart(node, position);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        return -1;
      } else {
        position -= 'length' in node ? (node.length as number) : 0;
      }
    } else {
      position = setCaretPosition(node, position);
      if (position === -1) {
        return -1;
      }
    }
  }

  // this case happens when you select a range [text, emoji] and enter and emoji,
  // the text node will remain but it is empty
  if (element.childNodes.length == 0) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(element, 0);
    range.collapse();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return -1;
  }

  return position;
}

export function setCaretAfter(element: Node) {
  const selection = document.getSelection();
  if (selection != null) {
    var range = document.createRange();

    // if the element is a paragraph, we set the caret at the beginning so that the selection still remains in the node
    if (element.nodeName == 'P') range.setStart(element, 0);
    else range.setStartAfter(element);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function selectRangeInDom(
  startNode: EditorNode,
  startOffset: number,
  endNode: EditorNode,
  endOffset: number,
) {
  const domStartNode = getDomNodeByNodeIndex(startNode.getIndex());
  const domEndNode = getDomNodeByNodeIndex(endNode.getIndex());
  if (domStartNode == null || domEndNode == null) return;
  const range = document.createRange();

  if (startNode.isTextNode()) {
    const targetNode = getNodeOrFirstTextNode(domStartNode);
    range.setStart(targetNode, startOffset);
  } else {
    if (domStartNode.tagName == 'P') range.setStart(domStartNode, 0);
    else range.setStartAfter(domStartNode);
  }

  if (endNode.isTextNode()) {
    const targetNode = getNodeOrFirstTextNode(domEndNode);
    range.setEnd(targetNode, endOffset);
  } else {
    if (domEndNode.tagName == 'P') range.setEnd(domEndNode, 0);
    else range.setEndAfter(domEndNode);
  }

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

export function moveToNodeBySelection(selection: EditorSelection) {
  if (selection == null) return;
  const nodeElement = getDomNodeByNodeIndex(selection.nodeIndex);

  if (nodeElement == null) return;
  setCaretPosition(nodeElement, selection.offset ?? 0);
}

/* Returns the node before the current selection.
 when it is at the begining of the paragraph, it returns the node itself
*/
export function getNodeBeforeSelection() {
  const selection = window.getSelection();
  if (!selection) return null;
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  let node: Node | null = range.startContainer;
  let offset = range.startOffset;

  if (!node) return null;

  // for empty paragprah we return the paragraph itself
  if (
    node &&
    node.firstChild != null &&
    node.firstChild == node.lastChild &&
    node.firstChild.nodeName == 'BR'
  ) {
    return node;
  }
  // If the cursor is inside a text node, get its parent
  if (node.nodeType === Node.TEXT_NODE) {
    // node = node.parentNode;
    return node.parentNode;
  }

  if (offset > 0) {
    return node.childNodes[offset - 1];
  }

  // return node.previousSibling;
  return node;
}

export function moveCursorForwardOrBackward(
  direction: 'forward' | 'backward',
  granularity: 'character',
) {
  const selection = document.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  let node = range.startContainer;
  let offset = range.startOffset;

  const backwardOffset = offset - 1;
  const forwardOffset = offset + 1;
  const nextOffset = direction == 'backward' ? backwardOffset : forwardOffset;

  if (node.nodeType == Node.TEXT_NODE) {
    const nodeContentLength = node.textContent?.length ?? 0;
    if (nextOffset >= 0 && nextOffset <= nodeContentLength) offset = nextOffset;
    else if (nextOffset < 0) {
      const parent = node.parentNode as ChildNode | null;
      const grandParent = parent?.parentNode;
      if (grandParent) {
        const parentIndex = Array.from(grandParent.childNodes).indexOf(parent);
        if (parentIndex != -1 && parentIndex - 1 >= 0) {
          node = grandParent;
          offset = parentIndex - 1;
        } else {
          // moving to previous paragraph
          if (grandParent.previousSibling != null) {
            node = grandParent.previousSibling;
            offset = grandParent.previousSibling.childNodes.length;
          }
        }
      }
    } else if (nextOffset > nodeContentLength) {
      const parent = node.parentNode as ChildNode | null;
      const grandParent = parent?.parentNode;
      if (grandParent && grandParent.childNodes) {
        const parentIndex = Array.from(grandParent.childNodes).indexOf(parent);
        if (
          parentIndex != -1 &&
          parentIndex + 2 <= grandParent.childNodes.length
        ) {
          node = grandParent;
          offset = parentIndex + 2;
        } else {
          // moving to next paragraph
          // if first node of next paragraph is a text node, text node should be
          // selected
          if (grandParent.nextSibling != null) {
            node = getNodeOrFirstTextNode(grandParent.nextSibling);
            offset = 0;
          }
        }
      }
    }
  } else if (isEmptyParagraph(node)) {
    const prevSibling = node.previousSibling;
    const nextSibling = node.nextSibling;

    if (direction == 'backward' && prevSibling != null) {
      node = prevSibling;
      offset = prevSibling.childNodes.length ?? 0;
    } else if (direction == 'forward' && nextSibling != null) {
      const firstChildOfNextP = getFirstNode(nextSibling);
      if (firstChildOfNextP.nodeType == Node.TEXT_NODE)
        node = firstChildOfNextP;
      else node = nextSibling;
      offset = 0;
    }
  } else if (
    node.nodeType == Node.ELEMENT_NODE &&
    node.nodeName == 'P' &&
    ((offset == 0 && nextOffset < 0) ||
      (offset == node.childNodes.length && nextOffset > node.childNodes.length))
  ) {
    if (offset == 0 && node.previousSibling != null) {
      node = node.previousSibling;
      offset = node.childNodes.length;
    } else if (offset == node.childNodes.length && node.nextSibling != null) {
      node = getNodeOrFirstTextNode(node.nextSibling);
      offset = 0;
    }
  } else if (node.nodeType == Node.ELEMENT_NODE) {
    if (nextOffset >= 0 && nextOffset <= node.childNodes.length) {
      offset = nextOffset;
    }

    if (offset < node.childNodes.length) {
      const nextNodeChilds = node.childNodes[offset].childNodes;
      if (
        // if next node is text node
        nextNodeChilds.length > 0 &&
        nextNodeChilds[0].nodeType == Node.TEXT_NODE
      ) {
        node = nextNodeChilds[0];
        offset = node.textContent
          ? direction == 'backward'
            ? node.textContent.length - 1
            : 0
          : 0;
      }
    }
  }

  const newRange = document.createRange();
  newRange.setStart(node, offset);
  newRange.collapse(true);

  const sel = window.getSelection();
  if (sel == null) return;
  sel.removeAllRanges();
  sel.addRange(newRange);
}

// converts dom selection to editor selection.
export const convertDomSelectionToEditorSelection = (
  container: Node,
  initialOffset: number,
): EditorSelection => {
  let node = container;
  let offset = initialOffset;

  /* on firefox, when pressing ctrl + a, the entire editor is the start container node.
  this behavior is different from chrome and safari.
  */
  const hasNodeIndex =
    node.nodeType == Node.TEXT_NODE
      ? true
      : (node as HTMLElement)?.dataset?.nodeIndex != undefined;
  if (!hasNodeIndex) {
    const editorChildren = Array.from(container.childNodes);
    if (initialOffset == 0) {
      const pNodeIdx = (editorChildren[0] as HTMLElement)?.dataset?.nodeIndex;
      if (pNodeIdx == null) return null;
      return {
        nodeIndex: Number(pNodeIdx),
        offset: 0,
      };
    }

    const lastNode = editorChildren[offset - 1];
    const lastNodeNodeIndex = (lastNode as HTMLElement)?.dataset?.nodeIndex;
    const childrenOfPNode = Array.from(lastNode.childNodes);
    const lastChild = childrenOfPNode[childrenOfPNode.length - 1]; // span or br
    if (lastChild.nodeName == 'BR') {
      if (lastNodeNodeIndex != undefined)
        return {
          nodeIndex: Number(lastNodeNodeIndex),
          offset: 0,
        };
      else return null;
    }

    const lastChildNodeIndex = (lastChild as HTMLElement)?.dataset?.nodeIndex;
    if (lastChildNodeIndex == null) return null;
    const lastChildContent = lastChild.childNodes[0];

    if (
      lastChildContent != undefined &&
      lastChildContent.nodeType == Node.TEXT_NODE
    ) {
      return {
        nodeIndex: Number(lastChildNodeIndex),
        offset: lastChildContent.textContent?.length ?? 0,
      };
    } else
      return {
        nodeIndex: Number(lastChildNodeIndex),
        offset: 0,
      };
  }

  if (node.nodeType == Node.ELEMENT_NODE) {
    const pBounrayPoint = convertRangeBoundyPointToParagraphBoundaryPoint(
      container,
      initialOffset,
    );
    node = pBounrayPoint.node;
    offset = pBounrayPoint.offset;

    if (isEmptyParagraph(node) || offset == 0) {
      const nodeIndex = (node as HTMLElement).dataset.nodeIndex;
      if (nodeIndex != undefined)
        return {
          nodeIndex: Number(nodeIndex),
          offset: 0,
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
        let finalOffset = 0;
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
