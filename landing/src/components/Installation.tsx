import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { highlightElement } from '@speed-highlight/core';

export function Installation() {
  const [copiedNpm, setCopiedNpm] = useState(false);
  const [copiedYarn, setCopiedYarn] = useState(false);
  const [copiedPnpm, setCopiedPnpm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const codeRef = useRef<HTMLElement | null>(null);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  useEffect(() => {
    if (codeRef.current) {
      highlightElement(codeRef.current, 'ts').catch(console.error);
    }
  }, []);

  const npmInstall = 'npm install theodore-js';
  const yarnInstall = 'yarn add theodore-js';
  const pnpmInstall = 'pnpm add theodore-js';
  const codeExample = `import React, { useRef } from 'react';
import { Theodore, TheodoreHandle, useEditorState } from 'theodore-js';
import 'theodore-js/style.css';

const renderEmoji = (emoji: string) => {
  if (emoji === '') return <></>;
  const unified = nativeToUnified(emoji);
  const path = \`/img-apple-64/\${unified}.png\`;
  return <img src={path} width={22} height={22} alt={emoji} />;
};

export const TheodoreTextInput: React.FC = () => {
  const theodoreRef = useRef<TheodoreHandle>(null);
  const editorState = useEditorState();

  const handleSelectEmoji = (emoji: { native: string }) => {
    theodoreRef.current?.insertEmoji(emoji.native);
  };

  return (
    <Theodore
      ref={theodoreRef}
      editorState={editorState}
      renderEmoji={renderEmoji}
      placeholder="Write something..."
      maxLines={5}
    />
  );
};`;

  return (
    <section id="installation" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4">Quick Start</h2>
            <p className="text-gray-600">Get up and running in seconds</p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Installation</h3>
              <Tabs defaultValue="npm" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                  <TabsTrigger value="npm">npm</TabsTrigger>
                  <TabsTrigger value="yarn">yarn</TabsTrigger>
                  <TabsTrigger value="pnpm">pnpm</TabsTrigger>
                </TabsList>
                <TabsContent value="npm">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{npmInstall}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-300 hover:text-white"
                      onClick={() => copyToClipboard(npmInstall, setCopiedNpm)}
                    >
                      {copiedNpm ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="yarn">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{yarnInstall}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-300 hover:text-white"
                      onClick={() =>
                        copyToClipboard(yarnInstall, setCopiedYarn)
                      }
                    >
                      {copiedYarn ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="pnpm">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{pnpmInstall}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-300 hover:text-white"
                      onClick={() =>
                        copyToClipboard(pnpmInstall, setCopiedPnpm)
                      }
                    >
                      {copiedPnpm ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Basic Usage</h3>
              <div className="relative">
                <pre
                  className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"
                  style={{
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    margin: 0,
                  }}
                >
                  <code
                    ref={codeRef}
                    className="shj-lang-ts"
                    style={{
                      fontSize: '1rem',
                    }}
                  >
                    {codeExample}
                  </code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-gray-300 hover:text-white z-10"
                  onClick={() => copyToClipboard(codeExample, setCopiedCode)}
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>

            <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2 text-violet-900">
                📚 Documentation
              </h3>
              <p className="text-violet-700 mb-4">
                For more detailed examples, API reference, and advanced usage,
                visit the documentation on github.
              </p>
              <a
                href="https://github.com/fatemehkarimi/theodore/blob/master/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-violet-300 bg-transparent px-4 py-2 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
