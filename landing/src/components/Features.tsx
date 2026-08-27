import React from 'react';
import { Card } from './ui/card';
import {
  Globe,
  Keyboard,
  Palette,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    tone: 'emoji',
    title: 'Consistent emoji everywhere',
    description:
      'Render emoji with your own images so they look identical across browsers and platforms.',
  },
  {
    icon: Sparkles,
    tone: 'suggestions',
    title: 'Ghost text for suggestions',
    description:
      'Show inline suggestions without adding them to the user’s content until accepted.',
  },
  {
    icon: Keyboard,
    tone: 'interaction',
    title: 'Flexible accept and reject',
    description:
      'Use Tab, Escape, buttons, gestures, or custom product logic to control suggestions.',
  },
  {
    icon: Palette,
    tone: 'design',
    title: 'Fully customizable UI',
    description:
      'Style emoji, ghost text, and suggestion hints to match your product.',
  },
  {
    icon: RotateCcw,
    tone: 'editor',
    title: 'Reliable editing',
    description:
      'Preserve expected editor behavior, including undo and keyboard interactions.',
  },
  {
    icon: Zap,
    tone: 'performance',
    title: 'Lightweight by design',
    description:
      'Add both capabilities without adopting a heavy, opinionated editor framework.',
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-br from-gray-50 to-violet-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Why theodore-js?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Render emoji consistently, add inline suggestions, and keep full
              control over behavior and presentation.
            </p>
          </div>

          <div className="landing-features-grid grid gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className={`landing-feature-card landing-feature-card--${feature.tone}`}
              >
                <div className="landing-feature-icon">
                  <feature.icon aria-hidden="true" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
