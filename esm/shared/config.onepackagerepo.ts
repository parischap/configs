/** This config is the one to be used in a standalone reponwhich is either a library or an executable */
import { basename, resolve } from 'node:path';
import { merge } from 'ts-deepmerge';
import configBase, { Environment } from './config.base.js';
import configPackage, { Visibility } from './config.package.js';
import configTop from './config.top.js';

const packageName = basename(resolve());

export default merge(
	configBase({
		packageName,
		environment: Environment.Type.Node
	}),
	configPackage({
		packageName,
		repoName: packageName,
		bundled: false,
		visibility: Visibility.Type.PublicByForce,
		hasStaticFolder: false,
		hasDocGen: false,
		keywords: []
	}),
	configTop
);
