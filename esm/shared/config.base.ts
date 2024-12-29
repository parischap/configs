import * as constants from './constants.js';
import eslintConfigBrowserTemplate from './eslint.config.browser.template.js';
import eslintConfigLibraryTemplate from './eslint.config.library.template.js';
import eslintConfigNodeTemplate from './eslint.config.node.template.js';
import gitIgnoreTemplate from './gitignore.template.js';
import prettierConfigTemplate from './prettier.config.template.js';
import prettierIgnore from './prettierignore.js';
import tsConfigBase from './tsconfig.base.js';
import tsConfigCheck from './tsconfig.check.js';
import tsConfig from './tsconfig.js';
import tsConfigOthers from './tsconfig.others.js';
import tsConfigSrcBrowser from './tsconfig.src.browser.js';
import tsConfigSrcLibrary from './tsconfig.src.library.js';
import tsConfigSrcNode from './tsconfig.src.node.js';

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
			[constants.projectTsConfigFileName]: tsConfigSrcBrowser,
			[constants.eslintConfigFileName]: eslintConfigBrowserTemplate
		}
	: environment === Environment.Type.Node ?
		{
			[constants.projectTsConfigFileName]: tsConfigSrcNode,
			[constants.eslintConfigFileName]: eslintConfigNodeTemplate
		}
	: environment === Environment.Type.Library ?
		{
			[constants.projectTsConfigFileName]: tsConfigSrcLibrary,
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
	[constants.baseTsConfigFileName]: tsConfigBase,
	[constants.nonProjectTsConfigFileName]: tsConfigOthers,
	[constants.tsConfigFileName]: tsConfig,
	[constants.tscLintTsConfigFileName]: tsConfigCheck,
	[constants.viteConfigFileName]: 'export default {};',
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
