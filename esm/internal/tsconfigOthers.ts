import * as constants from './constants.js';

export default {
	extends: './tsconfig.base.json',
	include: constants.allJsFiles,
	exclude: [
		...constants.allProjectFiles,
		...constants.allNpmFiles,
		...constants.allProdFiles,
		constants.viteTimeStampFileNamePattern
	],
	compilerOptions: {
		rootDir: '.',
		tsBuildInfoFile: `${constants.tsBuildInfoFolderName}/others${constants.tsBuildInfoFolderName}`,
		outDir: `${constants.prodFolderName}/others`,
		lib: ['ESNext'],
		types: ['node'],
		allowJs: true,
		checkJs: true
	}
};
