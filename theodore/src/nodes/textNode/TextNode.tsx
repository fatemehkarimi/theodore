import { TextNodeDesc } from '../../types';
import { Node } from '../Node';

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

  replaceText(text: string, startPosition: number, endPosition: number) {
    const currentText = this.children ?? '';
    this.children =
      currentText.substring(0, startPosition) +
      text +
      currentText.substring(endPosition);
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

  public clone(): TextNode {
    const textNode = new TextNode(this.nodeIndex);
    if (this.children != null) textNode.setChild(this.children);
    return textNode;
  }

  render() {
    if (this.children == null) return <p></p>;
    const inner = this.children;
    return (
      <span
        data-node-index={this.getIndex()}
        key={this.getKey()}
        className="theodore_textNode"
      >
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

export { TextNode };
