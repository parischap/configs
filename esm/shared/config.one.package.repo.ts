/** This config is the one to be used in a standalone reponwhich is either a library or an executable */
import { basename, resolve } from 'node:path';
import { merge } from 'ts-deepmerge';
import configInternalBase, { Environment } from './config.internal.base.js';
import configInternalPackage, { Visibility } from './config.internal.package.js';
import configInternalTop from './config.internal.top.js';

const packageName = basename(resolve());

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
		configInternalBase({
			packageName,
			environment
		}),
		configInternalPackage({
			packageName,
			repoName: packageName,
			bundled,
			visibility,
			hasStaticFolder,
			hasDocGen,
			keywords
		}),
		configInternalTop
	);
