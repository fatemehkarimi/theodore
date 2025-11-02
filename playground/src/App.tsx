import appleEmojisData from '@emoji-mart/data/sets/15/apple.json';
import Picker from '@emoji-mart/react';
import clsx from 'clsx';
import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  convertTreeToText,
  EditorSelection,
  Theodore,
  TheodoreHandle,
  useEditorState,
} from 'theodore-js';
import styles from './App.module.scss';
import { BlurInput } from './BlurInput';
import { nativeToUnified } from './emoji';
import { useDelayedValue } from './hooks/useDelayedValue';
import { useShowTransition } from './hooks/useShowtransition';
import EmojiOutlined from './icons/EmojiOutlined';
import Github from './icons/Github';
import './index.css';

const renderEmoji = (emoji: string) => {
  if (emoji == '') return <></>;
  const unified = nativeToUnified(emoji);
  const path = `/img-apple-64/${unified}.png`;

  return <img src={path} width={22} height={22} alt={emoji} />;
};

const App = () => {
  const theodoreRef = useRef<TheodoreHandle>(null);
  const selectionPreviewRef = useRef<{
    onSelectionUpdate: (newSelection: EditorSelection) => void;
  }>(null);
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

  const showPicker = useCallback(() => {
    cancelHide();
    setIsPickerVisible(true);
  }, [cancelHide]);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimerRef.current = window.setTimeout(() => {
      setIsPickerVisible(false);
      hideTimerRef.current = null;
    }, 300);
  }, [cancelHide]);

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
          <div className={styles.title}>THEOdore</div>
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
        <div className={styles.wrapper}>
          <Slogan />
          <div className={styles.theodoreWrapper}>
            <Theodore
              ref={theodoreRef}
              editorState={editorState}
              renderEmoji={renderEmoji}
              className={styles.theodore}
              placeholderClassName={styles.theodorePlaceholder}
              placeholder="write something and surprise the world..."
              maxLines={7}
            />
            <div className={styles.controller}>
              <EmojiOutlined
                className={styles.emojiIcon}
                size={30}
                color={`rgba(93, 91, 80, 1)`}
                onMouseEnter={showPicker}
                onMouseLeave={scheduleHide}
              />
              <AnimatedPicker
                isVisible={isPickerVisible}
                onEnter={showPicker}
                onLeave={scheduleHide}
                onSelectEmoji={handleSelectEmoji}
              />
            </div>
          </div>
          <div className={styles.theodoreStateInfo}>
            <BlurInput label="Plain Text">
              <p className={styles.textPreviewWrapper}>
                {convertTreeToText(editorState.tree)}
              </p>
            </BlurInput>
          </div>
          <SelectionPreview ref={selectionPreviewRef} />
        </div>
      </div>
    </div>
  );
};

const Slogan: React.FC = () => {
  return (
    <div className={styles.sloganWrapper}>
      <h2>THEOodore is a text input that replaces emoji characters with</h2>
      <h2>custom images, ensuring consistent display across all browsers</h2>
    </div>
  );
};

const AnimatedPicker: React.FC<{
  isVisible: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onSelectEmoji?: (emoji: {
    id: string;
    keywords: string[];
    shortcodes: string;
    name: string;
    native: string;
    unified: string;
  }) => void;
}> = ({ isVisible, onEnter, onLeave, onSelectEmoji }) => {
  const { shouldRender, transitionClassNames } = useShowTransition(
    {
      open: styles.DesktopAnimationActive,
      notOpen: styles.DesktopAnimationNotActive,
    },
    isVisible,
    200,
  );

  const asyncTransitionClassNames = useDelayedValue<string>(
    transitionClassNames,
    0,
    '',
  );

  if (!shouldRender) return null;

  return (
    <div
      className={clsx(styles.picker, asyncTransitionClassNames)}
      onMouseEnter={isVisible ? onEnter : undefined}
      onMouseLeave={isVisible ? onLeave : undefined}
    >
      <Picker
        data={appleEmojisData}
        set="apple"
        theme="light"
        onEmojiSelect={onSelectEmoji}
        perLine={8}
        emojiSize={28}
      />
    </div>
  );
};

const SelectionPreview = React.forwardRef<{
  onSelectionUpdate: (newSelection: EditorSelection) => void;
}>((_, ref) => {
  const [selection, setSelection] = useState<EditorSelection | null>(null);
  useImperativeHandle(ref, () => {
    return {
      onSelectionUpdate: (newSelection: EditorSelection) => {
        setSelection(newSelection);
      },
    };
  }, []);
  return (
    <div className={styles.selectionPreview}>
      <BlurInput label="Start Selection">
        <div className={styles.selectionInfo}>
          <p>Node Index: {selection?.startSelection.nodeIndex ?? 'null'}</p>
          <p>Offset: {selection?.startSelection.offset ?? 'null'}</p>
        </div>
      </BlurInput>
      <BlurInput label="Start Selection">
        <div className={styles.selectionInfo}>
          <p>Node Index: {selection?.endSelection.nodeIndex ?? 'null'}</p>
          <p>Offset: {selection?.endSelection.offset ?? 'null'}</p>
        </div>
      </BlurInput>
    </div>
  );
});
export default App;
