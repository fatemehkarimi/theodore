import appleEmojisData from '@emoji-mart/data/sets/15/apple.json';
import Picker from '@emoji-mart/react';
import clsx from 'clsx';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  convertTreeToText,
  EditorSelection,
  isEditorSelectionCollapsed,
  Theodore,
  TheodoreHandle,
  TheodoreTree,
  useEditorState,
} from 'theodore-js';
import 'theodore-js/style.css';
import styles from './App.module.scss';
import { BlurInput } from './BlurInput';
import { nativeToUnified } from './emoji';
import { useDelayedValue } from './hooks/useDelayedValue';
import { useShowTransition } from './hooks/useShowtransition';
import EmojiOutlined from './icons/EmojiOutlined';
import Github from './icons/Github';
import './index.css';
import { getAutoComplete } from './autocomplete';
import { getChatResponse } from './chat';

const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const ua =
    navigator.userAgent ||
    (navigator as any).vendor ||
    (window as any).opera ||
    '';

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    ua,
  );
};

const renderEmoji = (emoji: string) => {
  if (emoji == '') return <></>;
  const unified = nativeToUnified(emoji);
  const path = `/img-apple-64/${unified}.png`;

  return <img src={path} width={22} height={22} alt={emoji} />;
};

type Message = {
  sender: 'you' | 'friend';
  message: string;
};

type PickerEmoji = {
  id: string;
  keywords: string[];
  shortcodes: string;
  name: string;
  native: string;
  unified: string;
};

/* eslint-disable no-unused-vars */
type SelectionPreviewHandle = {
  onSelectionUpdate(newSelection: EditorSelection): void;
};

type AnimatedPickerProps = {
  isVisible: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onSelectEmoji?(emoji: PickerEmoji): void;
};
/* eslint-enable no-unused-vars */

const App = () => {
  const theodoreRef = useRef<TheodoreHandle>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLUListElement>(null);
  const selectionPreviewRef = useRef<SelectionPreviewHandle>(null);
  const hideTimerRef = useRef<number | null>(null);
  const autoCompleteDebounce = useRef<NodeJS.Timeout | null>(null);

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleOnSelectionChange = useCallback(
    (newSelection: EditorSelection) => {
      selectionPreviewRef.current?.onSelectionUpdate(newSelection);
    },
    [],
  );

  const handleTreeChange = async (newTree: TheodoreTree) => {
    if (autoCompleteDebounce.current != null)
      clearTimeout(autoCompleteDebounce.current);

    autoCompleteDebounce.current = setTimeout(async () => {
      const selection = editorState.selectionHandle.getSelection();
      if (isEditorSelectionCollapsed(selection)) {
        const pureText = convertTreeToText(newTree);
        await getAutoComplete(
          pureText,
          messages.slice(-7).map((msg) => `${msg.sender}: ${msg.message}`),
          selection?.startSelection.offset ?? pureText.length,
        );
      }
    }, 1000);
  };
  const editorState = useEditorState(handleOnSelectionChange, handleTreeChange);

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

  const handleSelectEmoji = (emoji: PickerEmoji) => {
    if (theodoreRef.current != null) {
      theodoreRef.current.insertEmoji(emoji.native);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key == 'Enter') {
        keyboardEvent.preventDefault();
        keyboardEvent.stopImmediatePropagation();
        const content = convertTreeToText(editorState.tree);
        if (content.trim() === '') return;

        const nextMessages = [
          ...messages,
          { sender: 'you' as const, message: content },
        ];
        setMessages([...nextMessages, { sender: 'friend', message: '...' }]);
        theodoreRef.current?.setContent('');

        void (async () => {
          let response: string | null = null;
          try {
            response = await getChatResponse(
              nextMessages.map((msg) => `${msg.sender}: ${msg.message}`),
            );
          } catch (error) {
            console.error('chat request failed', error);
          }

          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const loadingIndex = updatedMessages.findIndex(
              (msg) => msg.sender === 'friend' && msg.message === '...',
            );
            if (loadingIndex >= 0) {
              updatedMessages[loadingIndex] = {
                sender: 'friend',
                message: response ?? 'Sorry, something went wrong.',
              };
            }
            return updatedMessages;
          });
        })();
      }
    };
    editorRef.current?.addEventListener('keydown', handleKeyDown);

    return () =>
      editorRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [editorState.tree, messages]);

  useEffect(() => {
    const list = messageListRef.current;
    if (list == null) return;
    list.scrollTop = list.scrollHeight;
  }, [messages]);

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
        <div className={styles.wrapper}>
          <Slogan />
          <ul
            ref={messageListRef}
            className={styles.messageList}
            aria-label="Sent messages"
          >
            {messages.length === 0 ? (
              <li>
                <p className={styles.messageListEmpty}>No messages yet.</p>
              </li>
            ) : (
              messages.map((msg, index) => (
                <li key={index} className={styles.messageItem}>
                  <span className={styles.messageSender}>{msg.sender}:</span>
                  <span className={styles.messageText}>{msg.message}</span>
                </li>
              ))
            )}
          </ul>
          <div className={styles.theodoreWrapper}>
            <Theodore
              theodoreRef={theodoreRef}
              editorState={editorState}
              renderEmoji={renderEmoji}
              className={styles.theodore}
              placeholderClassName={styles.theodorePlaceholder}
              placeholder="write something and surprise the world..."
              maxLines={isMobileDevice() ? 5 : 7}
              ref={editorRef}
              shouldSuppressFocus={isMobileDevice() && isPickerVisible}
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
      <h2>Theodore is a text input that replaces emoji characters with</h2>
      <h2>custom images, ensuring consistent display across all browsers</h2>
    </div>
  );
};

const AnimatedPicker: React.FC<AnimatedPickerProps> = ({
  isVisible,
  onEnter,
  onLeave,
  onSelectEmoji,
}) => {
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

const SelectionPreview = React.forwardRef<SelectionPreviewHandle>((_, ref) => {
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
