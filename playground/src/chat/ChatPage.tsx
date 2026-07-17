import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type SuggestionRequest,
  convertTreeToText,
  Theodore,
  type TheodoreHandle,
  useSuggestion,
  useEditorState,
} from 'theodore-js';
import 'theodore-js/style.css';
import styles from '../App.module.scss';
import { AnimatedPicker, type PickerEmoji } from '../components/AnimatedPicker';
import { PlaygroundPageChrome } from '../components/PlaygroundPageChrome';
import { isMobileDevice, renderAppleEmoji } from '../utils';
import {
  SelectionPreview,
  type SelectionPreviewHandle,
} from '../components/SelectionPreview';
import { Slogan } from '../components/Slogan';
import { BlurInput } from '../BlurInput';
import EmojiOutlined from '../icons/EmojiOutlined';
import SendIcon from '../icons/Send';
import '../index.css';
import { getAutoComplete } from './autocomplete';
import { getChatResponse } from './index';

const AUTO_COMPLETE_MESSAGE_HISTORY_LIMIT = 7;

type ChatMessage = {
  sender: 'you' | 'friend';
  message: string;
};

const ChatPage = () => {
  const theodoreRef = useRef<TheodoreHandle>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLUListElement>(null);
  const selectionPreviewRef = useRef<SelectionPreviewHandle>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const isMobile = isMobileDevice();

  const editorState = useEditorState();
  const subscribeToEditorState = editorState.subscribe;

  useEffect(
    () =>
      subscribeToEditorState({
        onSelectionChange: (selection) => {
          selectionPreviewRef.current?.onSelectionUpdate(selection);
        },
      }),
    [subscribeToEditorState],
  );

  const requestSuggestion = useCallback(
    ({ input, cursor, signal }: SuggestionRequest) =>
      getAutoComplete(
        input,
        messages
          .slice(-AUTO_COMPLETE_MESSAGE_HISTORY_LIMIT)
          .map((message) => `${message.sender}: ${message.message}`),
        cursor,
        signal,
      ),
    [messages],
  );

  const { acceptSuggestion, rejectActiveSuggestion, suggestion } =
    useSuggestion({
      debounceMs: 2000,
      editorState,
      requestSuggestion,
      theodoreRef,
    });

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

  useEffect(() => {
    return () => {
      cancelHide();
    };
  }, [cancelHide]);

  const handleSelectEmoji = (emoji: PickerEmoji) => {
    theodoreRef.current?.insertEmoji(emoji.native);
  };

  const handleSendMessage = useCallback(() => {
    rejectActiveSuggestion();

    const content = convertTreeToText(editorState.tree);
    if (content.trim() === '') return;

    const userMessage: ChatMessage = { sender: 'you', message: content };
    const loadingMessage: ChatMessage = { sender: 'friend', message: '...' };
    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, loadingMessage]);
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
  }, [editorState.tree, messages, rejectActiveSuggestion]);

  const handleAcceptSuggestion = useCallback(() => {
    acceptSuggestion(editorState.tree);
  }, [acceptSuggestion, editorState.tree]);

  useEffect(() => {
    const handleKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      const hasSuggestion = suggestion != null && suggestion !== '';
      if (
        !isMobile &&
        keyboardEvent.key == 'Enter' &&
        !keyboardEvent.shiftKey
      ) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopImmediatePropagation();
        handleSendMessage();
      } else if (isMobile && keyboardEvent.key == 'Enter' && hasSuggestion) {
        keyboardEvent.stopImmediatePropagation();
        keyboardEvent.preventDefault();
        handleAcceptSuggestion();
      } else if (keyboardEvent.key == 'Tab') {
        keyboardEvent.stopImmediatePropagation();
        keyboardEvent.preventDefault();
        handleAcceptSuggestion();
      } else if (keyboardEvent.key == 'Escape') {
        keyboardEvent.stopImmediatePropagation();
        keyboardEvent.preventDefault();
        rejectActiveSuggestion();
      }
    };
    const editor = editorRef.current;
    editor?.addEventListener('keydown', handleKeyDown);

    return () => editor?.removeEventListener('keydown', handleKeyDown);
  }, [
    handleAcceptSuggestion,
    handleSendMessage,
    isMobile,
    rejectActiveSuggestion,
    suggestion,
  ]);

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
          maxLines={isMobile ? 5 : 7}
          ref={editorRef}
          shouldSuppressFocus={isMobile && isPickerVisible}
          suggestion={suggestion}
          // suggestionHint={FancyTab}
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
          {isMobile ? (
            <button
              type="button"
              className={styles.mobileSendButton}
              aria-label="Send message"
              onClick={handleSendMessage}
            >
              <SendIcon className={styles.mobileSendIcon} />
            </button>
          ) : null}
        </div>
      </div>
      <div className={styles.theodoreStateInfo}>
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
  );
};

export default ChatPage;
