import merge from 'deepmerge';
import { basename, resolve } from 'node:path';
import configBase, { Environment } from './config.base.js';
import configPackage, { Visibility } from './config.package.js';
import configTop from './config.top.js';
import * as constants from './constants.js';

const packageName = basename(resolve());
const executablesPath = `./${constants.projectFolderName}/${constants.executablesFolderName}/`;
const prodExecutablesPath = `./${constants.prodFolderName}/${constants.executablesFolderName}/`;

export default merge.all([
	configBase({
		packageName,
		environment: Environment.Type.Node
	}),
	configPackage({
		packageName,
		repoName: packageName,
		bundled: true,
		visibility: Visibility.Type.PublicByForce,
		hasStaticFolder: false,
		hasDocGen: false,
		keywords: []
	}),
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
				bundle: `vite-node ${executablesPath}bundle-files.ts`,
				prodify: `node ${prodExecutablesPath}prodify.js`,
				'update-config-files': `node ${prodExecutablesPath}update-config-files.js`,
				'pre-build': 'pnpm i',
				'post-build': 'pnpm update-config-files'
			},
			publishConfig: {
				// Add type field for configs package. Eslint plugins and prettier plugins need to be installed at the root of each monorepo for vscode intellicode. At the same time, eslint.config.base and prettier.config.base use recommended configs of eslint, prettier and their plugins. The configs and the plugins need to be in the same version. For this reason, we do not import the plugins as dependencies of this package as we should. But as dev dependencies. These devDependencies are removed in the prod version of the Configs package. But as they are also included at the root of the target package, everything will work. However, we need to add type module in the nearest package.json above node_modules.
				type: 'module'
			}
		}
	}
]);
