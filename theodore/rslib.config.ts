import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  source: {
    tsconfigPath: './tsconfig.build.json',
    entry: {
      index: ['./src/**'],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
    sourceMap: false,
    minify: {
      js: 'always',
      css: 'always',
    },
  },
  plugins: [pluginReact(), pluginSass()],
});
