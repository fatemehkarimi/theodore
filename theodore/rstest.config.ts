import { defineConfig } from '@rstest/core';
import { withRslibConfig } from '@rstest/adapter-rslib';

export default defineConfig({
  extends: withRslibConfig(),
  globals: true,
  include: ['tests/**/*.{test,spec}.{ts,tsx}'],
});
