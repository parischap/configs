/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { basename, resolve } from 'node:path/posix';
import type { Config } from "../types.js";
import { deepMerge } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalTop from './configInternalTop.js';
import pnpmWorkspaceConfig from './pnpmWorkspaceConfig.js';
import vitestWorkspaceConfig from './vitestWorkspaceConfig.js';

const packageName = basename(resolve());

const _default:Config= deepMerge(
  configInternalBase({
    packageName,
    description: 'Top repository of monorepo',
    environment: 'Node',
    scripts: {
        'update-all-config-files':
          'pnpm -r -include-workspace-root=true --workspace-concurrency=1 update-config-files',
        'clean-all-node-modules': 'pnpm --recursive clean-node-modules',
        'clean-all-config-files': 'pnpm -r -include-workspace-root=true clean-config-files',
        'build-all': 'pnpm -r build',
        'prepare-docs': 'pnpm --recursive --parallel docgen && compile-docs',
      }
  }),
  configInternalTop({pnpmWorkspaceConfig, vitestWorkspaceConfig}),
);

export default _default;