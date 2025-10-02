
export type SelectionDesc = {
  readonly nodeIndex: number;
  readonly offset: number;
};
export type EditorNodeSelection = SelectionDesc | null;
export type EditorSelection = {
  startSelection: SelectionDesc;
  endSelection: SelectionDesc;
} | null;
