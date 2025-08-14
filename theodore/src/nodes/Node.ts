import type { ReactNode } from 'react';

type NodeType = 'text' | 'emoji' | 'paragraph';
type NodeStyle = 'bold' | 'italic' | 'underline' | 'strikethrough';
export class Node {
  protected type: NodeType = 'text';
  protected style: NodeStyle[] = [];

  constructor(protected nodeIndex: number) {}
  static fromDescriptor(desc: Object): Node {
    throw new Error('not implemented');
  }

  public getIndex(): number {
    return this.nodeIndex;
  }

  public getType(): NodeType {
    return this.type;
  }

  public getKey(): string {
    throw new Error('not implemented');
  }

  public render(children?: ReactNode | undefined): ReactNode {
    throw new Error('not implemented');
  }

  public getChildLength(): number {
    throw new Error('not implemented');
  }

  public toDescriptor(): Object {
    throw new Error('not implemented');
  }

  public isTextNode(): boolean {
    return ['text', 'mention'].includes(this.getType());
  }
}
