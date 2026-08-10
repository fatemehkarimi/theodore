import { setTimeout as delay } from 'node:timers/promises';
import { describe, expect, it, test } from '@rstest/core';
import { useEffect, useRef } from 'react';
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

const useTreeChangeListener = (
  editorState: ReturnType<typeof useEditorState>,
  onTreeChange: (tree: Tree) => void,
) => {
  const subscribeToEditorState = editorState.subscribe;
  const onTreeChangeRef = useRef(onTreeChange);
  onTreeChangeRef.current = onTreeChange;

  useEffect(
    () =>
      subscribeToEditorState({
        onTreeChange: (tree) => onTreeChangeRef.current(tree),
      }),
    [subscribeToEditorState],
  );
};

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
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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

  it('should remove text node when user types a Unicode character consisting of multiple UTF-16 code units (𐐀) in input, then presses Backspace', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = () => {
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
        treeChanges.push(newTree);
      });

      return <Theodore editorState={editorState} data-testid="editor" />;
    };

    render(<Host />);

    const editor = screen.getByTestId('editor');
    await user.click(editor);
    await user.keyboard('𐐀');

    await waitFor(() => {
      const tree = treeChanges[treeChanges.length - 1];
      if (tree == null) throw new Error('Missing tree update');

      expect(tree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
      ]);
      expect(tree[0][1].getChildren()).toBe('𐐀');
    });

    await user.keyboard('{Backspace}');

    await waitFor(() => {
      const tree = treeChanges[treeChanges.length - 1];
      if (tree == null) throw new Error('Missing tree update');

      expect(tree).toHaveLength(1);
      expect(tree[0].map((node) => node.getType())).toEqual(['paragraph']);
    });
  });

  it('should remove text node when user types a Unicode character consisting of multiple UTF-16 code units (𐐀) in input, moves cursor left, then presses Delete', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = () => {
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
        treeChanges.push(newTree);
      });

      return <Theodore editorState={editorState} data-testid="editor" />;
    };

    render(<Host />);

    const editor = screen.getByTestId('editor');
    await user.click(editor);
    await user.keyboard('𐐀');

    await waitFor(() => {
      const tree = treeChanges[treeChanges.length - 1];
      if (tree == null) throw new Error('Missing tree update');

      expect(tree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
      ]);
      expect(tree[0][1].getChildren()).toBe('𐐀');
    });

    await user.keyboard('{ArrowLeft}{Delete}');

    await waitFor(() => {
      const tree = treeChanges[treeChanges.length - 1];
      if (tree == null) throw new Error('Missing tree update');

      expect(tree).toHaveLength(1);
      expect(tree[0].map((node) => node.getType())).toEqual(['paragraph']);
    });
  });
});

