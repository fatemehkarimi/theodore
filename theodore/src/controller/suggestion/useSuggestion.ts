import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { EditorSelection } from '../selection/types';
import {
  areSelectionsEqual,
  isEditorSelectionCollapsed,
} from '../selection/utils';
import { convertTreeToText } from '../useEditorState';
import type { EditorState, TheodoreHandle, Tree } from '../../types';

export type SuggestionRequest = {
  input: string;
  cursor: number;
  signal: AbortSignal;
};

export type SuggestionRequestHandler = (
  request: SuggestionRequest,
) => Promise<string | null>;

export type UseSuggestionOptions = {
  debounceMs: number;
  editorState: EditorState;
  onRequestError?: (error: unknown) => void;
  requestSuggestion: SuggestionRequestHandler;
  theodoreRef: RefObject<TheodoreHandle>;
};

const doesSelectionTargetGhostNode = (
  tree: Tree | null,
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

const doesTreeContainSuggestion = (tree: Tree | null) =>
  tree?.some((subTree) => subTree.some((node) => node.isGhost())) ?? false;

type SuggestionFlow = {
  requestMode: 'allow' | 'skip-next';
  selectionMode: 'normal' | 'ignore-programmatic';
  suggestionLifecycle: 'idle' | 'inserting' | 'visible';
};

const INITIAL_SUGGESTION_FLOW: SuggestionFlow = {
  requestMode: 'allow',
  selectionMode: 'normal',
  suggestionLifecycle: 'idle',
};

const useSuggestion = ({
  debounceMs,
  editorState,
  onRequestError,
  requestSuggestion,
  theodoreRef,
}: UseSuggestionOptions) => {
  const subscribeToEditorState = editorState.subscribe;
  const suggestionDebounce = useRef<number | null>(null);
  const suggestionAbortController = useRef<AbortController | null>(null);
  const suggestionRequestVersion = useRef(0);
  const latestTextRef = useRef('');
  const latestSelectionRef = useRef<EditorSelection>(null);
  const latestTreeRef = useRef<Tree | null>(null);
  const selectionIgnoreFrameRef = useRef<number | null>(null);
  const suggestionFlowRef = useRef<SuggestionFlow>({
    ...INITIAL_SUGGESTION_FLOW,
  });

  const [suggestion, setSuggestion] = useState<string | undefined>(undefined);

  const updateSuggestionFlow = useCallback(
    (nextFlow: Partial<SuggestionFlow>) => {
      suggestionFlowRef.current = {
        ...suggestionFlowRef.current,
        ...nextFlow,
      };
    },
    [],
  );

  const clearSuggestionDebounce = useCallback(() => {
    if (suggestionDebounce.current != null) {
      window.clearTimeout(suggestionDebounce.current);
      suggestionDebounce.current = null;
    }
  }, []);

  const abortSuggestionRequest = useCallback(() => {
    suggestionAbortController.current?.abort();
    suggestionAbortController.current = null;
  }, []);

  const isSuggestionPending = useCallback(
    () =>
      suggestionDebounce.current != null ||
      suggestionAbortController.current != null,
    [],
  );

  const cancelPendingSuggestion = useCallback(() => {
    clearSuggestionDebounce();
    abortSuggestionRequest();
    suggestionRequestVersion.current += 1;
  }, [abortSuggestionRequest, clearSuggestionDebounce]);

  const clearSelectionIgnoreFrames = useCallback(() => {
    if (selectionIgnoreFrameRef.current != null) {
      window.cancelAnimationFrame(selectionIgnoreFrameRef.current);
      selectionIgnoreFrameRef.current = null;
    }
  }, []);

  const ignoreImmediateEditorSelectionChange = useCallback(() => {
    updateSuggestionFlow({ selectionMode: 'ignore-programmatic' });
    clearSelectionIgnoreFrames();
    selectionIgnoreFrameRef.current = window.requestAnimationFrame(() => {
      selectionIgnoreFrameRef.current = window.requestAnimationFrame(() => {
        updateSuggestionFlow({ selectionMode: 'normal' });
        selectionIgnoreFrameRef.current = null;
      });
    });
  }, [clearSelectionIgnoreFrames, updateSuggestionFlow]);

  const rejectActiveSuggestion = useCallback(() => {
    cancelPendingSuggestion();
    updateSuggestionFlow({ suggestionLifecycle: 'idle' });
    theodoreRef.current?.rejectSuggestion();
    setSuggestion(undefined);
  }, [
    cancelPendingSuggestion,
    setSuggestion,
    theodoreRef,
    updateSuggestionFlow,
  ]);

  const acceptSuggestion = useCallback(
    (tree: Tree) => {
      cancelPendingSuggestion();
      updateSuggestionFlow({
        requestMode: doesTreeContainSuggestion(tree) ? 'skip-next' : 'allow',
        suggestionLifecycle: 'idle',
      });
      theodoreRef.current?.acceptSuggestion();
      setSuggestion(undefined);
    },
    [cancelPendingSuggestion, setSuggestion, theodoreRef, updateSuggestionFlow],
  );

  const handleSelectionChange = (newSelection: EditorSelection) => {
    const tree = latestTreeRef.current;
    if (isEditorSelectionCollapsed(newSelection)) {
      const node = tree
        ?.flat()
        .find((n) => n.getIndex() == newSelection?.startSelection.nodeIndex);

      if (node && node.isGhost()) return false;
    }

    if (!areSelectionsEqual(latestSelectionRef.current, newSelection)) {
      const hasInsertedSuggestion = doesTreeContainSuggestion(tree);
      const suggestionFlow = suggestionFlowRef.current;
      latestSelectionRef.current = newSelection;

      if (
        suggestionFlow.suggestionLifecycle == 'inserting' &&
        doesSelectionTargetGhostNode(tree, newSelection)
      ) {
        updateSuggestionFlow({ suggestionLifecycle: 'visible' });
      } else if (suggestionFlow.selectionMode == 'ignore-programmatic') {
        // Ignore selection churn from programmatic edits until layout settles.
      } else if (hasInsertedSuggestion) {
        updateSuggestionFlow({ suggestionLifecycle: 'visible' });
        if (isSuggestionPending()) {
          cancelPendingSuggestion();
        }
      } else if (suggestionFlow.suggestionLifecycle == 'inserting') {
        if (suggestion == undefined) {
          updateSuggestionFlow({ suggestionLifecycle: 'idle' });
          cancelPendingSuggestion();
          setSuggestion(undefined);
        }
      } else if (isSuggestionPending()) {
        cancelPendingSuggestion();
        setSuggestion(undefined);
      } else {
        updateSuggestionFlow({ suggestionLifecycle: 'idle' });
      }
    }

    return true;
  };

  const onTreeChange = (newTree: Tree) => {
    const suggestionFlow = suggestionFlowRef.current;
    const hasPendingOrActiveSuggestion =
      isSuggestionPending() ||
      suggestionFlow.suggestionLifecycle != 'idle' ||
      suggestion != undefined ||
      doesTreeContainSuggestion(latestTreeRef.current) ||
      doesTreeContainSuggestion(newTree);

    latestTreeRef.current = newTree;
    cancelPendingSuggestion();

    const newText = convertTreeToText(newTree);
    const currentText = latestTextRef.current;
    latestTextRef.current = newText;

    if (currentText != newText) {
      ignoreImmediateEditorSelectionChange();
      setSuggestion(undefined);

      if (hasPendingOrActiveSuggestion && doesTreeContainSuggestion(newTree)) {
        updateSuggestionFlow({ suggestionLifecycle: 'idle' });
        theodoreRef.current?.rejectSuggestion();
      }
    }

    if (suggestionFlow.requestMode == 'skip-next') {
      updateSuggestionFlow({ requestMode: 'allow' });
      return;
    }

    if (currentText == newText || newText == '') return;

    suggestionDebounce.current = window.setTimeout(async () => {
      suggestionDebounce.current = null;
      const selection = editorState.selectionHandle.getSelection();
      if (selection != null && isEditorSelectionCollapsed(selection)) {
        if (currentText == newText) return;

        const requestSelection = selection;
        const requestVersion = ++suggestionRequestVersion.current;
        const abortController = new AbortController();
        suggestionAbortController.current = abortController;
        latestSelectionRef.current = requestSelection;

        try {
          const suggestion = await requestSuggestion({
            input: newText,
            cursor: requestSelection.startSelection.offset,
            signal: abortController.signal,
          });

          if (
            !abortController.signal.aborted &&
            suggestionRequestVersion.current == requestVersion &&
            latestTextRef.current == newText &&
            areSelectionsEqual(
              editorState.selectionHandle.getSelection(),
              requestSelection,
            ) &&
            suggestion != null
          ) {
            updateSuggestionFlow({ suggestionLifecycle: 'inserting' });
            setSuggestion(suggestion);
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            onRequestError?.(error);
          }
        } finally {
          if (suggestionAbortController.current == abortController) {
            suggestionAbortController.current = null;
          }
        }
      }
    }, debounceMs);
  };

  useEffect(
    () =>
      subscribeToEditorState({
        onSelectionChange: handleSelectionChange,
        onTreeChange,
      }),
    [handleSelectionChange, onTreeChange, subscribeToEditorState],
  );

  useEffect(() => {
    return () => {
      cancelPendingSuggestion();
      clearSelectionIgnoreFrames();
    };
  }, [cancelPendingSuggestion, clearSelectionIgnoreFrames]);

  return {
    acceptSuggestion,
    rejectActiveSuggestion,
    suggestion,
  };
};

export { useSuggestion };
