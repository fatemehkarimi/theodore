import React from 'react';
import { Node } from '../Node';

class TextNode extends Node {
  private children: string | null = null;

  constructor(nodeIndex: number) {
    super(nodeIndex);
    this.type = 'text';
  }

  insertText(text: string, place: number) {
    this.children =
      (this.children?.substring(0, place) ?? '') +
      text +
      (this.children?.substring(place) ?? '');
  }

  setChild(text: string) {
    this.children = text;
  }

  public getKey(): string {
    return `p-${this.getIndex()}`;
  }

  public getChildren() {
    return this.children;
  }

  public getChildLength(): number {
    return this.children?.length ?? 0;
  }

  render() {
    if (this.children == null) return <p></p>;
    const inner = this.children;
    return (
      <p
        data-node-index={this.getIndex()}
        style={{display: "inline"}}
        key={this.getKey()}
      >
        {inner}
      </p>
    );
  }
}

export default TextNode;
