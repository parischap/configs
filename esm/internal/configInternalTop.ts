/**
 * This config implements what is necessary at the level at which vscode is opened. It should not be
 * used directly. It is included by configTop.ts.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  gitIgnoreFilename,
  packageJsonFilename,
  topDevDependencies,
  vitestConfigFilename,
} from '../constants.js';
import topGitIgnoreConfig from './topGitIgnoreConfig.js';
import topVitestConfig from './topVitestConfig.js';

export default {
  [gitIgnoreFilename]: topGitIgnoreConfig,
  [vitestConfigFilename]: topVitestConfig,
  [packageJsonFilename]: {
    devDependencies: topDevDependencies,

    /*pnpm: {
        patchedDependencies: {},
        overrides: {
          //'tsconfig-paths': '^4.0.0'
        },
      },*/
  },
};
