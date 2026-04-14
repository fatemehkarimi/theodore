import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sourceFiles = ['**/*.{js,mjs,cjs,jsx,ts,tsx}'];

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
    },
    rules: {
      // ...reactHooks.configs.recommended.rules,
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'error',
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
];
