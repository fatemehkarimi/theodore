import type { ReactNode } from 'react';
import { Node } from '../Node';

class GhostTextNode extends Node {
  private children: string;
  constructor(nodeIndex: number, ghostText: string) {
    super(nodeIndex);
    this.children = ghostText;
    this.type = 'ghostText';
  }

  public getChildLength(): number {
    return this.children.length;
  }

  public getKey(): string {
    return `g-${this.getIndex()}`;
  }

  public getChildren(): string {
    return this.children;
  }

  public appendText(text: string) {
    this.children += text;
  }

  public clone(): Node {
    const ghostNode = new GhostTextNode(this.nodeIndex, this.children);
    return ghostNode;
  }

  public getContent(): string {
    return '';
  }

  public render(
    _children?: ReactNode | undefined,
    acceptSuggestion?: () => void,
  ) {
    return (
      <span
        data-node-index={this.getIndex()}
        key={this.getKey()}
        className="theodore_ghostText"
        onClick={acceptSuggestion}
      >
        {this.children}
      </span>
    );
  }
}

export { GhostTextNode };
