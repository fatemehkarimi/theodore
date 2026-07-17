'use client';

import { Check, Copy } from 'lucide-react';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import {
  convertTreeToText,
  type SuggestionRequest,
  type SuggestionHintProps,
  Theodore,
  TheodoreHandle,
  useEditorState,
  useSuggestion,
} from 'theodore-js';
import 'theodore-js/style.css';
import { getAutoComplete } from '../autocomplete';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { isMobile, nativeToUnified } from '../utils';

const SelectedEmojis = [
  { name: '😀', path: '1f600' },
  { name: '😂', path: '1f602' },
  { name: '❤️', path: '2764-fe0f' },
  { name: '😭', path: '1f62d' },
  { name: '👍', path: '1f44d' },
  { name: '🥰', path: '1f970' },
  { name: '✨', path: '2728' },
  { name: '🎉', path: '1f389' },
  { name: '🫡', path: '1fae1' },
  { name: '😍', path: '1f60d' },
  { name: '🤡', path: '1f921' },
  { name: '😱', path: '1f631' },
];

const emojiSets = {
  ios: {
    name: 'iOS Emojis',
    dirname: 'ios',
    type: 'webp',
  },
  android: {
    name: 'Android Emojis',
    dirname: 'android',
    type: 'webp',
  },
  labubu: {
    name: 'Labubu Emojis',
    dirname: 'labubu',
    type: 'png',
  },
  animated: {
    name: 'Animated Emojis',
    dirname: 'animated',
    type: 'gif',
  },
};

const showcaseExamples = [
  {
    text: "we're gonna launch it ",
    suggestion: 'this week 🎉',
  },
  {
    text: 'I want to build a diet app ',
    suggestion: 'that has dark theme',
  },
  {
    text: 'I have some exciting ',
    suggestion: 'news to share',
  },
  {
    text: 'thank you so much ',
    suggestion: 'for your help',
  },
  {
    text: 'I hope you have ',
    suggestion: 'an amzing day ✨',
  },
  {
    text: 'you such an idiot!',
    suggestion: '🤡🤡🤡',
  },
];

const SHOWCASE_SUGGESTION_DELAY_MS = 1000;
const SHOWCASE_CYCLE_MS = 5000;

const DemoSuggestionHint: React.FC<SuggestionHintProps> = ({ direction }) => {
  const isMobileDevice = isMobile();

  return (
    <span
      data-suggestion-hint="true"
      contentEditable={false}
      dir={direction}
      aria-label={
        isMobileDevice ? 'Press Enter to accept' : 'Press Tab to accept'
      }
      onMouseDown={(event) => event.preventDefault()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        marginInlineStart: '8px',
        padding: '3px 8px',
        border: '1px solid #ddd6fe',
        borderRadius: '999px',
        background: '#faf5ff',
        color: '#6d28d9',
        fontSize: '10px',
        fontWeight: 700,
        lineHeight: 1,
        boxShadow: '0 1px 2px rgb(76 29 149 / 8%)',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '18px',
          height: '16px',
          padding: '2px 4px',
          borderRadius: '4px',
          background: '#ede9fe',
        }}
      >
        {isMobileDevice ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{
              transform: direction === 'rtl' ? 'scaleX(-1)' : undefined,
              transformOrigin: 'center',
            }}
          >
            <path
              d="M8 7L3 12L8 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 12H15C18.314 12 21 9.314 21 6V5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          'Tab'
        )}
      </span>
      accept
    </span>
  );
};

const copyTextToClipboard = (text: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      navigator.clipboard.writeText(text);
      return;
    } catch {}
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';

  const selection = document.getSelection();
  const originalRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  document.body.appendChild(textarea);
  textarea.select();

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

