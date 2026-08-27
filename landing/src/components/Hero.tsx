import { Github } from 'lucide-react';
import { DemoV2 } from './DemoV2';
import { HeroActions } from './HeroActions';
import { InstallCommand } from './InstallCommand';

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-32"
    >
      <nav className="landing-home-nav" aria-label="Main navigation">
        <a className="landing-home-brand" href="/" aria-label="Theodore home">
          <span aria-hidden="true">😊</span>
          <span>theodore-js</span>
          <span className="landing-version-badge">v2.0.0</span>
        </a>

        <div className="landing-home-nav-links">
          <a href="/docs">Docs</a>
          <a
            href="https://github.com/fatemehkarimi/theodore"
            target="_blank"
            rel="noreferrer"
          >
            <Github aria-hidden="true" />
            GitHub
          </a>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="landing-hero-layout">
          <div className="landing-hero-copy text-center">
            <h1 className="landing-hero-heading">
              Build{' '}
              <span className="landing-hero-heading-primary">
                richer React inputs
              </span>{' '}
              with{' '}
              <span className="landing-hero-heading-suggestions">
                inline suggestions
              </span>{' '}
              and{' '}
              <span className="landing-hero-heading-emoji">
                custom-rendered emoji
              </span>
              .
            </h1>

            <InstallCommand />

            <div className="landing-hero-actions-wrap">
              <HeroActions />
            </div>

            <div className="landing-hero-benefits flex flex-wrap gap-8 justify-center text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👻</span>
                <span>Supports Ghost Text</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">😊</span>
                <span>Consistent Emoji Rendering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span>Lightweight</span>
              </div>
            </div>
          </div>

          <DemoV2 embedded />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse"
      >
        😀
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-20 right-10 text-6xl opacity-20 animate-pulse"
        style={{ animationDelay: '1s' }}
      >
        🎉
      </div>
      <div
        aria-hidden="true"
        className="absolute top-40 right-20 text-5xl opacity-20 animate-pulse"
        style={{ animationDelay: '0.5s' }}
      >
        ❤️
      </div>
    </section>
  );
}
