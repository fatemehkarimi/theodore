'use client';

import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { highlightElement } from '@speed-highlight/core';
import Link from 'next/link';

export function Installation() {
  const [copiedCode, setCopiedCode] = useState(false);
  const codeRef = useRef<HTMLElement | null>(null);

  const copyToClipboard = (
    text: string,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  useEffect(() => {
    if (codeRef.current) {
      highlightElement(codeRef.current, 'ts').catch(console.error);
    }
  }, []);

  const codeExample = `import { useRef } from 'react';
import {
  Theodore,
  type TheodoreHandle,
  useEditorState,
  useSuggestion,
} from 'theodore-js';
import 'theodore-js/style.css';

import { renderEmoji, requestSuggestion } from './editor-config';

export function Composer() {
  const theodoreRef = useRef<TheodoreHandle>(null);
  const editorState = useEditorState();

  const { suggestion } = useSuggestion({
    editorState,
    theodoreRef,
    requestSuggestion,
  });

  return (
    <Theodore
      editorState={editorState}
      theodoreRef={theodoreRef}
      renderEmoji={renderEmoji}
      suggestion={suggestion}
      placeholder="Write something..."
    />
  );
}`;

  return (
    <section id="installation" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Quick Start</h2>
            <p className="text-gray-600">
              Connect custom emoji rendering and ghost-text suggestions in one
              component.
            </p>
          </div>

          <div className="landing-quick-start-layout">
            <Card className="landing-quick-start-code">
              <div className="landing-code-window-header">
                <div className="landing-code-window-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="landing-code-filename">Composer.tsx</span>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Copy usage example"
                  className="landing-code-copy"
                  onClick={() => copyToClipboard(codeExample, setCopiedCode)}
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy
                    </>
                  )}
                </Button>
              </div>

              <pre className="landing-code-window-body">
                <code
                  ref={codeRef}
                  className="shj-lang-ts"
                  style={{
                    fontSize: '0.875rem',
                    backgroundColor: 'var(--color-gray-900)',
                  }}
                >
                  {codeExample}
                </code>
              </pre>
            </Card>

            <aside className="landing-quick-start-guide">
              <Card className="landing-quick-start-guide-card">
                <h3>What you provide</h3>
                <ol>
                  <li>
                    <span aria-hidden="true">01</span>
                    <div>
                      <code>renderEmoji</code>
                      <p>Controls which image represents each emoji.</p>
                    </div>
                  </li>
                  <li>
                    <span aria-hidden="true">02</span>
                    <div>
                      <code>requestSuggestion</code>
                      <p>Connects Theodore to your suggestion API.</p>
                    </div>
                  </li>
                  <li>
                    <span aria-hidden="true">03</span>
                    <div>
                      <strong>Editor state and UI</strong>
                      <p>
                        Theodore handles content, rendering, and ghost text.
                      </p>
                    </div>
                  </li>
                </ol>
              </Card>

              <Link href="/docs" className="landing-quick-start-docs">
                Need the complete setup? Read the documentation
                <span aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
