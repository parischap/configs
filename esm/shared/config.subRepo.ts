/** This config is the one to be used in the sub-package of a monorepo. */
import { basename, dirname, resolve } from 'node:path';
import { merge } from 'ts-deepmerge';
import configBase, { Environment } from './config.base.js';
import configPackage, { Visibility } from './config.package.js';
import * as constants from './constants.js';

const rootPath = resolve();
const packageName = basename(rootPath);
const repoName = basename(dirname(dirname(rootPath)));

export default ({
	environment,
	bundled,
	visibility,
	hasStaticFolder,
	hasDocGen,
	keywords
}: {
	readonly environment: Environment.Type;
	readonly bundled: boolean;
	readonly visibility: Visibility.Type;
	readonly hasStaticFolder: boolean;
	readonly hasDocGen: boolean;
	readonly keywords: ReadonlyArray<string>;
}) =>
	merge(
		configBase({
			packageName,
			environment
		}),
		configPackage({
			packageName,
			repoName,
			bundled,
			visibility,
			hasStaticFolder,
			hasDocGen,
			keywords
		}),
		{
			[constants.packageJsonFileName]: {
				devDependencies: {
					// Include self for tests
					[`${constants.scope}/${packageName}`]: 'link:.'
				},
				scripts: {
					prodify: 'prodify',
					bundle: 'bundle-files'
				}
			}
		}
	);
