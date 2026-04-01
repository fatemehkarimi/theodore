export { Theodore, type TheodoreProps } from './component/Theodore';
export type {
  TheodoreHandle,
  EditorState,
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
