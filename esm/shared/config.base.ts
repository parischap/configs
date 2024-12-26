import * as constants from './constants.js';
import gitIgnoreTemplate from './gitignore.template.js';
import licenseTemplate from './license.template.js';
import prettierConfigTemplate from './prettier.config.template.js';
import prettierIgnore from './prettierignore.js';
import tsConfigBase from './tsconfig.base.js';
import tsConfigCheck from './tsconfig.check.js';
import tsConfig from './tsconfig.js';
import tsConfigOthers from './tsconfig.others.js';

const gitRepo = (repoName: string) => ({
	type: 'git',
	url: `git+https://github.com/${constants.owner}/${repoName}.git`
});

export default (packageName: string, repoName: string) => ({
	// Put prettier in first position so the next generated files will get formatted
	[constants.prettierConfigFileName]: prettierConfigTemplate,
	[constants.gitIgnoreFileName]: gitIgnoreTemplate,
	[constants.prettierIgnoreFileName]: prettierIgnore,
	[constants.baseTsConfigFileName]: tsConfigBase,
	[constants.nonProjectTsConfigFileName]: tsConfigOthers,
	[constants.tsConfigFileName]: tsConfig,
	[constants.tscLintTsConfigFileName]: tsConfigCheck,
	[constants.viteConfigFileName]: 'export default {};',
	[constants.licenseFileName]: licenseTemplate,
	[constants.packageJsonFileName]: {
		name: `${constants.devScope}/${packageName}`,
		type: 'module',
		sideEffects: [],
		author: 'Jérôme MARTIN',
		license: 'MIT',
		repository:
			packageName === repoName ?
				gitRepo(repoName)
			:	{
					...gitRepo(repoName),
					directory: `packages/${packageName}`
				},
		bugs: {
			url: `https://github.com/${constants.owner}/${repoName}/issues`
		},
		homepage:
			`https://github.com/${constants.owner}/${repoName}` +
			(packageName === repoName ? '' : `/tree/master/packages/${packageName}`),
		scripts: {
			tscheck: `tsc -b ${constants.tscLintTsConfigFileName} --force `,
			lint: 'eslint .',
			'update-config-files': 'update-config-files',
			'clean-config-files': `shx rm -rf ${constants.packageJsonFileName} && shx rm -rf ${constants.tsConfigFileName}`
		}
	}
});
