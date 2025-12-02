// This module must not import any external dependency. It must be runnable without a package.json
export default `import { eslintConfig } from '@parischap/configs';
export default eslintConfig.browserEslintConfig({tsconfigRootDir:import.meta.dirname})`;
