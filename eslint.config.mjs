import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
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
    },
  },
];
