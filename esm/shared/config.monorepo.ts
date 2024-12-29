import * as constants from './constants.js';
import pnpmWorkspaceTemplate from './pnpm.workspace.template.js';
import vitestWorkspaceTemplate from './vitest.workspace.template.js';

import merge from 'deepmerge';
import { basename, resolve } from 'node:path';
import configBase, { Environment } from './config.base.js';
import configTop from './config.top.js';

const packageName = basename(resolve());

export default merge.all([
	configBase({
		packageName,
		environment: Environment.Type.Node
	}),
	configTop,
	{
		[constants.pnpmWorkspaceFileName]: pnpmWorkspaceTemplate,
		[constants.vitestWorkspaceFileName]: vitestWorkspaceTemplate,
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
]);
