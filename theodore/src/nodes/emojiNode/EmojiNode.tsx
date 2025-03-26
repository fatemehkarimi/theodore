import { RenderEmoji } from '../../types';
import { Node } from '../Node';
import styles from './styles.module.scss';

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
    // const clonedEmojiEl = cloneElement(emojiEl, {
    //   style: {
    //     userSelect: 'none',
    //   },
    // });
    return (
      <span
        key={this.getKey()}
        data-node-index={this.getIndex()}
        contentEditable="false"
        className={styles.emojiContainer}
      >
        {emojiEl}
      </span>
    );
  }
}

export default EmojiNode;
