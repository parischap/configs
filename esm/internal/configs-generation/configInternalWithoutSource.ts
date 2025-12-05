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
  vscodeWorkspaceFilename,
} from '../shared-utils/constants.js';
import eslintConfigOthers from './eslintConfigOthers.js';
import nonProjectVitestConfig from './nonProjectVitestConfig.js';
import pnpmWorkspaceConfig from './pnpmWorkspaceConfig.js';
import tsConfigOthers from './tsconfigOthers.js';
import vscodeWorkspaceConfig from './vscodeWorkspaceConfig.js';

export default ({ isTopPackage }: { readonly isTopPackage: boolean }) => ({
  // Used by the checks script
  [tsConfigFilename]: tsConfigOthers({isConfigsPackage:false}),
  // Used by the checks script
  [eslintConfigFilename]: eslintConfigOthers,
  // Used by all scripts to define scope of -r flag
  [pnpmWorkspaceFilename]: pnpmWorkspaceConfig(isTopPackage),
  // Used by the test script
  [vitestConfigFilename]: nonProjectVitestConfig,
  // Used by vscode
  ...(isTopPackage ? {[vscodeWorkspaceFilename]:vscodeWorkspaceConfig}:{}),
  [packageJsonFilename]: {
    scripts: {
      checks: 'pnpm tscheck && pnpm lint',
      'clean-all-node-modules': 'pnpm -r -include-workspace-root=true --reverse clean-node-modules',
      'clean-all-config-files': 'pnpm -r -include-workspace-root=true --reverse clean-config-files',
      'clean-all-prod': 'pnpm -r --parallel --aggregate-output clean-prod',
      // --if-present is necessary because it is possible that no package in the workspace has a build script
      'build-all': 'pnpm --if-present -r build',
      // --if-present is necessary because it is possible that no package in the workspace has an auto-update-imports script
      'auto-update-imports-for-all':
        'pnpm --if-present -r --parallel --aggregate-output auto-update-imports',
      // --if-present is necessary because it is possible that no package in the workspace has an update-imports script
      'update-imports-for-all': 'pnpm --if-present -r --parallel --aggregate-output update-imports',
      'generate-all-configs': 'pnpm -r --parallel --aggregate-output generate-configs',
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
});
