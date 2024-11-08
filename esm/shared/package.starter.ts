import merge from 'deepmerge';
import { basename, resolve } from 'node:path';
import * as constants from './constants.js';
import packageBase from './package.base.js';
import packageSubRepoBundledEffect from './package.subrepo.bundled.effect.js';
import packageSubRepoBundled from './package.subrepo.bundled.js';
import packageSubRepo from './package.subrepo.js';
import packageTop from './package.top.js';

const packageName = basename(resolve());

export default merge.all([
	packageBase(packageName, packageName),
	packageSubRepo,
	packageSubRepoBundled,
	packageSubRepoBundledEffect,
	packageTop,
	{
		description: 'Utility to generate configuration files in a repository',
		dependencies: {
			globals: 'latest',
			minimatch: 'latest',
			effect: constants.effectVersion,
			'@effect/platform': constants.effectPlatformVersion,
			'@effect/platform-node': constants.effectPlatformNodeVersion
		},
		devDependencies: {
			// pnpm install does not error if the dist directory does not contain any package.json
			[`${constants.scope}/${packageName}`]: 'link:dist'
		},
		scripts: {
			bundle: `vite-node ./${constants.projectFolderName}/${constants.executablesFolderName}/bundle-files.ts`,
			prodify: `node ./${constants.prodFolderName}/${constants.executablesFolderName}/prodify.js`,
			'update-config-files': `node ${constants.prodFolderName}/${constants.executablesFolderName}/update-config-files.js`,
			build: `pnpm clean-prod && pnpm i && pnpm bundle && pnpm prodify && pnpm update-config-files && pnpm generate-types && pnpm install-prod`,
			docgen: ''
		},
		publishConfig: {
			// Do not publish maps of this package because it should be private
			files: ['*', '!*.map']
		}
	}
]);
