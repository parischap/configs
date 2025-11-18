import { projectsFolderName } from "../constants.js";

// This module must not import any external dependency. It must be runnable without a package.json
export default `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['${projectsFolderName}/*'],
  },
})`;
