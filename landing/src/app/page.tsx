import { Articles } from '../components/Articles';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Installation } from '../components/Installation';

const softwareApplicationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'theodore-js',
  description:
    'A React library for rendering emoji as custom images in text inputs, and displaying ai-generated suggestions as ghost text',
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
    'Render custom emoji as React elements',
    'Cross-browser emoji consistency',
    'Inline ghost-text suggestions',
    'Accept or reject suggestions with keyboard or pointer input',
    'Debounced and cancellable async suggestions with useSuggestion',
    'Customizable suggestion hints',
    'Editor state, selection, and change subscriptions',
    'Undo history and reliable contenteditable editing',
    'Imperative editor controls with TheodoreHandle',
    'TypeScript support',
  ],
  keywords: [
    'react emoji input',
    'react contenteditable input',
    'custom emoji rendering react',
    'render emoji as images react',
    'cross-browser emoji rendering',
    'inline suggestions react',
    'ghost text input',
    'autocomplete suggestions react',
    'useSuggestion hook',
    'suggestion hint react',
    'undo history contenteditable',
    'Theodore editor',
    'TypeScript react editor',
  ],
  author: {
    '@type': 'Person',
    name: 'Fatemeh Karimi',
  },
  datePublished: '2026-08-27',
  softwareVersion: '2.0.0',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationStructuredData),
        }}
      />
      <div className="min-h-screen bg-white">
        <main>
          <Hero />
          <Features />
          <Installation />
          <Articles />
        </main>
        <Footer />
      </div>
    </>
  );
}
