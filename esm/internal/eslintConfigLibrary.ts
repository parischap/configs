// This module must not import any external dependency. It must be runnable without a package.json
export default `import eslintConfigLibrary from '@parischap/configs/eslintConfigLibrary';

export default eslintConfigLibrary(import.meta.dirname);`;