describe('suggestion', () => {
  it('should add suggestion node to the tree', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = ({ suggestion }: { suggestion?: string }) => {
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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

  it('should break a suggestion with emojis into ghost text and ghost emoji nodes', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = ({ suggestion }: { suggestion?: string }) => {
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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
    rerender(<Host suggestion="thank you ❤️❤️❤️" />);

    await waitFor(() => {
      const newTree = treeChanges[treeChanges.length - 1];
      if (newTree == null) throw new Error('Missing tree update');

      expect(newTree).toHaveLength(1);
      expect(newTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
        'ghostText',
        'ghostEmoji',
        'ghostEmoji',
        'ghostEmoji',
      ]);
      expect(newTree[0][1].getChildren()).toBe('abc');
      expect(newTree[0][2].getChildren()).toBe('thank you ');
      expect(newTree[0][3].getChildren()).toBe('❤️');
      expect(newTree[0].every((node) => node.getContent() != '❤️')).toBe(true);
    });
  });

  it('should convert ghost emoji nodes to emoji nodes when accepting a suggestion with emojis', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = ({ suggestion }: { suggestion?: string }) => {
      const theodoreRef = useRef<TheodoreHandle>(null);
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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
    rerender(<Host suggestion="thank you ❤️❤️❤️" />);

    await waitFor(() => {
      const suggestedTree = treeChanges[treeChanges.length - 1];
      if (suggestedTree == null) throw new Error('Missing tree update');

      expect(suggestedTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
        'ghostText',
        'ghostEmoji',
        'ghostEmoji',
        'ghostEmoji',
      ]);
    });

    await user.click(screen.getByRole('button', { name: 'accept' }));

    await waitFor(() => {
      const acceptedTree = treeChanges[treeChanges.length - 1];
      if (acceptedTree == null) throw new Error('Missing tree update');

      expect(acceptedTree).toHaveLength(1);
      expect(acceptedTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
        'emoji',
        'emoji',
        'emoji',
      ]);
      expect(acceptedTree[0][1].getChildren()).toBe('abcthank you ');
      expect(acceptedTree[0][2].getChildren()).toBe('❤️');
      expect(convertTreeToText(acceptedTree)).toBe('abcthank you ❤️❤️❤️');
    });
  });

  it('should restore the tree with undo after accepting a suggestion with emojis', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = ({ suggestion }: { suggestion?: string }) => {
      const theodoreRef = useRef<TheodoreHandle>(null);
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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
    rerender(<Host suggestion="thank you ❤️❤️" />);

    await waitFor(() => {
      const suggestedTree = treeChanges[treeChanges.length - 1];
      if (suggestedTree == null) throw new Error('Missing tree update');
      expect(suggestedTree[0].some((node) => node.isGhost())).toBe(true);
    });

    await user.click(screen.getByRole('button', { name: 'accept' }));

    await waitFor(() => {
      const acceptedTree = treeChanges[treeChanges.length - 1];
      if (acceptedTree == null) throw new Error('Missing tree update');
      expect(convertTreeToText(acceptedTree)).toBe('abcthank you ❤️❤️');
    });

    await user.click(editor);
    await user.keyboard('{Control>}z{/Control}');

    await waitFor(() => {
      const undoneTree = treeChanges[treeChanges.length - 1];
      if (undoneTree == null) throw new Error('Missing tree update');

      expect(undoneTree).toHaveLength(1);
      expect(undoneTree[0].map((node) => node.getType())).toEqual([
        'paragraph',
        'text',
      ]);
      expect(undoneTree[0][1].getChildren()).toBe('abc');
    });
  });

  it('should remove all ghost nodes when rejecting a suggestion with emojis', async () => {
    const user = userEvent.setup();
    const treeChanges: Tree[] = [];

    const Host = ({ suggestion }: { suggestion?: string }) => {
      const theodoreRef = useRef<TheodoreHandle>(null);
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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
    rerender(<Host suggestion="thank you ❤️❤️❤️" />);

    await waitFor(() => {
      const suggestedTree = treeChanges[treeChanges.length - 1];
      if (suggestedTree == null) throw new Error('Missing tree update');
      expect(suggestedTree[0].some((node) => node.isGhost())).toBe(true);
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
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
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

describe('optional emoji rendering/ renderEmoji prop is not provided', () => {
  const renderEditorWithoutEmojiRenderer = () => {
    const treeChanges: Tree[] = [];

    const Host = () => {
      const theodoreRef = useRef<TheodoreHandle>(null);
      const editorState = useEditorState();
      useTreeChangeListener(editorState, (newTree) => {
        treeChanges.push(newTree);
      });

      return (
        <>
          <Theodore
            editorState={editorState}
            theodoreRef={theodoreRef}
            data-testid="editor"
          />
          <button
            type="button"
            onClick={() => theodoreRef.current?.insertEmoji('😀')}
          >
            insert grinning emoji
          </button>
          <button
            type="button"
            onClick={() => theodoreRef.current?.insertEmoji('😂')}
          >
            insert laughing emoji
          </button>
          <button
            type="button"
            onClick={() => theodoreRef.current?.insertEmoji('👗')}
          >
            insert dress emoji
          </button>
        </>
      );
    };

    render(<Host />);

    return treeChanges;
  };

  const expectSingleTextNode = (treeChanges: Tree[], text: string) => {
    const tree = treeChanges[treeChanges.length - 1];
    if (tree == null) throw new Error('Missing tree update');

    expect(tree).toHaveLength(1);
    expect(tree[0]).toHaveLength(2);
    expect(tree[0].map((node) => node.getType())).toEqual([
      'paragraph',
      'text',
    ]);
    expect(tree[0][1].getChildren()).toBe(text);
    expect(convertTreeToText(tree)).toBe(text);
  };

  it('should render single emoji in text node', async () => {
    const user = userEvent.setup();
    const treeChanges = renderEditorWithoutEmojiRenderer();

    await user.click(screen.getByTestId('editor'));
    await user.click(
      screen.getByRole('button', { name: 'insert grinning emoji' }),
    );

    await waitFor(() => expectSingleTextNode(treeChanges, '😀'));
  });

  it('should render multiple emojis in a single text node', async () => {
    const user = userEvent.setup();
    const treeChanges = renderEditorWithoutEmojiRenderer();

    await user.click(screen.getByTestId('editor'));
    await user.click(
      screen.getByRole('button', { name: 'insert grinning emoji' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'insert laughing emoji' }),
    );

    await waitFor(() => expectSingleTextNode(treeChanges, '😀😂'));
  });

  it('should render emoji after normal text in a single text node', async () => {
    const user = userEvent.setup();
    const treeChanges = renderEditorWithoutEmojiRenderer();
    const editor = screen.getByTestId('editor');

    await user.click(editor);
    await user.keyboard('hello');
    await user.click(
      screen.getByRole('button', { name: 'insert grinning emoji' }),
    );

    await waitFor(() => expectSingleTextNode(treeChanges, 'hello😀'));
  });

  it('should render emoji in the middle of normal text in a single text node', async () => {
    const user = userEvent.setup();
    const treeChanges = renderEditorWithoutEmojiRenderer();
    const editor = screen.getByTestId('editor');

    await user.click(editor);
    await user.keyboard('he');
    await user.click(
      screen.getByRole('button', { name: 'insert grinning emoji' }),
    );
    await user.click(editor);
    await user.keyboard('llo');

    await waitFor(() => expectSingleTextNode(treeChanges, 'he😀llo'));
  });

  it('should remove emoji character(👗) after pressing single backspace', async () => {
    const user = userEvent.setup();
    const treeChanges = renderEditorWithoutEmojiRenderer();
    const editor = screen.getByTestId('editor');

    await user.click(editor);
    await user.click(
      screen.getByRole('button', { name: 'insert dress emoji' }),
    );
    await waitFor(() => expectSingleTextNode(treeChanges, '👗'));

    await user.click(editor);
    await user.keyboard('{Backspace}');

    await waitFor(() => {
      const tree = treeChanges[treeChanges.length - 1];
      if (tree == null) throw new Error('Missing tree update');

      expect(tree).toHaveLength(1);
      expect(tree[0].map((node) => node.getType())).toEqual(['paragraph']);
    });
  });
});
