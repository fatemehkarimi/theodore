'use client';

import { Smile } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Theodore, type TheodoreHandle, useEditorState } from 'theodore-js';
import { isMobile, nativeToUnified } from '@/utils';
import './TextInputWithEmojiPicker.css';

const emojis = [
  '😀',
  '😂',
  '😍',
  '🥰',
  '😭',
  '👍',
  '❤️',
  '✨',
  '🎉',
  '🤡',
  '😱',
  '🫡',
];

function emojiImagePath(emoji: string) {
  const filename = emojis.includes(emoji) ? nativeToUnified(emoji) : 'no-emoji';

  return `/labubu/${filename}.png`;
}

export function TextInputWithEmojiPicker() {
  const editorState = useEditorState();
  const theodoreRef = useRef<TheodoreHandle>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerToggleRef = useRef<HTMLButtonElement>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  useEffect(() => {
    if (!isPickerOpen) return;

    const closePickerOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (pickerRef.current?.contains(target)) return;
      if (pickerToggleRef.current?.contains(target)) return;

      setIsPickerOpen(false);
    };

    document.addEventListener('pointerdown', closePickerOnOutsideClick);
    return () =>
      document.removeEventListener('pointerdown', closePickerOnOutsideClick);
  }, [isPickerOpen]);

  const renderEmoji = useCallback((emoji: string) => {
    return (
      <img
        src={emojiImagePath(emoji)}
        alt={emoji}
        className="emoji-picker-example__rendered-emoji"
      />
    );
  }, []);

  return (
    <div className="emoji-picker-example not-prose">
      <div className="emoji-picker-example__section">
        <label
          htmlFor="emoji-picker-input"
          className="emoji-picker-example__label"
        >
          Message
        </label>
        <div className="emoji-picker-example__editor-row">
          <Theodore
            id="emoji-picker-input"
            editorState={editorState}
            renderEmoji={renderEmoji}
            theodoreRef={theodoreRef}
            placeholder="Write a message"
            className="emoji-picker-example__input"
            placeholderClassName="emoji-picker-example__placeholder"
            maxLines={2}
            shouldSuppressFocus={isMobileDevice && isPickerOpen}
          />
          <button
            ref={pickerToggleRef}
            type="button"
            className={`emoji-picker-example__toggle${isPickerOpen ? ' emoji-picker-example__toggle--open' : ''}`}
            aria-label={
              isPickerOpen ? 'Close emoji picker' : 'Open emoji picker'
            }
            aria-controls="emoji-picker-panel"
            aria-expanded={isPickerOpen}
            onClick={() => {
              setIsPickerOpen((isOpen) => !isOpen);
            }}
          >
            <Smile aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={pickerRef}
        id="emoji-picker-panel"
        className={`emoji-picker-example__section emoji-picker-example__picker-section${isPickerOpen ? ' emoji-picker-example__picker-section--open' : ''}`}
      >
        <p className="emoji-picker-example__label">Pick an emoji</p>
        <div className="emoji-picker-example__grid" aria-label="Emoji picker">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Insert ${emoji}`}
              className="emoji-picker-example__button"
              onClick={() => theodoreRef.current?.insertEmoji(emoji)}
            >
              <img
                src={emojiImagePath(emoji)}
                alt=""
                className="emoji-picker-example__picker-emoji"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
