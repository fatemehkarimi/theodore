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

  public render(children?: ReactNode | undefined): React.ReactNode {
    return (
      <p
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
