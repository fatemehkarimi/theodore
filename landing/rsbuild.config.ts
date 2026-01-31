import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { sentryWebpackPlugin } from '@sentry/webpack-plugin';

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
    template: './index.html',
  },
  output: {
    sourceMap: true,
  },
  performance: {
    bundleAnalyze: {
      generateStatsFile: true,
    },
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      appendPlugins(
        sentryWebpackPlugin({
          org: 'fatemeh',
          project: 'theodore',
          authToken: process.env.SENTRY_AUTH_KEY,
          url: 'https://sentry.io',
          release: {
            name: `theodore-playground@${process.env.run_number}`,
            dist: `${process.env.run_number}`,
          },
          sourcemaps: {
            assets: './dist/**/*',
          },
          errorHandler(err) {
            console.error(err);
          },
          reactComponentAnnotation: {
            enabled: true,
          },
        }),
      );
    },
  },
});
