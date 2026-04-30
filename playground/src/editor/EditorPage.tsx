import { useCallback, useRef, useState } from 'react';
import {
  convertTreeToText,
  EditorSelection,
  Theodore,
  TheodoreHandle,
  useEditorState,
} from 'theodore-js';
import 'theodore-js/style.css';
import styles from '../App.module.scss';
import { AnimatedPicker, type PickerEmoji } from '../components/AnimatedPicker';
import { PlaygroundPageChrome } from '../components/PlaygroundPageChrome';
import { isMobileDevice, renderAppleEmoji } from '../utils';
import { SelectionPreview } from '../components/SelectionPreview';
import type { SelectionPreviewHandle } from '../components/SelectionPreview';
import { Slogan } from '../components/Slogan';
import { BlurInput } from '../BlurInput';
import EmojiOutlined from '../icons/EmojiOutlined';
import '../index.css';

const EditorPage = () => {
  const theodoreRef = useRef<TheodoreHandle>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionPreviewRef = useRef<SelectionPreviewHandle>(null);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const handleOnSelectionChange = useCallback(
    (newSelection: EditorSelection) => {
      selectionPreviewRef.current?.onSelectionUpdate(newSelection);
    },
    [],
  );

  const editorState = useEditorState(handleOnSelectionChange);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const togglePicker = useCallback(() => {
    cancelHide();
    setIsPickerVisible((open) => !open);
  }, [cancelHide]);

  const handleSelectEmoji = (emoji: PickerEmoji) => {
    if (theodoreRef.current != null) {
      theodoreRef.current.insertEmoji(emoji.native);
    }
  };

  return (
    <main data-testid="editor-page">
      <PlaygroundPageChrome>
        <Slogan />
        <div className={styles.theodoreWrapper}>
          <Theodore
            theodoreRef={theodoreRef}
            editorState={editorState}
            renderEmoji={renderAppleEmoji}
            className={styles.theodore}
            placeholderClassName={styles.theodorePlaceholder}
            placeholder="write something and surprise the world..."
            maxLines={isMobileDevice() ? 5 : 7}
            ref={editorRef}
            shouldSuppressFocus={isMobileDevice() && isPickerVisible}
            data-testid="editor"
          />
          <div className={styles.controller}>
            <EmojiOutlined
              className={styles.emojiIcon}
              size={30}
              color={`rgba(93, 91, 80, 1)`}
              onClick={togglePicker}
              data-testid="emoji-picker"
            />
            <AnimatedPicker
              isVisible={isPickerVisible}
              onSelectEmoji={handleSelectEmoji}
            />
          </div>
        </div>
        <div
          className={styles.theodoreStateInfo}
          data-testid="plain-text-section"
        >
          <BlurInput label="Plain Text">
            <p
              className={styles.textPreviewWrapper}
              data-testid="plain-text-preview"
            >
              {convertTreeToText(editorState.tree)}
            </p>
          </BlurInput>
        </div>
        <SelectionPreview ref={selectionPreviewRef} />
      </PlaygroundPageChrome>
    </main>
  );
};

export default EditorPage;
