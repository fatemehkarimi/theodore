'use client';

import React from 'react';
import { ArrowRight, Package } from 'lucide-react';
import { Button } from './ui/button';

export function HeroActions() {
  return (
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
            'https://www.npmjs.com/package/theodore-js',
            '_blank',
            'noopener,noreferrer',
          )
        }
      >
        <Package className="w-4 h-4" />
        View on npm
      </Button>
    </div>
  );
}
