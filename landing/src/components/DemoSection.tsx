import { Check, Copy } from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
  convertTreeToText,
  Theodore,
  TheodoreHandle,
  useEditorState,
} from 'theodore-js';
import 'theodore-js/style.css';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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
    type: 'png',
  },
  android: {
    name: 'Android Emojis',
    dirname: 'android',
    type: 'png',
  },
  // labubu: {
  //   name: 'Labubu Emojis',
  //   dirname: 'labubu',
  //   type: 'png',
  // },
  animated: {
    name: 'Animated Emojis',
    dirname: 'animated',
    type: 'gif',
  },
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

export function DemoSection() {
  const editorState = useEditorState();
  const [copied, setCopied] = useState(false);
  const [selectedSet, setSelectedSet] = useState<keyof typeof emojiSets>(() => {
    const keys = Object.keys(emojiSets) as Array<keyof typeof emojiSets>;
    return keys[Math.floor(Math.random() * keys.length)];
  });

  const theodoreRef = useRef<TheodoreHandle>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    const plainText = convertTreeToText(editorState.tree);
    copyTextToClipboard(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="demo" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Try It Live</h2>
            <p className="text-gray-600">
              Experience consistent emoji rendering in action
            </p>
          </div>

          <Card className="p-6 mb-8">
            <div className="mb-4 flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Interactive Editor
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
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </Button>
            </div>

            <Theodore
              editorState={editorState}
              renderEmoji={(emoji: string) => {
                const emojiPath = SelectedEmojis.find(
                  (e) => e.name === emoji,
                )?.path;
                return (
                  <img
                    key={emoji}
                    src={`/${selectedSet}/${emojiPath}.${emojiSets[selectedSet].type}`}
                    alt={emoji}
                    className="w-6 h-6"
                  />
                );
              }}
              className="min-h-[200px] p-4 border-2 border-violet-200 rounded-lg focus:outline-none focus:border-violet-400 bg-white text-gray-800 mb-4"
              placeholder="Try typing with emojis! 😊"
              style={{ fontSize: '16px', lineHeight: '24ppx' }}
              maxLines={7}
              theodoreRef={theodoreRef}
              ref={editorRef}
            />

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">Quick Insert:</p>
              <Select
                value={selectedSet}
                onValueChange={(value) =>
                  setSelectedSet(value as keyof typeof emojiSets)
                }
              >
                <SelectTrigger className="w-[180px]">
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
                  onClick={() => theodoreRef.current?.insertEmoji(emoji.name)}
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
