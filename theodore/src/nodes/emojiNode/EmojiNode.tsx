import { cloneElement } from 'react';
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
    const emojiEl = this.renderEmoji(this.emoji);
    const clonedEmojiEl = cloneElement(emojiEl, {
      style: {
        userSelect: 'none',
      },
    });
    return (
      <span
        key={this.getKey()}
        data-node-index={this.getIndex()}
        contentEditable="false"
        style={{ display: 'inline-block' }}
      >
        {clonedEmojiEl}
      </span>
    );
  }
}

export default EmojiNode;
