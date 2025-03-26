import { NavigationKeys } from '../keys';
import { SelectionDesc } from '../types';

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

export const isOnlyNavigationKey = (event: React.KeyboardEvent) => {
  if (event.ctrlKey || event.shiftKey || event.altKey) return false;
  return NavigationKeys.includes(event.key);
};

export function moveToNodeBySelection(selection: SelectionDesc | null) {
  if (selection == null) return;
  const nodeElement = document.querySelectorAll(
    `[data-node-index="${selection.nodeIndex}"]`,
  )?.[0];

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

export function moveCursor(
  direction: 'forward' | 'backward',
  granularity: 'character',
) {
  const selection = document.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  let node = range.startContainer;
  let offset = range.startOffset;

  const backwardOffset = Math.max(offset - 1, 0);
  const forwardOffset = Math.min(
    offset + 1,
    node.textContent?.length ?? offset + 1,
  );
  const nextOffset = direction == 'backward' ? backwardOffset : forwardOffset;

  if (node.nodeType == Node.TEXT_NODE) {
    offset = nextOffset;
    if (offset == 0) {
      const parent = node.parentNode as ChildNode | null;
      const grandParent = parent?.parentNode;
      if (grandParent) {
        const nextOffset = Array.from(grandParent.childNodes).indexOf(parent);
        if (nextOffset != -1 && nextOffset != offset) {
          node = grandParent;
          offset = nextOffset;
        }
      }
    } else if (offset == node.textContent?.length) {
      const parent = node.parentNode;
      const grandParent = parent?.parentNode;
      if (grandParent) {
        const nextOffset =
          // @ts-ignore
          Array.from(grandParent.childNodes).indexOf(parent) + 1;
        if (nextOffset != -1 && nextOffset != offset) {
          node = grandParent;
          offset = nextOffset;
        }
      }
    }
  } else if (node.nodeType == Node.ELEMENT_NODE) {
    offset = nextOffset;

    const nextNodeChilds = node.childNodes[offset].childNodes;
    if (
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

  const newRange = document.createRange();
  newRange.setStart(node, offset);
  newRange.collapse(true);

  const sel = window.getSelection();
  if (sel == null) return;
  sel.removeAllRanges();
  sel.addRange(newRange);
}
