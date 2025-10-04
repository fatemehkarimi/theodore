import type { ReactNode } from 'react';
import React from 'react';
import { Node } from '../Node';
import styles from './styles.module.scss';

class ParagraphNode extends Node {
  constructor(nodeIndex: number) {
    super(nodeIndex);
    this.type = 'paragraph';
  }

  public getKey() {
    return `br-${this.getIndex()}`;
  }

  public getChildren(): string | null {
    return '';
  }

  public clone(): ParagraphNode {
    const paragraphNode = new ParagraphNode(this.nodeIndex);
    return paragraphNode;
  }

  public render(
    children?: ReactNode | undefined,
    dir?: 'ltr' | 'rtl',
  ): React.ReactNode {
    return (
      <p
        dir={dir}
        key={this.getKey()}
        data-node-index={this.getIndex()}
        className={styles.paragraphContainer}
      >
        {children ?? <br />}
      </p>
    );
  }
}

export default ParagraphNode;
