import React from 'react';
import { Node } from '../Node';

class BreakNode extends Node {
  constructor(nodeIndex: number) {
    super(nodeIndex);
    this.type = 'break';
  }

  public getKey() {
    return `br-${this.getIndex()}`;
  }

  public render(): React.ReactNode {
    return <br key={this.getKey()} data-node-index={this.getIndex()} />;
  }
}


export default BreakNode;