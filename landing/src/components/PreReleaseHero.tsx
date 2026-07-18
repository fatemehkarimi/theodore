import { ArrowDown, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function PreReleaseHero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50 pt-20 pb-32"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            inline suggestions in v 2.0.0
          </div>

          <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            theodore-js
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Display suggestion as inline ghost text, choose exactly how people
            accept or reject them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              asChild
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
            >
              <a href="#demo">
                Try it live <ArrowDown className="w-4 h-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#suggestion-features">Explore what&apos;s new</a>
            </Button>
          </div>

          <div className="pre-release-suggestion-preview max-w-2xl mx-auto bg-white border border-violet-200 rounded-xl p-4 shadow-md">
            <p className="text-lg text-gray-800" style={{ marginBlock: 0 }}>
              We&apos;re going to launch it{' '}
              <span className="text-gray-400">this week 🎉</span>{' '}
              <span className="inline-flex items-center gap-2 px-2 py-1 border border-violet-200 rounded-full text-xs text-violet-700">
                Tab
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">
        ✨
      </div>
      <div
        className="absolute bottom-20 right-10 text-6xl opacity-20 animate-pulse"
        style={{ animationDelay: '1s' }}
      >
        🎉
      </div>
    </section>
  );
}
