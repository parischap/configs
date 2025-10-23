/**
 * This config is the one to be used at the root (top) of a monorepo.
 */
// This file must not import anything external
import { basename, resolve } from 'node:path/posix';
import configInternalBase from './configInternalBase.js';
import configInternalTop from './configInternalTop.js';
import { packageJsonFileName, packagesFolderName, pnpmWorkspaceFileName } from './constants.js';
import pnpmWorkspace from './pnpmWorkspace.js';
import { deepMerge } from './utils.js';
/**
 * @import {Config} from "./types.d.ts"
 */

const packageName = basename(resolve());

/**
 * @type Config
 */
export default deepMerge(
  configInternalBase({
    packageName,
    environment: 'Node',
  }),
  configInternalTop,
  {
    [pnpmWorkspaceFileName]: pnpmWorkspace,
    [packageJsonFileName]: {
      description: 'Top repository of monorepo',
      scripts: {
        'update-all-config-files':
          'pnpm -r -include-workspace-root=true --workspace-concurrency=1 update-config-files',
        'clean-all-prod-files': 'pnpm -r clean-prod',
        'clean-all-node-modules': 'pnpm --recursive clean-node-modules',
        'clean-all-config-files': 'pnpm -r -include-workspace-root=true clean-config-files',
        'build-all': 'pnpm -r build',
        'prepare-docs': 'pnpm --recursive --parallel docgen && compile-docs',
      },
      workspaces: [`${packagesFolderName}/*`],
    },
  },
);
