import appleEmojisData from '@emoji-mart/data/sets/15/apple.json';
import Picker from '@emoji-mart/react';
import type { Selection, TheodoreHandle } from '@theodore/theodore';
import { Theodore } from '@theodore/theodore';
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './Editor.module.scss';
import { nativeToUnified } from './emoji';
import './index.css';
import React from 'react';

const renderEmoji = (emoji: string) => {
  if (emoji == '') return <></>;
  const unified = nativeToUnified(emoji);
  const path = `/img-apple-64/${unified}.png`;

  return <img src={path} width={20} height={20} />;
};

const App = () => {
  const theodoreRef = useRef<TheodoreHandle>(null);
  const selectionPreviewRef = useRef<{
    onSelectionUpdate: (newSelection: Selection) => void;
  }>(null);

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

  const handleOnSelectionChange = useCallback((newSelection: Selection) => {
    selectionPreviewRef.current?.onSelectionUpdate(newSelection);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.editorWrapper}>
        <Theodore
          className={styles.editor}
          ref={theodoreRef}
          renderEmoji={renderEmoji}
          onSelectionChange={handleOnSelectionChange}
        />
        <Picker
          data={appleEmojisData}
          set="apple"
          theme="light"
          onEmojiSelect={handleSelectEmoji}
        />
      </div>
      <SelectionPreview ref={selectionPreviewRef} />
    </div>
  );
};

const SelectionPreview = React.forwardRef<{
  onSelectionUpdate: (newSelection: Selection) => void;
}>((_, ref) => {
  const [selection, setSelection] = useState<Selection>(null);

  useImperativeHandle(ref, () => {
    return {
      onSelectionUpdate(newSelection) {
        setSelection(newSelection);
      },
    };
  }, []);

  return (
    <div className={styles.selection}>
      <span>
        start:{' '}
        {selection?.startSelection == null
          ? 'null'
          : JSON.stringify(selection?.startSelection)}
      </span>
      <span>
        end:{' '}
        {selection?.startSelection == null
          ? 'null'
          : JSON.stringify(selection?.endSelection)}
      </span>
    </div>
  );
});

export default App;
