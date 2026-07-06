import { RenderEmoji } from '../../types';
import EmojiNode from '../emojiNode/EmojiNode';

class GhostEmojiNode extends EmojiNode {
  constructor(nodeIndex: number, emoji: string, renderEmoji: RenderEmoji) {
    super(nodeIndex, emoji, renderEmoji);
    this.type = 'ghostEmoji';
  }

  public getKey(): string {
    return `g-emoji-${this.getIndex()}`;
  }

  public clone(): GhostEmojiNode {
    const ghostEmojiNode = new GhostEmojiNode(
      this.nodeIndex,
      this.emoji,
      this.renderEmoji,
    );
    return ghostEmojiNode;
  }

  public getContent(): string {
    return '';
  }

  public toEmojiNode(): EmojiNode {
    return new EmojiNode(this.nodeIndex, this.emoji, this.renderEmoji);
  }

  public render() {
    const emojiEl = this.renderEmoji(this.emoji);
    return (
      <span
        key={this.getKey()}
        data-node-index={this.getIndex()}
        className="theodore_emojiNode theodore_ghostEmoji"
      >
        {emojiEl}
      </span>
    );
  }
}

export { GhostEmojiNode };
