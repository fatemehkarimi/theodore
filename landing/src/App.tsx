import React from 'react';
import { Hero } from './components/Hero';
import { DemoSection } from './components/DemoSection';
import { Features } from './components/Features';
import { Installation } from './components/Installation';
import { Footer } from './components/Footer';

export default function App() {
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
