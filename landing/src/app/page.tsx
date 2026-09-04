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
    '@type': 'Person',
    name: 'Fatemeh Karimi',
  },
  datePublished: '2026-02-18',
  softwareVersion: '1.0.0',
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
