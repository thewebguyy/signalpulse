import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import hooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  globalIgnores(['.next/**', 'coverage/**', 'next-env.d.ts', '.npm-cache/**', 'showcase-video/**']),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { process: 'readonly', console: 'readonly', URL: 'readonly' } } },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin, 'react-hooks': hooks },
    rules: { ...nextPlugin.configs.recommended.rules, ...nextPlugin.configs['core-web-vitals'].rules, ...hooks.configs.recommended.rules },
  },
  {
    files: ['src/contracts/**/*.ts', 'src/components/**/*.tsx'],
    rules: { 'no-restricted-imports': ['error', { patterns: ['@/server/**', '@/config/server*', '@/fixtures/**'] }] },
  },
]);
