import * as constants from './constants.js';

export default {
	scripts: {
		'update-all-config-files':
			'pnpm -r -include-workspace-root=true --workspace-concurrency=1 update-config-files',
		'clean-all-prod-files': 'pnpm -r clean-prod',
		'clean-all-config-files': 'pnpm -r -include-workspace-root=true clean-config-files',
		'build-all': 'pnpm -r build'
	},
	devDependencies: {
		'@parischap/configs': 'latest'
	},
	workspaces: [`${constants.packagesFolderName}/*`]
};
