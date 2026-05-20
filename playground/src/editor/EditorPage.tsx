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

const copyTextToClipboard = async (text: string) => {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {}
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  textarea.style.setProperty('-webkit-user-select', 'text');
  textarea.style.userSelect = 'text';

  const selection = document.getSelection();
  const originalRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
    if (originalRange && selection) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
  }
};

const EditorPage = () => {
  const theodoreRef = useRef<TheodoreHandle>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionPreviewRef = useRef<SelectionPreviewHandle>(null);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const plainText = convertTreeToText(editorState.tree);

  const handleCopy = async () => {
    await copyTextToClipboard(plainText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
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
            <button
              type="button"
              className={styles.copyButton}
              onClick={handleCopy}
              data-testid="copy-editor-text"
              aria-label="Copy editor text"
            >
              {copied ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className={styles.copyButtonIcon}
                >
                  <path d="M9.2 16.2 4.9 11.9l-1.4 1.4 5.7 5.7L21 7.2l-1.4-1.4z" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className={styles.copyButtonIcon}
                >
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
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
              {plainText}
            </p>
          </BlurInput>
        </div>
        <SelectionPreview ref={selectionPreviewRef} />
      </PlaygroundPageChrome>
    </main>
  );
};

export default EditorPage;
