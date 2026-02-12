import React from 'react';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { SentryInit } from './SentryInit';
import '../index.css';
import 'theodore-js/style.css';

export const metadata: Metadata = {
  title: 'theodore-js | Custom Emoji Editor for React',
  description:
    'theodore-js is a custom emoji editor for React. It uses contenteditable to replace emoji characters with images for consistent cross-browser rendering.',
  metadataBase: new URL('https://theodore-js.dev'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport: Viewport = {
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
          rel="stylesheet"
          href="https://unpkg.com/@speed-highlight/core@1.2.14/dist/themes/github-dark.css"
        />
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
