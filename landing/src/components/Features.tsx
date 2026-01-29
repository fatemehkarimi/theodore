import React from 'react';
import { Card } from './ui/card';
import { Globe, Zap, Package, Code } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Cross-Browser Compatibility',
    description:
      'Ensures emojis look the same on Chrome, Firefox, Safari, Edge, and all modern browsers.',
  },
  {
    icon: Zap,
    title: 'Lightweight & Fast',
    description:
      "Minimal overhead with maximum performance. Won't slow down your application.",
  },
  {
    icon: Package,
    title: 'Easy Integration',
    description:
      'Simple API that works with any framework. Get started in minutes, not hours.',
  },
  {
    icon: Code,
    title: 'TypeScript Support',
    description:
      'Fully typed definitions for a better developer experience and fewer bugs.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-violet-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Why theodore-js?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Use Theodore in web apps to consistently render emojis on every
              browser
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow bg-white"
              >
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
