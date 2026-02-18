import React from 'react';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { SentryInit } from './SentryInit';
import '../index.css';
import 'theodore-js/style.css';

export const metadata: Metadata = {
  title: 'theodore-js | Render Emoji in React Inputs',
  description:
    'Render emoji as images in React text inputs with theodore-js. Replace emoji characters with custom images for consistent cross-browser display. Built for classy web apps.',
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
  ],
  metadataBase: new URL('https://theodore-js.dev'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'theodore-js | Render Emoji in React Inputs',
    description:
      'Replace emoji characters with custom images in React text inputs for consistent cross-browser rendering. Perfect for chat apps and social platforms.',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'theodore-js',
              description:
                'A React library for rendering emoji as custom images in text inputs, ensuring consistent cross-browser display',
              url: 'https://theodore-js.dev',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web Browser',
              programmingLanguage: 'TypeScript, React',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Render emoji in React input fields',
                'Display emoji as images in text inputs',
                'Replace emoji with custom images',
                'Cross-browser emoji consistency',
                'Contenteditable emoji support',
                'TypeScript support',
              ],
              keywords: [
                'react emoji input',
                'render emoji in input react',
                'display emoji as image in text input react',
                'replace emoji with custom images in input react',
                'react emoji editor',
                'custom emoji rendering react',
              ],
              author: {
                '@type': 'Organization',
                name: 'fatemeh karimi',
              },
              datePublished: '2026-02-18',
              softwareVersion: '1.0.0',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TechArticle',
              headline: 'How to Render Emoji in React Input Fields',
              description:
                'Learn how to display emoji as images in React text inputs using theodore-js for consistent cross-browser rendering',
              url: 'https://theodore-js.dev',
              datePublished: '2026-02-18',
              author: {
                '@type': 'Organization',
                name: 'fatemeh karimi',
              },
              publisher: {
                '@type': 'Organization',
                name: 'fatemeh karimi',
              },
              keywords: [
                'react emoji input',
                'render emoji in input react',
                'display emoji as image in text input react',
                'replace emoji with custom images in input react',
              ],
            }),
          }}
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
