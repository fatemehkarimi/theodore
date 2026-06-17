import playwright from 'eslint-plugin-playwright';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sourceFiles = ['**/*.{js,mjs,cjs,jsx,ts,tsx}'];
const playwrightE2eRecommended = playwright.configs['flat/recommended'];

export default [
  {
    files: sourceFiles,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.browser,
    },
  },
  // js.configs.recommended,
  // ...fixupConfigRules([
  //   {
  //     ...react,
  //     settings: {
  //       react: { version: '>=18.0.0' },
  //     },
  //   },
  //   reactJsx,
  // ]),
  {
    files: sourceFiles,
    plugins: {
      'react-hooks': reactHooks,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // ...reactHooks.configs.recommended.rules,
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
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
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/*.tsbuildinfo',
    ],
  },
  {
    files: ['theodore/e2e/**/*.ts'],
    ...playwrightE2eRecommended,
    languageOptions: {
      ...playwrightE2eRecommended.languageOptions,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      ...playwrightE2eRecommended.rules,
      'playwright/expect-expect': [
        'error',
        {
          assertFunctionNames: [
            'expect',
            'expectNoPageErrors',
            'expectExactText',
          ],
        },
      ],
    },
  },
];
