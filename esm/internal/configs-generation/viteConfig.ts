// This module must not import any external dependency. It must be runnable without a package.json
import { prettyStringify } from '../utils.js';

export default (buildMethod: string): string => {
  const config = {};

  return `/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig(${prettyStringify(config)});`;
};
