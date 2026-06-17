import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {
  convertTreeToText,
  type EditorSelection,
  type EditorState,
  isEditorSelectionCollapsed,
  type TheodoreHandle,
  type TheodoreTree,
} from 'theodore-js';
import { getAutoComplete } from './autocomplete';

const AUTO_COMPLETE_DEBOUNCE_MS = 1000;
const AUTO_COMPLETE_MESSAGE_HISTORY_LIMIT = 7;

export type ChatMessage = {
  sender: 'you' | 'friend';
  message: string;
};

const areEditorSelectionsEqual = (
  firstSelection: EditorSelection,
  secondSelection: EditorSelection,
) => {
  if (firstSelection == null || secondSelection == null) {
    return firstSelection == secondSelection;
  }

  return (
    firstSelection.startSelection.nodeIndex ==
      secondSelection.startSelection.nodeIndex &&
    firstSelection.startSelection.offset ==
      secondSelection.startSelection.offset &&
    firstSelection.endSelection.nodeIndex ==
      secondSelection.endSelection.nodeIndex &&
    firstSelection.endSelection.offset == secondSelection.endSelection.offset
  );
};

const doesSelectionTargetGhostNode = (
  tree: TheodoreTree | null,
  selection: EditorSelection,
) => {
  if (tree == null || selection == null) return false;

  return tree.flat().some((node) => {
    if (!node.isGhost()) return false;

    return (
      node.getIndex() == selection.startSelection.nodeIndex ||
      node.getIndex() == selection.endSelection.nodeIndex
    );
  });
};

const doesTreeContainSuggestion = (tree: TheodoreTree | null) =>
  tree?.some((subTree) => subTree.some((node) => node.isGhost())) ?? false;

const removeSuggestionNodesFromTree = (tree: TheodoreTree): TheodoreTree =>
  tree.map((subTree) => subTree.filter((node) => !node.isGhost()));

type UseChatAutocompleteArgs = {
  messages: ChatMessage[];
  theodoreRef: RefObject<TheodoreHandle>;
};

type AutoCompleteFlow = {
  requestMode: 'allow' | 'skip-next';
  selectionMode: 'normal' | 'ignore-programmatic';
  suggestionLifecycle: 'idle' | 'inserting' | 'visible';
};

const INITIAL_AUTO_COMPLETE_FLOW: AutoCompleteFlow = {
  requestMode: 'allow',
  selectionMode: 'normal',
  suggestionLifecycle: 'idle',
};

