import { fixupConfigRules } from '@eslint/compat';
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactJsx from 'eslint-plugin-react/configs/jsx-runtime.js';
import react from 'eslint-plugin-react/configs/recommended.js';
import globals from 'globals';

export default [
  { languageOptions: { globals: globals.browser } },
  js.configs.recommended,
  ...fixupConfigRules([
    {
      ...react,
      settings: {
        react: { version: '>=18.0.0' },
      },
    },
    reactJsx,
  ]),
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "ExportNamedDeclaration[declaration.type='VariableDeclaration']",
          message: 'Export statements should be at the end of the file.',
        },
      ],
    },
  },
  { ignores: ['dist/**', 'node_modules/**'] },
];
