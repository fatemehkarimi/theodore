import { renderEmoji } from '../../emoji/renderEmoji';
import { Node } from '../Node';

class EmojiNode extends Node {
  constructor(
    nodeIndex: number,
    private emoji: string,
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
    return renderEmoji(this.emoji, 'small', this.getIndex(), this.getKey());
  }
}

export default EmojiNode;
