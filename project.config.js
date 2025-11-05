import { configOnePackageRepo, constants, deepMerge } from '@parischap/configs';

export default deepMerge(configOnePackageRepo({
  description: 'Utility to generate configuration files in a repository',
  dependencies: {
    effect: '^3.18.1',
    '@effect/platform': '^0.92.1',
    '@effect/platform-node': '^0.98.3',
    '@effect/cluster': '^0.50.3',
    '@effect/rpc': '^0.71.0',
    '@effect/sql': '^0.46.0',
    '@effect/workflow': '^0.11.3',
  },
  devDependencies: {
    '@eslint/core': '^0.16.0',
    '@types/eslint': '^9.6.1',
    '@types/eslint-config-prettier': '^6.11.3',
  },
  internalPeerDependencies: {},
  externalPeerDependencies: constants.lintingAndFormattingDependencies,
  examples: [],
  environment: 'Node',
  bundled: true,
  visibility: 'Private',
  hasDocGen: false,
  keywords: [],
}),
{"exports": {
    "./prettierConfig": {
      "import": "./esm/lintingAndFormattingConfig/prettierConfig.js"
    },
    "./eslintConfigBrowser": {
      "import": "./esm/lintingAndFormattingConfig/eslintConfigBrowser.js"
    },
    "./eslintConfigLibrary": {
      "import": "./esm/lintingAndFormattingConfig/eslintConfigLibrary.js"
    },
    "./eslintConfigNode": {
      "import": "./esm/lintingAndFormattingConfig/eslintConfigNode.js"
    },
  }});