const useChatAutocomplete = ({
  messages,
  theodoreRef,
}: UseChatAutocompleteArgs) => {
  const editorStateRef = useRef<EditorState | null>(null);
  const autoCompleteDebounce = useRef<number | null>(null);
  const autoCompleteAbortController = useRef<AbortController | null>(null);
  const autoCompleteRequestVersion = useRef(0);
  const latestTextRef = useRef('');
  const latestSelectionRef = useRef<EditorSelection>(null);
  const latestTreeRef = useRef<TheodoreTree | null>(null);
  const messagesRef = useRef(messages);
  const suggestionRef = useRef<string | undefined>(undefined);
  const selectionIgnoreFrameRef = useRef<number | null>(null);
  const autoCompleteFlowRef = useRef<AutoCompleteFlow>({
    ...INITIAL_AUTO_COMPLETE_FLOW,
  });

  const [suggestion, setSuggestionState] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const setEditorState = useCallback((editorState: EditorState) => {
    editorStateRef.current = editorState;
  }, []);

  const setSuggestion = useCallback((nextSuggestion: string | undefined) => {
    suggestionRef.current = nextSuggestion;
    setSuggestionState(nextSuggestion);
  }, []);

  const updateAutoCompleteFlow = useCallback(
    (nextFlow: Partial<AutoCompleteFlow>) => {
      autoCompleteFlowRef.current = {
        ...autoCompleteFlowRef.current,
        ...nextFlow,
      };
    },
    [],
  );

  const clearAutoCompleteDebounce = useCallback(() => {
    if (autoCompleteDebounce.current != null) {
      window.clearTimeout(autoCompleteDebounce.current);
      autoCompleteDebounce.current = null;
    }
  }, []);

  const abortAutoCompleteRequest = useCallback(() => {
    autoCompleteAbortController.current?.abort();
    autoCompleteAbortController.current = null;
  }, []);

  const isAutoCompletePending = useCallback(
    () =>
      autoCompleteDebounce.current != null ||
      autoCompleteAbortController.current != null,
    [],
  );

  const cancelPendingAutoComplete = useCallback(() => {
    clearAutoCompleteDebounce();
    abortAutoCompleteRequest();
    autoCompleteRequestVersion.current += 1;
  }, [abortAutoCompleteRequest, clearAutoCompleteDebounce]);

  const clearSelectionIgnoreFrames = useCallback(() => {
    if (selectionIgnoreFrameRef.current != null) {
      window.cancelAnimationFrame(selectionIgnoreFrameRef.current);
      selectionIgnoreFrameRef.current = null;
    }
  }, []);

  const ignoreImmediateEditorSelectionChange = useCallback(() => {
    updateAutoCompleteFlow({ selectionMode: 'ignore-programmatic' });
    clearSelectionIgnoreFrames();
    selectionIgnoreFrameRef.current = window.requestAnimationFrame(() => {
      selectionIgnoreFrameRef.current = window.requestAnimationFrame(() => {
        updateAutoCompleteFlow({ selectionMode: 'normal' });
        selectionIgnoreFrameRef.current = null;
      });
    });
  }, [clearSelectionIgnoreFrames, updateAutoCompleteFlow]);

  const rejectActiveSuggestion = useCallback(() => {
    cancelPendingAutoComplete();
    updateAutoCompleteFlow({ suggestionLifecycle: 'idle' });
    theodoreRef.current?.rejectSuggestion();
    setSuggestion(undefined);
  }, [
    cancelPendingAutoComplete,
    setSuggestion,
    theodoreRef,
    updateAutoCompleteFlow,
  ]);

  const acceptSuggestion = useCallback(
    (tree: TheodoreTree) => {
      cancelPendingAutoComplete();
      updateAutoCompleteFlow({
        requestMode: doesTreeContainSuggestion(tree) ? 'skip-next' : 'allow',
        suggestionLifecycle: 'idle',
      });
      theodoreRef.current?.acceptSuggestion();
      setSuggestion(undefined);
    },
    [
      cancelPendingAutoComplete,
      setSuggestion,
      theodoreRef,
      updateAutoCompleteFlow,
    ],
  );

  const handleSelectionChange = useCallback(
    (newSelection: EditorSelection) => {
      const tree = latestTreeRef.current;
      if (isEditorSelectionCollapsed(newSelection)) {
        const node = tree
          ?.flat()
          .find((n) => n.getIndex() == newSelection?.startSelection.nodeIndex);

        if (node && node.isGhost()) return false;
      }

      if (!areEditorSelectionsEqual(latestSelectionRef.current, newSelection)) {
        const hasInsertedSuggestion = doesTreeContainSuggestion(tree);
        const autoCompleteFlow = autoCompleteFlowRef.current;
        latestSelectionRef.current = newSelection;

        if (
          autoCompleteFlow.suggestionLifecycle == 'inserting' &&
          doesSelectionTargetGhostNode(tree, newSelection)
        ) {
          updateAutoCompleteFlow({ suggestionLifecycle: 'visible' });
        } else if (autoCompleteFlow.selectionMode == 'ignore-programmatic') {
          // Ignore selection churn from programmatic edits until layout settles.
        } else if (hasInsertedSuggestion) {
          updateAutoCompleteFlow({ suggestionLifecycle: 'visible' });
          if (isAutoCompletePending()) {
            cancelPendingAutoComplete();
          }
        } else if (autoCompleteFlow.suggestionLifecycle == 'inserting') {
          if (suggestionRef.current == undefined) {
            updateAutoCompleteFlow({ suggestionLifecycle: 'idle' });
            cancelPendingAutoComplete();
            setSuggestion(undefined);
          }
        } else if (isAutoCompletePending()) {
          cancelPendingAutoComplete();
          setSuggestion(undefined);
        } else {
          updateAutoCompleteFlow({ suggestionLifecycle: 'idle' });
        }
      }

      return true;
    },
    [
      cancelPendingAutoComplete,
      isAutoCompletePending,
      setSuggestion,
      updateAutoCompleteFlow,
    ],
  );

  const handleTreeChange = useCallback(
    (newTree: TheodoreTree) => {
      const autoCompleteFlow = autoCompleteFlowRef.current;
      const hasPendingOrActiveSuggestion =
        isAutoCompletePending() ||
        autoCompleteFlow.suggestionLifecycle != 'idle' ||
        suggestionRef.current != undefined ||
        doesTreeContainSuggestion(latestTreeRef.current) ||
        doesTreeContainSuggestion(newTree);

      latestTreeRef.current = newTree;
      cancelPendingAutoComplete();

      const newText = convertTreeToText(newTree);
      const currentText = latestTextRef.current;
      latestTextRef.current = newText;

      if (currentText != newText) {
        ignoreImmediateEditorSelectionChange();
        setSuggestion(undefined);

        if (
          hasPendingOrActiveSuggestion &&
          doesTreeContainSuggestion(newTree)
        ) {
          updateAutoCompleteFlow({ suggestionLifecycle: 'idle' });
          editorStateRef.current?.setTree(
            removeSuggestionNodesFromTree(newTree),
          );
        }
      }

      if (autoCompleteFlow.requestMode == 'skip-next') {
        updateAutoCompleteFlow({ requestMode: 'allow' });
        return;
      }

      if (currentText == newText || newText == '') return;

      autoCompleteDebounce.current = window.setTimeout(async () => {
        autoCompleteDebounce.current = null;
        const editorState = editorStateRef.current;
        const selection = editorState?.selectionHandle.getSelection();
        if (selection != null && isEditorSelectionCollapsed(selection)) {
          if (currentText == newText) return;

          const requestSelection = selection;
          const requestVersion = ++autoCompleteRequestVersion.current;
          const abortController = new AbortController();
          autoCompleteAbortController.current = abortController;
          latestSelectionRef.current = requestSelection;

          try {
            const suggestion = await getAutoComplete(
              newText,
              messagesRef.current
                .slice(-AUTO_COMPLETE_MESSAGE_HISTORY_LIMIT)
                .map((msg) => `${msg.sender}: ${msg.message}`),
              requestSelection.startSelection.offset,
              abortController.signal,
            );

            if (
              !abortController.signal.aborted &&
              autoCompleteRequestVersion.current == requestVersion &&
              latestTextRef.current == newText &&
              areEditorSelectionsEqual(
                editorStateRef.current?.selectionHandle.getSelection() ?? null,
                requestSelection,
              ) &&
              suggestion != null
            ) {
              updateAutoCompleteFlow({ suggestionLifecycle: 'inserting' });
              setSuggestion(suggestion);
            }
          } finally {
            if (autoCompleteAbortController.current == abortController) {
              autoCompleteAbortController.current = null;
            }
          }
        }
      }, AUTO_COMPLETE_DEBOUNCE_MS);
    },
    [
      cancelPendingAutoComplete,
      ignoreImmediateEditorSelectionChange,
      isAutoCompletePending,
      setSuggestion,
      updateAutoCompleteFlow,
    ],
  );

  useEffect(() => {
    return () => {
      cancelPendingAutoComplete();
      clearSelectionIgnoreFrames();
    };
  }, [cancelPendingAutoComplete, clearSelectionIgnoreFrames]);

  return {
    acceptSuggestion,
    handleSelectionChange,
    handleTreeChange,
    rejectActiveSuggestion,
    setEditorState,
    suggestion,
  };
};

export { useChatAutocomplete };
