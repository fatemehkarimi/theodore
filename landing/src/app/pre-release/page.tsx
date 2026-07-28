import { DemoV2 } from '@/components/DemoV2';
import { Footer } from '@/components/Footer';
import { PreReleaseHero } from '@/components/PreReleaseHero';
import { SuggestionFeatures } from '@/components/SuggestionFeatures';
import type { Metadata } from 'next';

const metadata: Metadata = {
  title: 'theodore-js 2.0 | Custom Inline Suggestions',
  description:
    'Build editor suggestions with ghost text, programmable accept and reject controls, and fully custom suggestion hints.',
  alternates: {
    canonical: '/pre-release',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreReleasePage() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <PreReleaseHero />
        <DemoV2 />
        <SuggestionFeatures />
      </main>
      <Footer description="A React editor for expressive emoji rendering and product-native inline suggestions, with full control over how every suggestion looks and behaves." />
    </div>
  );
}

export { metadata };
