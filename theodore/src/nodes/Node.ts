import type { TeactNode } from '../../../../lib/teact/teact';

type NodeType = 'text' | 'emoji' | 'mention';
type NodeStyle = 'bold' | 'italic' | 'underline' | 'strikethrough';
export class Node {
  protected type: NodeType = 'text';
  protected style: NodeStyle[] = [];

  constructor(protected nodeIndex: number) {}

  public getIndex(): number {
    return this.nodeIndex;
  }

  public getType(): NodeType {
    return this.type;
  }

  public getKey(): string {
    throw new Error('not implemented');
  }

  public render(): TeactNode {
    throw new Error('not implemented');
  }

  public getChildLength(): number {
    throw new Error('not implemented');
  }
}
