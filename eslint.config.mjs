import pluginJs from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    plugins: { 'simple-import-sort': simpleImportSort },
  },
  {
    languageOptions: { globals: globals.node },
  },
  {
    ignores: ['dist/*', 'packages/*', 'example/*'],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
];
