/**
 * This config implements what is necessary in all situations. It should not be used directly. It is
 * included by config.monorepo.ts, config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
import * as constants from './constants.js';
import eslintConfigBrowserTemplate from './eslint.config.browser.template.js';
import eslintConfigLibraryTemplate from './eslint.config.library.template.js';
import eslintConfigNodeTemplate from './eslint.config.node.template.js';
import gitIgnoreTemplate from './gitignore.template.js';
import prettierConfigTemplate from './prettier.config.template.js';
import prettierIgnore from './prettierignore.js';
import tsconfigInternalBase from './tsconfig.base.js';
import tsConfigCheck from './tsconfig.check.js';
import tsConfigEsmBrowser from './tsconfig.esm.browser.js';
import tsConfigEsmLibrary from './tsconfig.esm.library.js';
import tsConfigEsmNode from './tsconfig.esm.node.js';
import tsConfig from './tsconfig.js';
import tsConfigOthers from './tsconfig.others.js';
import viteConfigTemplate from './vite.config.template.js';

export namespace Environment {
	export enum Type {
		Node = 0,
		Library = 1,
		Browser = 2
	}
}

const environmentConfig = (environment: Environment.Type) =>
	environment === Environment.Type.Browser ?
		{
			[constants.projectTsConfigFileName]: tsConfigEsmBrowser,
			[constants.eslintConfigFileName]: eslintConfigBrowserTemplate
		}
	: environment === Environment.Type.Node ?
		{
			[constants.projectTsConfigFileName]: tsConfigEsmNode,
			[constants.eslintConfigFileName]: eslintConfigNodeTemplate
		}
	: environment === Environment.Type.Library ?
		{
			[constants.projectTsConfigFileName]: tsConfigEsmLibrary,
			[constants.eslintConfigFileName]: eslintConfigLibraryTemplate
		}
	:	{};

export default ({
	packageName,
	environment
}: {
	readonly packageName: string;
	readonly environment: Environment.Type;
}) => ({
	// Put prettier in first position so the next generated files will get formatted
	[constants.prettierConfigFileName]: prettierConfigTemplate,
	[constants.gitIgnoreFileName]: gitIgnoreTemplate,
	[constants.prettierIgnoreFileName]: prettierIgnore,
	[constants.baseTsConfigFileName]: tsconfigInternalBase,
	[constants.nonProjectTsConfigFileName]: tsConfigOthers,
	[constants.tsConfigFileName]: tsConfig,
	[constants.tscLintTsConfigFileName]: tsConfigCheck,
	[constants.viteConfigFileName]: viteConfigTemplate,
	[constants.packageJsonFileName]: {
		name: `${constants.devScope}/${packageName}`,
		type: 'module',
		author: 'Jérôme MARTIN',
		license: 'MIT',
		scripts: {
			tscheck: `tsc -b ${constants.tscLintTsConfigFileName} --force `,
			lint: 'eslint .',
			'lint-fix': 'eslint . --fix',
			'lint-rules': 'pnpx @eslint/config-inspector',
			'update-config-files': 'update-config-files',
			'clean-config-files': `shx rm -rf ${constants.packageJsonFileName} && shx rm -rf ${constants.tsConfigFileName}`
		}
	},
	...environmentConfig(environment)
});
