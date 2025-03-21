/** This config is the one to be used at the root (top) of a monorepo. */
import * as constants from './constants.js';
import pnpmWorkspaceTemplate from './pnpm.workspace.template.js';

import { basename, resolve } from 'node:path';
import { merge } from 'ts-deepmerge';
import configInternalBase, { Environment } from './config.internal.base.js';
import configInternalTop from './config.internal.top.js';

const packageName = basename(resolve());

export default merge(
	configInternalBase({
		packageName,
		environment: Environment.Type.Node
	}),
	configInternalTop,
	{
		[constants.pnpmWorkspaceFileName]: pnpmWorkspaceTemplate,
		[constants.packageJsonFileName]: {
			description: 'Top repository of monorepo',
			devDependencies: {
				'@parischap/configs': 'latest'
			},
			scripts: {
				'update-all-config-files':
					'pnpm -r -include-workspace-root=true --workspace-concurrency=1 update-config-files',
				'clean-all-prod-files': 'pnpm -r clean-prod',
				'clean-all-config-files': 'pnpm -r -include-workspace-root=true clean-config-files',
				'build-all': 'pnpm -r build',
				'prepare-docs': 'pnpm --recursive --parallel docgen && compile-docs'
			},
			workspaces: [`${constants.packagesFolderName}/*`]
		}
	}
);
