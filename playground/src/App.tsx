import appleEmojisData from '@emoji-mart/data/sets/15/apple.json';
import Picker from '@emoji-mart/react';
import type { Selection, TheodoreHandle } from '@theodore/theodore';
import {
  convertTreeToText,
  Theodore,
  useEditorState,
} from '@theodore/theodore';
import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
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
  const selectionPreviewRef = useRef<{
    onSelectionUpdate: (newSelection: Selection) => void;
  }>(null);

  const handleOnSelectionChange = useCallback((newSelection: Selection) => {
    selectionPreviewRef.current?.onSelectionUpdate(newSelection);
  }, []);

  const editorState = useEditorState(handleOnSelectionChange);
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
      <div className={styles.editorWrapper}>
        <Theodore
          editorState={editorState}
          className={styles.editor}
          ref={theodoreRef}
          renderEmoji={renderEmoji}
        />
        <Picker
          data={appleEmojisData}
          set="apple"
          theme="light"
          onEmojiSelect={handleSelectEmoji}
        />
      </div>
      <SelectionPreview ref={selectionPreviewRef} />
      <div style={{ whiteSpace: 'pre' }}>
        text: {convertTreeToText(editorState.tree)}
      </div>
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
