import { RenderEmoji } from '../../types';
import { Node } from '../Node';

class EmojiNode extends Node {
  private readonly emoji: string;
  private readonly renderEmoji: RenderEmoji;

  constructor(nodeIndex: number, emoji: string, renderEmoji: RenderEmoji) {
    super(nodeIndex);
    this.emoji = emoji;
    this.renderEmoji = renderEmoji;
    this.type = 'emoji';
  }

  public getKey() {
    return `emoji-${this.getIndex()}`;
  }

  public getChildLength(): number {
    return this.emoji.length;
  }

  public getChildren(): string | null {
    return this.emoji;
  }

  public clone(): EmojiNode {
    const emojiNode = new EmojiNode(
      this.nodeIndex,
      this.emoji,
      this.renderEmoji,
    );
    return emojiNode;
  }

  public render() {
    const emojiEl = this.renderEmoji(this.emoji);
    return (
      <span
        key={this.getKey()}
        data-node-index={this.getIndex()}
        className="theodore_emojiNode"
      >
        {emojiEl}
      </span>
    );
  }
}

export default EmojiNode;
