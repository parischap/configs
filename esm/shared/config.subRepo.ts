/** This config is the one to be used in the sub-package of a monorepo. */
import { basename, dirname, resolve } from 'node:path';
import { merge } from 'ts-deepmerge';
import configInternalBase, { Environment } from './config.internal.base.js';
import configInternalPackage, { Visibility } from './config.internal.package.js';

const rootPath = resolve();
const packageName = basename(rootPath);
const repoName = basename(dirname(dirname(rootPath)));

export default ({
	description,
	environment,
	bundled,
	visibility,
	hasStaticFolder,
	hasDocGen,
	keywords
}: {
	readonly description: string;
	readonly environment: Environment.Type;
	readonly bundled: boolean;
	readonly visibility: Visibility.Type;
	readonly hasStaticFolder: boolean;
	readonly hasDocGen: boolean;
	readonly keywords: ReadonlyArray<string>;
}) =>
	merge(
		configInternalBase({
			packageName,
			environment
		}),
		configInternalPackage({
			packageName,
			repoName,
			description,
			bundled,
			visibility,
			hasStaticFolder,
			hasDocGen,
			keywords
		})
	);
