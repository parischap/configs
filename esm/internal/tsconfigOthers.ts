import * as constants from './constants.js';

export default {
	extends: './tsconfig.base.json',
	exclude: [
		constants.projectFolderName,
		constants.npmFolderName,
		constants.prodFolderName,
		constants.viteTimeStampFileNamePattern
	],
	compilerOptions: {
		rootDir: '.',
		lib: ['ESNext'],
		types: ['node'],
		allowJs: true,
		checkJs: true
	}
};
