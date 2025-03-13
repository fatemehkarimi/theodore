import React from 'react';
import { RenderEmoji } from '../../types';
import { Node } from '../Node';

class EmojiNode extends Node {
  constructor(
    nodeIndex: number,
    private emoji: string,
    private renderEmoji: RenderEmoji,
  ) {
    super(nodeIndex);
    this.type = 'emoji';
  }

  public getKey() {
    return `emoji-${this.getIndex()}`;
  }

  public getChildLength(): number {
    return this.emoji.length;
  }

  public render() {
    const element = this.renderEmoji(this.emoji);
    return React.cloneElement(element, {
      key: this.getKey(),
      'data-node-index': this.getIndex(),
    });
  }
}

export default EmojiNode;
