import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  source: {
    define: {
      'process.env.REACT_APP_BUILD_NUMBER': JSON.stringify(
        process.env.REACT_APP_BUILD_NUMBER ?? '1',
      ),
    },
    include: [/node_modules[\\/]/],
  },
  html: {
    template: './public/index.html',
  },
});
