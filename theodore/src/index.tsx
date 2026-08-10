export { Theodore, type TheodoreProps } from './components/Theodore';
export type {
  TheodoreHandle,
  SuggestionHintProps,
  EditorState,
  EditorStateListener,
  Tree as TheodoreTree,
  onSelectionChangeFn,
  onTreeChangeFn,
} from './types';
export type { EditorSelection } from './controller/selection/types';
export {
  convertTreeToText,
  useEditorState,
  isEditorEmpty,
} from './controller/useEditorState';
export { isEditorSelectionCollapsed } from './controller/selection/utils';
export {
  useSuggestion,
  type SuggestionRequest,
  type SuggestionRequestHandler,
  type UseSuggestionOptions,
} from './controller/suggestion/useSuggestion';
