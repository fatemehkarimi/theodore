import { Articles } from '../components/Articles';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { Installation } from '../components/Installation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero />
        <Features />
        <Installation />
        <Articles />
      </main>
      <Footer />
    </div>
  );
}
