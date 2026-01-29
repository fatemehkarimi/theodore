import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Github } from 'lucide-react';

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50 pt-20 pb-32"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
            Cross-Browser Emoji Rendering
          </div>

          <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            theodore-js
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Theodore is a text input that replaces emoji characters with custom
            images, ensuring consistent display across all browsers
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
              onClick={() => {
                const element = document.getElementById('installation');
                if (element) {
                  element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }
              }}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() =>
                window.open(
                  'https://github.com/fatemehkarimi/theodore',
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </Button>
          </div>

          <div className="flex flex-wrap gap-8 justify-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">😊</span>
              <span>Consistent Rendering</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              <span>Cross-Browser</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Lightweight</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">
        😀
      </div>
      <div
        className="absolute bottom-20 right-10 text-6xl opacity-20 animate-pulse"
        style={{ animationDelay: '1s' }}
      >
        🎉
      </div>
      <div
        className="absolute top-40 right-20 text-5xl opacity-20 animate-pulse"
        style={{ animationDelay: '0.5s' }}
      >
        ❤️
      </div>
    </section>
  );
}
