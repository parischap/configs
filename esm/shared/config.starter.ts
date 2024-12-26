import merge from 'deepmerge';
import { basename, resolve } from 'node:path';
import configBase from './config.base.js';
import configBaseNode from './config.base.node.js';
import configCode from './config.code.js';
import configCodeTranspiled from './config.code.transpiled.js';
import configTop from './config.top.js';
import * as constants from './constants.js';

const packageName = basename(resolve());

export default merge.all([
	configBase(packageName, packageName),
	configCode,
	configCodeTranspiled,
	configBaseNode,
	configTop,
	{
		[constants.packageJsonFileName]: {
			description: 'Utility to generate configuration files in a repository',
			dependencies: {
				globals: 'latest',
				minimatch: 'latest',
				effect: constants.effectVersion,
				'@effect/platform': constants.effectPlatformVersion,
				'@effect/platform-node': constants.effectPlatformNodeVersion
			},
			devDependencies: {
				// In this package only, we link to the prod version of the package. pnpm install does not error if the dist directory does not contain any package.json
				[`${constants.scope}/${packageName}`]: 'link:dist'
			},
			scripts: {
				'generate-types': `tsc -b ${constants.projectTsConfigFileName} --emitDeclarationOnly`,
				bundle: `vite-node ./${constants.projectFolderName}/${constants.executablesFolderName}/bundle-files.ts`,
				prodify: `node ./${constants.prodFolderName}/${constants.executablesFolderName}/prodify.js`,
				'update-config-files': `node ${constants.prodFolderName}/${constants.executablesFolderName}/update-config-files.js`,
				build: `pnpm clean-prod && pnpm i && pnpm bundle && pnpm prodify && pnpm update-config-files && pnpm generate-types && pnpm install-prod`
			},
			publishConfig: {
				// Do not publish maps of this package because it should be private
				files: ['*', '!*.map'],
				// Although this is a bundled package, it generates types in dist
				exports: {
					'.': {
						types: `./${constants.typesFolderName}/index.d.ts`
					}
				}
			}
		}
	}
]);
