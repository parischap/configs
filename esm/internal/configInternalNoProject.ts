/**
 * This config implements what is necessary in a package that has no code (no esm directory). This
 * package is also a workspace. A package is always composed of a configInternalBase and either of a
 * configInternalProject or a configInternalNoProject. It should not be used directly. It is
 * included by configMonoRepo.ts and configTop.ts.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  eslintConfigFilename,
  packageJsonFilename,
  pnpmWorkspaceFilename,
  tsConfigFilename,
  vitestConfigFilename,
} from '../constants.js';
import eslintConfig from './eslintConfig.js';
import nonProjectVitestConfig from './nonProjectVitestConfig.js';
import pnpmWorkspaceConfig from './pnpmWorkspaceConfig.js';
import tsConfigNonProject from './tsconfigNonProject.js';

export default {
  // Used by the checks script
  [tsConfigFilename]: tsConfigNonProject,
  // Used by the checks script
  [eslintConfigFilename]: eslintConfig(),
  // Used by all scripts to define scope of -r flag
  [pnpmWorkspaceFilename]: pnpmWorkspaceConfig,
  // Used by the test script
  [vitestConfigFilename]: nonProjectVitestConfig,
  [packageJsonFilename]: {
    scripts: {
      checks: 'pnpm lint && pnpm tscheck',
      'clean-all-node-modules': 'pnpm -r -include-workspace-root=true --reverse clean-node-modules',
      'clean-all-config-files': 'pnpm -r -include-workspace-root=true --reverse clean-config-files',
      'clean-all-prod': 'pnpm --if-present -r --parallel clean-prod',
      'build-all': 'pnpm --if-present -r build',
      'auto-generate-index-for-all': 'pnpm --if-present -r --parallel auto-generate-index',
      'tscheck-all': 'pnpm -r -include-workspace-root=true tscheck',
      'lint-all': 'pnpm -r -include-workspace-root=true lint',
      'checks-all': 'pnpm -r -include-workspace-root=true checks',
      'format-all': 'pnpm -r -include-workspace-root=true format',
    },

    /*pnpm: {
        patchedDependencies: {},
        overrides: {
          //'tsconfig-paths': '^4.0.0'
        },
      },*/
  },
};