export function DemoV2() {
  const editorState = useEditorState();
  const [copied, setCopied] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isShowcaseActive, setIsShowcaseActive] = useState(true);
  const [showcaseSuggestion, setShowcaseSuggestion] = useState<
    string | undefined
  >(undefined);

  const [selectedSet, setSelectedSet] =
    useState<keyof typeof emojiSets>('labubu');

  const theodoreRef = useRef<TheodoreHandle>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const isShowcaseActiveRef = useRef(true);
  const showcaseSuggestionRef = useRef<string | undefined>(undefined);
  const stopShowcaseRef = useRef<(acceptCurrentSuggestion?: boolean) => void>(
    () => {},
  );
  const latestContentRef = useRef(convertTreeToText(editorState.tree));
  latestContentRef.current = convertTreeToText(editorState.tree);

  useEffect(() => {
    setIsMobileDevice(isMobile());
  }, []);

  const requestSuggestion = useCallback(
    ({ input, cursor, signal }: SuggestionRequest) => {
      if (isShowcaseActiveRef.current) return Promise.resolve(null);
      return getAutoComplete(input, cursor, signal);
    },
    [],
  );

  const {
    acceptSuggestion,
    rejectActiveSuggestion,
    suggestion: backendSuggestion,
  } = useSuggestion({
    debounceMs: 2000,
    editorState,
    requestSuggestion,
    theodoreRef,
  });

  const suggestion = isShowcaseActive ? showcaseSuggestion : backendSuggestion;

  useEffect(() => {
    let exampleIndex = 0;
    let suggestionTimer: number | null = null;
    let nextExampleTimer: number | null = null;
    const isMobileDevice = isMobile();

    isShowcaseActiveRef.current = true;

    const clearTimers = () => {
      if (suggestionTimer != null) {
        window.clearTimeout(suggestionTimer);
        suggestionTimer = null;
      }
      if (nextExampleTimer != null) {
        window.clearTimeout(nextExampleTimer);
        nextExampleTimer = null;
      }
    };

    const showExample = () => {
      if (!isShowcaseActiveRef.current) return;

      const example = showcaseExamples[exampleIndex];
      showcaseSuggestionRef.current = undefined;
      setShowcaseSuggestion(undefined);
      theodoreRef.current?.rejectSuggestion();
      theodoreRef.current?.setContent(example.text);

      suggestionTimer = window.setTimeout(() => {
        if (!isShowcaseActiveRef.current) return;
        showcaseSuggestionRef.current = example.suggestion;
        setShowcaseSuggestion(example.suggestion);
      }, SHOWCASE_SUGGESTION_DELAY_MS);

      nextExampleTimer = window.setTimeout(() => {
        exampleIndex = (exampleIndex + 1) % showcaseExamples.length;
        showExample();
      }, SHOWCASE_CYCLE_MS);
    };

    const stopShowcase = (acceptCurrentSuggestion = false) => {
      if (!isShowcaseActiveRef.current) return;

      isShowcaseActiveRef.current = false;
      showcaseSuggestionRef.current = undefined;
      clearTimers();
      flushSync(() => {
        setIsShowcaseActive(false);
        setShowcaseSuggestion(undefined);
        if (acceptCurrentSuggestion) {
          theodoreRef.current?.acceptSuggestion();
        } else {
          theodoreRef.current?.setContent(latestContentRef.current);
        }
      });
    };

    const stopShowcaseOnKeyDown = (event: KeyboardEvent) => {
      const isSuggestionAction =
        showcaseSuggestionRef.current != null &&
        (event.key === 'Tab' ||
          event.key === 'Escape' ||
          (isMobileDevice && event.key === 'Enter'));
      if (isSuggestionAction) {
        event.preventDefault();
        event.stopImmediatePropagation();
        stopShowcase(event.key !== 'Escape');
        return;
      }

      const isEditingKey =
        event.key.length === 1 ||
        event.key === 'Backspace' ||
        event.key === 'Delete' ||
        event.key === 'Enter';
      if (isEditingKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
        stopShowcase();
      }
    };

    const stopShowcaseOnInput = () => {
      stopShowcase();
    };

    stopShowcaseRef.current = stopShowcase;

    const editor = editorRef.current;
    editor?.addEventListener('keydown', stopShowcaseOnKeyDown, {
      capture: true,
    });
    editor?.addEventListener('beforeinput', stopShowcaseOnInput, {
      capture: true,
    });
    editor?.addEventListener('input', stopShowcaseOnInput, { capture: true });
    showExample();

    return () => {
      isShowcaseActiveRef.current = false;
      stopShowcaseRef.current = () => {};
      clearTimers();
      editor?.removeEventListener('keydown', stopShowcaseOnKeyDown, {
        capture: true,
      });
      showcaseSuggestionRef.current = undefined;
      editor?.removeEventListener('beforeinput', stopShowcaseOnInput, {
        capture: true,
      });
      editor?.removeEventListener('input', stopShowcaseOnInput, {
        capture: true,
      });
      theodoreRef.current?.rejectSuggestion();
    };
  }, []);

  const handleAcceptSuggestion = useCallback(() => {
    acceptSuggestion(editorState.tree);
  }, [acceptSuggestion, editorState.tree]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const hasSuggestion = suggestion != null && suggestion !== '';
      if (!hasSuggestion) return;

      if (event.key === 'Tab' || (isMobileDevice && event.key === 'Enter')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        handleAcceptSuggestion();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        rejectActiveSuggestion();
      }
    };

    const editor = editorRef.current;
    editor?.addEventListener('keydown', handleKeyDown);

    return () => editor?.removeEventListener('keydown', handleKeyDown);
  }, [
    handleAcceptSuggestion,
    isMobileDevice,
    rejectActiveSuggestion,
    suggestion,
  ]);

  const handleCopy = () => {
    const plainText = convertTreeToText(editorState.tree);
    copyTextToClipboard(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertEmoji = useCallback(
    (emoji: string) => {
      if (isShowcaseActiveRef.current) {
        stopShowcaseRef.current();
      } else {
        flushSync(() => {
          rejectActiveSuggestion();
        });
      }
      theodoreRef.current?.insertEmoji(emoji);
    },
    [rejectActiveSuggestion],
  );

  const renderEmoji = useCallback(
    (emoji: string) => {
      if (emoji == '') return <></>;

      if (['labubu', 'animated'].includes(selectedSet)) {
        const isInSelectedEmojis = SelectedEmojis.some((e) => e.name === emoji);
        if (!isInSelectedEmojis) {
          const path = `/${emojiSets[selectedSet].dirname}/no-emoji.png`;
          return <img src={path} className="w-6 h-6" alt={emoji} />;
        }
      }

      const unified = nativeToUnified(emoji);

      const path = `/${emojiSets[selectedSet].dirname}/${unified}.${emojiSets[selectedSet].type}`;
      return <img src={path} className="w-6 h-6" alt={emoji} />;
    },
    [selectedSet],
  );

  return (
    <section id="demo" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
              Live suggestion playground
            </div>
            <h2 className="text-4xl mb-4">Complete the thought.</h2>
            <p className="text-gray-600">
              Watch Theodore stage a suggestion, then take control with your
              keyboard.
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Ghost-text editor
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy text
                  </>
                )}
              </Button>
            </div>
            <Theodore
              editorState={editorState}
              renderEmoji={renderEmoji}
              className="min-h-[100px] p-4 border-2 border-violet-200 rounded-lg focus:outline-none focus:border-violet-400 bg-white text-gray-800"
              placeholder="Start a thought and pause for a suggestion…"
              style={{
                fontSize: '16px',
                lineHeight: '24ppx',
              }}
              maxLines={7}
              theodoreRef={theodoreRef}
              ref={editorRef}
              suggestion={suggestion}
              suggestionHint={DemoSuggestionHint}
            />

            <p className="mt-2 text-xs text-gray-500">
              This hint is a custom React component. Press{' '}
              {isMobileDevice ? 'Enter' : 'Tab'} to accept the ghost text or
              Escape to reject it.
            </p>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Emoji style:</p>
              <Select
                value={selectedSet}
                onValueChange={(value) =>
                  setSelectedSet(value as keyof typeof emojiSets)
                }
              >
                <SelectTrigger className="w-[180px] fit-content-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(emojiSets).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {SelectedEmojis.map((emoji) => (
                <button
                  key={emoji.name}
                  onClick={() => {
                    handleInsertEmoji(emoji.name);
                  }}
                  className="text-2xl hover:scale-125 transition-transform p-2 rounded hover:bg-violet-50"
                >
                  <img
                    key={emoji.name}
                    src={`/${selectedSet}/${emoji.path}.${emojiSets[selectedSet].type}`}
                    alt={emoji.name}
                    className="w-8 h-8"
                  />
                </button>
              ))}
            </div>
          </Card>

          {/* <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="mb-3">
                <span className="text-3xl mb-2 block">🎯</span>
                <h3 className="text-lg font-medium mb-2">
                  Native Emoji Support
                </h3>
                <p className="text-sm text-gray-600">
                  All emojis render consistently, regardless of the user's
                  browser or operating system.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-3">
                <span className="text-3xl mb-2 block">🛡️</span>
                <h3 className="text-lg font-medium mb-2">Reliable Editing</h3>
                <p className="text-sm text-gray-600">
                  Content-editable with robust emoji handling, no unexpected
                  formatting issues.
                </p>
              </div>
            </Card>
          </div> */}
        </div>
      </div>
    </section>
  );
}
