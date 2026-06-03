import js from '@eslint/js';

export default [
  { ignores: ['dist', 'src/**/*.ts', 'src/**/*.tsx', 'vite.config.ts'] },
  js.configs.recommended
];
