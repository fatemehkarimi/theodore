'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

const installCommand = 'npm install theodore-js';

export function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="landing-npm-box" aria-label="Install Theodore">
      <div className="landing-npm-box-header">
        <span>npm</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy npm install command"
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <code>{installCommand}</code>
    </div>
  );
}
