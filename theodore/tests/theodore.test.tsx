import { setTimeout as delay } from 'node:timers/promises';
import { describe, expect, it, test } from '@rstest/core';
import { useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  convertTreeToText,
  Theodore,
  type TheodoreHandle,
  useEditorState,
} from '../src/index';

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

describe('autocomplete', () => {
  it('should add suggestion node to the tree', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = ({ suggestion }: { suggestion?: string }) => {
      const editorState = useEditorState(undefined, (newTree) => {
        treeChanges.push(newTree);
      });

      return (
        <Theodore
          editorState={editorState}
          renderEmoji={renderEmoji}
          suggestion={suggestion}
          data-testid="editor"
        />
      );
    };

    const { rerender } = render(<Host />);

    const editor = screen.getByTestId('editor');
    await user.click(editor);
    await user.keyboard('abc');
    rerender(<Host suggestion="def" />);

    await waitFor(() => {
      const newTree = treeChanges[treeChanges.length - 1];
      if (newTree == null) throw new Error('Missing tree update');

      expect(newTree).toHaveLength(1);
      expect(newTree[0]).toHaveLength(3);
      expect(newTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
        'ghostText',
      ]);
      expect(newTree[0][1].getChildren()).toBe('abc');
      expect(newTree[0][2].getChildren()).toBe('def');
    });
  });

  it('should append the suggestion to the text node when prev node is a text node and accepting suggestions.', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = ({ suggestion }: { suggestion?: string }) => {
      const theodoreRef = useRef<TheodoreHandle>(null);
      const editorState = useEditorState(undefined, (newTree) => {
        treeChanges.push(newTree);
      });

      return (
        <>
          <Theodore
            editorState={editorState}
            renderEmoji={renderEmoji}
            suggestion={suggestion}
            theodoreRef={theodoreRef}
            data-testid="editor"
          />
          <button
            type="button"
            onClick={() => theodoreRef.current?.acceptSuggestion()}
          >
            accept
          </button>
        </>
      );
    };

    const { rerender } = render(<Host />);

    const editor = screen.getByTestId('editor');
    await user.click(editor);
    await user.keyboard('abc');
    rerender(<Host suggestion="def" />);

    await waitFor(() => {
      const suggestedTree = treeChanges[treeChanges.length - 1];
      if (suggestedTree == null) throw new Error('Missing tree update');

      expect(suggestedTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
        'ghostText',
      ]);
    });

    await user.click(screen.getByRole('button', { name: 'accept' }));

    await waitFor(() => {
      const acceptedTree = treeChanges[treeChanges.length - 1];
      if (acceptedTree == null) throw new Error('Missing tree update');

      expect(acceptedTree).toHaveLength(1);
      expect(acceptedTree[0]).toHaveLength(2);
      expect(acceptedTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
      ]);
      expect(acceptedTree[0][1].getChildren()).toBe('abcdef');
    });
  });

  it('should remove the suggestion node when rejecting suggestions', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = ({ suggestion }: { suggestion?: string }) => {
      const theodoreRef = useRef<TheodoreHandle>(null);
      const editorState = useEditorState(undefined, (newTree) => {
        treeChanges.push(newTree);
      });

      return (
        <>
          <Theodore
            editorState={editorState}
            renderEmoji={renderEmoji}
            suggestion={suggestion}
            theodoreRef={theodoreRef}
            data-testid="editor"
          />
          <button
            type="button"
            onClick={() => theodoreRef.current?.rejectSuggestion()}
          >
            reject
          </button>
        </>
      );
    };

    const { rerender } = render(<Host />);

    const editor = screen.getByTestId('editor');
    await user.click(editor);
    await user.keyboard('abc');
    rerender(<Host suggestion="def" />);

    await waitFor(() => {
      const suggestedTree = treeChanges[treeChanges.length - 1];
      if (suggestedTree == null) throw new Error('Missing tree update');

      expect(suggestedTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
        'ghostText',
      ]);
    });

    await user.click(screen.getByRole('button', { name: 'reject' }));

    await waitFor(() => {
      const rejectedTree = treeChanges[treeChanges.length - 1];
      if (rejectedTree == null) throw new Error('Missing tree update');

      expect(rejectedTree).toHaveLength(1);
      expect(rejectedTree[0]).toHaveLength(2);
      expect(rejectedTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
      ]);
      expect(rejectedTree[0][1].getChildren()).toBe('abc');
    });
  });

  it('should create a new text node for suggestion when prev node is an emoji and accepting suggestion', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];
    const renderEmojiAsImage = (emoji: string) => <img alt={emoji} />;

    const Host = ({ suggestion }: { suggestion?: string }) => {
      const theodoreRef = useRef<TheodoreHandle>(null);
      const editorState = useEditorState(undefined, (newTree) => {
        treeChanges.push(newTree);
      });

      return (
        <>
          <Theodore
            editorState={editorState}
            renderEmoji={renderEmojiAsImage}
            suggestion={suggestion}
            theodoreRef={theodoreRef}
            data-testid="editor"
          />
          <button
            type="button"
            onClick={() => theodoreRef.current?.insertEmoji('😂')}
          >
            😂
          </button>
          <button
            type="button"
            onClick={() => theodoreRef.current?.acceptSuggestion()}
          >
            accept
          </button>
        </>
      );
    };

    const { rerender } = render(<Host />);

    await user.click(screen.getByRole('button', { name: '😂' }));
    rerender(<Host suggestion="def" />);

    await waitFor(() => {
      const suggestedTree = treeChanges[treeChanges.length - 1];
      if (suggestedTree == null) throw new Error('Missing tree update');

      expect(suggestedTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'emoji',
        'ghostText',
      ]);
      expect(suggestedTree[0][1].getChildren()).toBe('😂');
      expect(suggestedTree[0][2].getChildren()).toBe('def');
    });

    await user.click(screen.getByRole('button', { name: 'accept' }));

    await waitFor(() => {
      const acceptedTree = treeChanges[treeChanges.length - 1];
      if (acceptedTree == null) throw new Error('Missing tree update');

      expect(acceptedTree).toHaveLength(1);
      expect(acceptedTree[0]).toHaveLength(3);
      expect(acceptedTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'emoji',
        'text',
      ]);
      expect(acceptedTree[0][1].getChildren()).toBe('😂');
      expect(acceptedTree[0][2].getChildren()).toBe('def');
    });
  });
});
