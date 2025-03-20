import appleEmojisData from '@emoji-mart/data/sets/15/apple.json';
import Picker from '@emoji-mart/react';
import type { Selection, TheodoreHandle } from '@theodore/theodore';
import { Theodore } from '@theodore/theodore';
import { useCallback, useMemo, useRef, useState } from 'react';
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
  const [editorSelection, setEditorSelection] = useState<Selection>(null);

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

  const handleOnSelectionChange = useCallback(
    (newSelection: Selection) => {
      setEditorSelection(newSelection);
    },
    [setEditorSelection],
  );

  const listeners = useMemo(() => {
    return {
      onSelectionChange: handleOnSelectionChange,
    };
  }, [handleOnSelectionChange]);

  return (
    <div className={styles.container}>
      <div className={styles.editorWrapper}>
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
          listeners={listeners}
        />
      </div>
      <div className={styles.selection}>{JSON.stringify(editorSelection)}</div>
    </div>
  );
};

export default App;
