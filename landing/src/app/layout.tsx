import React from 'react';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { SentryInit } from './SentryInit';
import 'nextra-theme-docs/style.css';
import '../index.css';
import 'theodore-js/style.css';

const metadata: Metadata = {
  title:
    'theodore-js | Richer react inputs with inline suggestions and custom-rendered-emoji',
  description:
    'Render emoji as images in React text inputs with theodore-js. Display ai-generated suggestions as ghost text in the input. Built for classy web apps.',
  keywords: [
    'react emoji input',
    'render emoji in input react',
    'display emoji as image in text input react',
    'replace emoji with custom images in input react',
    'react emoji editor',
    'custom emoji rendering react',
    'contenteditable emoji',
    'cross-browser emoji consistency',
    'react emoji component',
    'emoji input field react',
    'ghost text in input',
    'display inline suggestion in input',
    'recommend suggestion to user in input',
  ],
  metadataBase: new URL('https://theodore-js.dev'),
  alternates: {
    canonical: 'https://theodore-js.dev',
  },
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title:
      'theodore-js | Richer react inputs with inline suggestions and custom-rendered-emoji',
    description:
      'Render emoji as images in React text inputs with theodore-js. Display ai-generated suggestions as ghost text in the input. Built for classy web apps.',
    url: 'https://theodore-js.dev',
    siteName: 'theodore-js',
    images: [
      {
        url: '/favicon.png',
        width: 905,
        height: 905,
        alt: 'theodore-js emoji editor for React',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  authors: [{ name: 'fatemeh karimi' }],
  creator: 'fatemeh karimi',
  publisher: 'fatemeh karimi',
};

const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="style"
          href="https://unpkg.com/@speed-highlight/core@1.2.14/dist/themes/github-dark.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
  var themeId = 'speed-highlight-theme';
  if (document.getElementById(themeId)) return;
  var link = document.createElement('link');
  link.id = themeId;
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/@speed-highlight/core@1.2.14/dist/themes/github-dark.css';
  document.head.appendChild(link);
})();`,
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://unpkg.com/@speed-highlight/core@1.2.14/dist/themes/github-dark.css"
          />
        </noscript>
      </head>
      <body>
        <SentryInit />
        {children}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104688237', 'ym');
ym(104688237, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});`,
          }}
        />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/104688237"
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}

export { metadata, viewport };
