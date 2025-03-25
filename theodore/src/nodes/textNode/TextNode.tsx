import React from 'react';
import { Node } from '../Node';
import { TextNodeDesc } from '../../types';

class TextNode extends Node {
  private children: string | null = null;

  constructor(nodeIndex: number) {
    super(nodeIndex);
    this.type = 'text';
  }

  static fromDescriptor(desc: TextNodeDesc): TextNode {
    const node = new TextNode(desc.nodeIndex);
    if (desc.text != null) node.setChild(desc.text);
    return node;
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
      <span data-node-index={this.getIndex()} key={this.getKey()}>
        {inner}
      </span>
    );
  }

  public toDescriptor(): TextNodeDesc {
    return {
      type: 'text',
      text: this.children,
      nodeIndex: this.getIndex(),
    };
  }
}

export default TextNode;
