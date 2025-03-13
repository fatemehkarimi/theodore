import appleEmojisData from '@emoji-mart/data/sets/15/apple.json';
import Picker from '@emoji-mart/react';
import type { TheodoreHandle } from '@theodore/theodore';
import { Theodore } from '@theodore/theodore';
import { useRef } from 'react';
import styles from './Editor.module.scss';
import { nativeToUnified } from './emoji';
import './index.css';

const renderEmoji = (emoji: string) => {
  if (emoji == '') return <></>;
  const unified = nativeToUnified(emoji);
  const path = `/img-apple-64/${unified}.png`;

  return <img src={path} width={20} height={20} />;
};

const App = () => {
  const theodoreRef = useRef<TheodoreHandle>(null);

  const handleSelectEmoji = (emoji: {
    id: string;
    keywords: string[];
    shortcodes: string;
    name: string;
    native: string;
    unified: string;
  }) => {
    if (theodoreRef.current != null) {
      theodoreRef.current.insertEmoji(emoji.native);
    }
  };

  return (
    <div className={styles.container}>
      <Picker
        data={appleEmojisData}
        set="apple"
        theme="light"
        onEmojiSelect={handleSelectEmoji}
      />
      <Theodore
        className={styles.editor}
        ref={theodoreRef}
        renderEmoji={renderEmoji}
      />
    </div>
  );
};

export default App;
