import * as constants from './constants.js';

const gitRepo = (repoName: string) => ({
	type: 'git',
	url: `git+https://github.com/${constants.owner}/${repoName}.git`
});

export default (packageName: string, repoName: string) => ({
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
});
