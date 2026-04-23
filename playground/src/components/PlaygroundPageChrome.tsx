import type React from 'react';
import styles from '../App.module.scss';
import Github from '../icons/Github';

type PlaygroundPageChromeProps = {
  children: React.ReactNode;
};

const PlaygroundPageChrome: React.FC<PlaygroundPageChromeProps> = ({
  children,
}) => {
  return (
    <div className={styles.mainPhone}>
      <div className={styles.backgroundImageEffect} />
      <div className={styles.header}>
        <div className={styles.logoWithTitle}>
          <img
            src="/playground/logo.png"
            alt="Theodore"
            className={styles.character}
            draggable={false}
          />
          <div className={styles.title}>Theodore</div>
        </div>
        <a
          href="https://github.com/fatemehkarimi/theodore"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
          aria-label="Open repository on GitHub"
        >
          <Github size={28} color="#000" />
        </a>
      </div>
      <div className={styles.content}>
        <div className={styles.wrapper}>{children}</div>
      </div>
    </div>
  );
};

export { PlaygroundPageChrome };
