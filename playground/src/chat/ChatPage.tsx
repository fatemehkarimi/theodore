import { useCallback, useEffect, useRef, useState } from 'react';
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
import styles from '../App.module.scss';
import { AnimatedPicker, type PickerEmoji } from '../components/AnimatedPicker';
import { PlaygroundPageChrome } from '../components/PlaygroundPageChrome';
import { isMobileDevice, renderAppleEmoji } from '../utils';
import { SelectionPreview, type SelectionPreviewHandle } from '../components/SelectionPreview';
import { Slogan } from '../components/Slogan';
import { BlurInput } from '../BlurInput';
import EmojiOutlined from '../icons/EmojiOutlined';
import '../index.css';
import { getAutoComplete } from './autocomplete';
import { getChatResponse } from './index';

type Message = {
  sender: 'you' | 'friend';
  message: string;
};

const ChatPage = () => {
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
    <PlaygroundPageChrome>
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
          renderEmoji={renderAppleEmoji}
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
    </PlaygroundPageChrome>
  );
};

export default ChatPage;
