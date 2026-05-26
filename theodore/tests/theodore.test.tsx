import { setTimeout as delay } from 'node:timers/promises';
import { describe, expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { convertTreeToText, Theodore, useEditorState } from '../src/index';

const renderEmoji = (emoji: string) => <span>{emoji}</span>;
type Tree = ReturnType<typeof useEditorState>['tree'];

const areTreesEqual = (firstTree: Tree, secondTree: Tree) => {
  if (firstTree.length !== secondTree.length) return false;

  return firstTree.every((subtree, subtreeIndex) => {
    const secondSubtree = secondTree[subtreeIndex];
    if (subtree.length !== secondSubtree.length) return false;

    return subtree.every((node, nodeIndex) => {
      const secondNode = secondSubtree[nodeIndex];
      const type = node.getType();

      if (type !== secondNode.getType()) return false;

      if (type === 'emoji' || type === 'text') {
        return node.getChildren() === secondNode.getChildren();
      }

      return true;
    });
  });
};

describe('theodore', () => {
  test('renders a theodore editor, type a, type b, listen to tree change. the text passed to the onTreeChange callback should be different with the current text of tree', async () => {
    const user = userEvent.setup();

    const Host = () => {
      const editorState = useEditorState(undefined, (newTree) => {
        const newText = convertTreeToText(newTree);
        const currentText = convertTreeToText(editorState.tree);
        expect(newText).not.toBe(currentText);
      });

      return (
        <Theodore
          editorState={editorState}
          renderEmoji={renderEmoji}
          data-testid="editor"
        />
      );
    };

    render(<Host />);

    const editor = screen.getByTestId('editor');
    await user.click(editor);
    await user.keyboard('a');
    await delay(100);
    await user.keyboard('b');
  });

  test('user type a, type b, listen to tree change. the current tree and new tree should not be equal.', async () => {
    const user = userEvent.setup();
    const treeChanges: Array<{
      newTree: ReturnType<typeof useEditorState>['tree'];
      currentTree: ReturnType<typeof useEditorState>['tree'];
    }> = [];

    const Host = () => {
      const editorState = useEditorState(undefined, (newTree) => {
        treeChanges.push({
          newTree,
          currentTree: editorState.tree,
        });
      });

      return (
        <Theodore
          editorState={editorState}
          renderEmoji={renderEmoji}
          data-testid="editor"
        />
      );
    };

    render(<Host />);

    const editor = screen.getByTestId('editor');
    await user.click(editor);
    await user.keyboard('a');
    await delay(100);
    await user.keyboard('b');
    await delay(100);

    expect(treeChanges.length).toBe(2);
    expect(
      areTreesEqual(treeChanges[1].newTree, treeChanges[1].currentTree),
    ).toBe(false);
  });
});
