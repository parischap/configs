/**
 * This config implements what is necessary for the configs package. It must be used by this package
 * only.
 */
import { basename, resolve } from 'node:path';
import { merge } from 'ts-deepmerge';
import configInternalBase, { Environment } from './config.internal.base.js';
import configInternalPackage, { Visibility } from './config.internal.package.js';
import configInternalTop from './config.internal.top.js';
import * as constants from './constants.js';

const packageName = basename(resolve());
const executablesPath = `./${constants.projectFolderName}/${constants.executablesFolderName}/`;
const prodExecutablesPath = `./${constants.prodFolderName}/${constants.executablesFolderName}/`;

export default merge(
	configInternalBase({
		packageName,
		environment: Environment.Type.Node
	}),
	configInternalPackage({
		packageName,
		repoName: packageName,
		description: 'Utility to generate configuration files in a repository',
		dependencies: {
			minimatch: 'latest',
			effect: constants.effectVersion,
			'@effect/platform': constants.effectPlatformVersion,
			'@effect/platform-node': constants.effectPlatformNodeVersion,
			'ts-deepmerge': 'latest'
		},
		devDependencies: {
			// In this package only, we link to the prod version of the package. pnpm install does not error if the dist directory does not contain any package.json
			[`${constants.slashedScope}${packageName}`]: 'link:dist'
		},
		internalPeerDependencies: {},
		externalPeerDependencies: {},
		examples: [],
		scripts: {
			bundle: `vite-node ${executablesPath}bundle-files.ts`,
			prodify: `node ${prodExecutablesPath}prodify.js`,
			'update-config-files': `node ${prodExecutablesPath}update-config-files.js`,
			'pre-build': 'pnpm i',
			'post-build': 'pnpm update-config-files'
		},
		bundled: true,
		visibility: Visibility.Type.PublicByForce,
		hasStaticFolder: false,
		hasDocGen: false,
		keywords: []
	}),
	configInternalTop,
	{
		[constants.packageJsonFileName]: {
			publishConfig: {
				// Add type field for configs package. Eslint plugins and prettier plugins need to be installed at the root of each monorepo for vscode intellicode. At the same time, eslint.config.base and prettier.config.base use recommended configs of eslint, prettier and their plugins. The configs and the plugins need to be in the same version. For this reason, we do not import the plugins as dependencies of this package as we should. But as dev dependencies. These devDependencies are removed in the prod version of the Configs package. But as they are also included at the root of the target package, everything will work. However, we need to add type module in the nearest package.json above node_modules.
				type: 'module'
			}
		}
	}
);
