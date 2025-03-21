/** This config is the one to be used in a standalone reponwhich is either a library or an executable */
import { basename, resolve } from 'node:path';
import { merge } from 'ts-deepmerge';
import configInternalBase, { Environment } from './config.internal.base.js';
import configInternalPackage, { Visibility } from './config.internal.package.js';
import configInternalTop from './config.internal.top.js';

const packageName = basename(resolve());

export default merge(
	configInternalBase({
		packageName,
		environment: Environment.Type.Node
	}),
	configInternalPackage({
		packageName,
		repoName: packageName,
		bundled: true,
		visibility: Visibility.Type.Private,
		hasStaticFolder: false,
		hasDocGen: false,
		keywords: []
	}),
	configInternalTop
);
