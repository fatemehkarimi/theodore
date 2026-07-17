import { Keyboard, Palette, Sparkles } from 'lucide-react';
import { Card } from './ui/card';

const suggestionFeatures = [
  {
    icon: Sparkles,
    label: 'Render',
    title: 'Ghost text that feels native',
    description:
      'Show the next phrase directly inside the editor without mixing it into the user’s actual content.',
  },
  {
    icon: Keyboard,
    label: 'Control',
    title: 'Your rules for accept and reject',
    description:
      'Wire Tab, Escape, a button, a gesture, or your own product logic to Theodore’s suggestion controls.',
  },
  {
    icon: Palette,
    label: 'Customize',
    title: 'Hints that speak your UI language',
    description:
      'Replace the default suggestion hint with any React component, from a quiet keycap to a branded action.',
  },
];

export function SuggestionFeatures() {
  return (
    <section
      id="suggestion-features"
      className="py-20 bg-gradient-to-br from-gray-50 to-violet-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
              The suggestion toolkit
            </div>
            <h2 className="text-4xl mb-4">
              Suggestions are part of the editor now.
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Theodore handles the difficult editor behavior while your product
              keeps control of the experience around it.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {suggestionFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="flex-1 p-6 bg-white hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-violet-600" />
                </div>
                <p className="text-xs text-violet-700 mb-2">{feature.label}</p>
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
