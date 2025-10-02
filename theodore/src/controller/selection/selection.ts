import type { onSelectionChangeFn } from "../../types";
import type { EditorNodeSelection } from './types';


export class Selection {
  private startSelection: EditorNodeSelection;
  private endSelection: EditorNodeSelection;

  constructor(
    initialSelection: EditorNodeSelection,
    private onSelectionChange?: onSelectionChangeFn
  ) {
    this.startSelection = initialSelection;
    this.endSelection = initialSelection;
  }

  public setSelection(
    newStartSelection: EditorNodeSelection,
    newEndSelection?: EditorNodeSelection
  ) {
    this.startSelection = newStartSelection;

    if (newEndSelection != undefined) this.endSelection = newEndSelection;
    else this.endSelection = newStartSelection;

    this.onSelectionChange?.(
      this.startSelection != undefined && this.endSelection != undefined
        ? {
          startSelection: { ...this.startSelection },
          endSelection: { ...this.endSelection },
        }
        : null
    );
  }

  public getSelection() {
    return this.startSelection != null && this.endSelection != null
      ? {
        startSelection: { ...this.startSelection },
        endSelection: { ...this.endSelection },
      }
      : null;
  }

  public clone() {
    return new Selection(this.startSelection, this.onSelectionChange);
  }
}
