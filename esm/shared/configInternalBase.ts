/**
 * This config implements what is necessary in all situations. It should not be used directly. It is
 * included by config.monorepo.ts, config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
import * as constants from './constants.js';
import eslintConfigBrowserTemplate from './eslintConfigBrowserTemplate.js';
import eslintConfigLibraryTemplate from './EslintConfigLibraryTemplate.js';
import eslintConfigNodeTemplate from './eslintConfigNodeTemplate.js';
import gitIgnoreTemplate from './gitignoreTemplate.js';
import prettierConfigTemplate from './prettierConfigTemplate.js';
import prettierIgnore from './prettierIgnore.js';
import tsConfig from './tsconfig.js';
import tsConfigCheck from './tsconfigCheck.js';
import tsConfigEsmBrowser from './tsconfigEsmBrowser.js';
import tsConfigEsmLibrary from './tsconfigEsmLibrary.js';
import tsConfigEsmNode from './tsconfigEsmNode.js';
import tsconfigBase from './tsconfigInternalBase.js';
import tsConfigOthers from './tsconfigOthers.js';
import viteConfigTemplate from './viteConfigTemplate.js';

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
	[constants.baseTsConfigFileName]: tsconfigBase,
	[constants.nonProjectTsConfigFileName]: tsConfigOthers,
	[constants.tsConfigFileName]: tsConfig,
	[constants.tscLintTsConfigFileName]: tsConfigCheck,
	[constants.viteConfigFileName]: viteConfigTemplate,
	[constants.packageJsonFileName]: {
		name: `${constants.slashedDevScope}${packageName}`,
		type: 'module',
		author: 'Jérôme MARTIN',
		license: 'MIT',
		scripts: {
			tscheck: `tsc -b ${constants.tscLintTsConfigFileName} --force`,
			lint: 'eslint .',
			'lint-fix': 'eslint . --fix',
			'lint-rules': 'pnpx @eslint/config-inspector',
			'update-config-files': 'update-config-files',
			'clean-config-files': `shx rm -rf ${constants.packageJsonFileName} && shx rm -rf ${constants.tsConfigFileName}`
		}
	},
	...environmentConfig(environment)
});
