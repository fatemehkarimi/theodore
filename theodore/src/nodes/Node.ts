import type { ReactNode } from 'react';

export type NodeType = 'text' | 'emoji' | 'paragraph' | 'ghostText';
export type NodeStyle = 'ghost';
export class Node {
  protected nodeIndex: number;
  protected type: NodeType = 'text';
  protected style: NodeStyle[] = [];

  constructor(nodeIndex: number) {
    this.nodeIndex = nodeIndex;
  }

  static fromDescriptor(desc: Object): Node {
    void desc;
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
    void children;
    throw new Error('not implemented');
  }

  public getChildLength(): number {
    throw new Error('not implemented');
  }

  public toDescriptor(): Object {
    throw new Error('not implemented');
  }

  public isTextNode(): boolean {
    return ['text'].includes(this.getType());
  }

  public getChildren(): string | null {
    throw new Error('not implemented');
  }

  public clone(): Node {
    throw new Error('not implemented');
  }

  public isGhost(): boolean {
    return ['ghostText'].includes(this.getType());
  }

  public getContent(): string {
    return this.getChildren() ?? '';
  }
}
