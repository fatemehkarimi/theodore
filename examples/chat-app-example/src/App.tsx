import {
  convertTreeToText,
  Theodore,
  TheodoreHandle,
  useEditorState,
} from "theodore-js";
import "./styles.css";
import "theodore-js/style.css";
import { useRef, useState } from "react";

const userAgent =
  typeof navigator === "undefined" ? "" : navigator.userAgent.toLowerCase();
const isSafariBrowser =
  /safari/.test(userAgent) && !/chrome|chromium|android/.test(userAgent);
const isAppleDevice = /iphone|ipad|macintosh|mac os x/.test(userAgent);
const emojiAssetDirectory =
  isSafariBrowser || isAppleDevice ? "android" : "ios";
const isMobile = (() => {
  if (typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(
    ua
  );
})();

const emojis = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😊",
  "😍",
  "😘",
  "😎",
  "🤗",
  "🤔",
  "😴",
  "😇",
  "🤩",
  "🥳",
  "😢",
  "😭",
  "😡",
  "👍",
  "👏",
  "❤️",
];

const renderEmoji = (emoji: string) => {
  const unfied = nativeToUnified(emoji);
  const path =
    emojis.indexOf(emoji) != -1
      ? `/${emojiAssetDirectory}/${unfied}.webp`
      : "/no-emoji.png";
  return <img src={path} alt={emoji} width={19} height={19} />;
};

export default function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const editorState = useEditorState();

  const ref = useRef<HTMLDivElement>(null);
  const theodoreRef = useRef<TheodoreHandle | null>(null);

  const handleSend = () => {
    const content = convertTreeToText(editorState.tree);
    setMessages((currentMessages) => [...currentMessages, content.trim()]);
    theodoreRef.current?.setContent("");
  };

  const handleAddEmoji = (emoji: string) => {
    theodoreRef.current?.insertEmoji(emoji);
  };

  const emojiItems = emojis.map((emoji) => ({
    emoji,
    unified: nativeToUnified(emoji),
  }));

  return (
    <div className="chat-page">
      <ul className="chat-list">
        {messages.length === 0 ? (
          <li className="placeholder-message">No messages yet.</li>
        ) : (
          messages.map((message, index) => (
            <li key={`${message}-${index}`} className="chat-message">
              {message}
            </li>
          ))
        )}
      </ul>

      <div className="chat-footer-area">
        <footer className="chat-footer">
          <button
            type="button"
            className="emoji-toggle-button"
            onClick={() => setIsEmojiPickerOpen((isOpen) => !isOpen)}
            aria-label="Toggle emoji picker"
          >
            🙂
          </button>
          <Theodore
            editorState={editorState}
            renderEmoji={renderEmoji}
            wrapperClassName="chat-input"
            placeholder="try typing with emojis🙂..."
            defaultDirection="ltr"
            theodoreRef={theodoreRef}
            shouldSuppressFocus={isMobile && isEmojiPickerOpen}
            ref={ref}
            onClick={() => {
              if (isMobile && isEmojiPickerOpen) {
                setIsEmojiPickerOpen(false);
                setTimeout(() => {
                  ref.current?.focus();
                }, 0);
              }
            }}
          />
          <button type="button" className="send-button" onClick={handleSend}>
            Send
          </button>
        </footer>

        {isEmojiPickerOpen && (
          <div className="emoji-picker" role="group" aria-label="Emoji picker">
            {emojiItems.map(({ emoji, unified }) => (
              <button
                key={unified}
                type="button"
                className="emoji-button"
                onClick={() => handleAddEmoji(emoji)}
                title={emoji}
              >
                <img
                  className="emoji-image"
                  src={`/${emojiAssetDirectory}/${unified}.webp`}
                  alt={emoji}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const nativeToUnified = (emoji: string) => {
  const codePoints = Array.from(emoji, (char) =>
    char.codePointAt(0)?.toString(16)
  ).filter((code) => code !== undefined);
  return codePoints.join("-");
};
