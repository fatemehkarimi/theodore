import type React from 'react';
import styles from '../App.module.scss';

const Slogan: React.FC = () => {
  return (
    <div className={styles.sloganWrapper}>
      <h2>Theodore is a text input that replaces emoji characters with</h2>
      <h2>custom images, ensuring consistent display across all browsers</h2>
    </div>
  );
};

export { Slogan };
