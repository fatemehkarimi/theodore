import type { Optional } from '../../types';
import type { EditorSelection } from '../selection/types';
import type { HistoryStack, HistoryCommand } from './types';

export class History {
  private stack: HistoryStack = [];
  private transactionId: number = 0;

  constructor(private getSelection: () => EditorSelection) {}

  assignTransactionId() {
    return this.transactionId;
  }

  commit() {
    this.transactionId += 1;
  }

  pop() {
    return this.stack.pop();
  }

  push(
    newHistory: Optional<Omit<HistoryCommand, 'transactionId'>, 'selection'>[],
  ) {
    const transactionId = this.assignTransactionId();
    this.stack.push(
      ...newHistory.map((h) => ({
        ...h,
        transactionId,
        selection: h.selection != undefined ? h.selection : this.getSelection(),
      })),
    );
  }

  pushAndCommit(
    newHistory: Optional<Omit<HistoryCommand, 'transactionId'>, 'selection'>[],
  ) {
    this.push(newHistory);
    this.commit();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  setHistoryStack(historyStack: HistoryStack) {
    this.stack = historyStack;
  }

  getHistoryStack() {
    return this.stack;
  }

  setTransactionId(transactionId: number) {
    this.transactionId = transactionId;
  }

  clone() {
    const newHistory = new History(this.getSelection);
    newHistory.setHistoryStack([...this.stack]);
    newHistory.setTransactionId(this.transactionId);
    return newHistory;
  }
}
