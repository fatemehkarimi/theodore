import { DemoSection } from '@/components/DemoSection';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Installation } from '../components/Installation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <DemoSection />
      <Features />
      <Installation />
      <Footer />
    </div>
  );
}
