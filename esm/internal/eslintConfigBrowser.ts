// This module must not import any external dependency. It must be runnable without a package.json
export default `import eslintConfigBrowser from '@parischap/configs/eslintConfigBrowser';

export default eslintConfigBrowser(import.meta.dirname);`;
