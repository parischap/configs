import * as constants from './constants.js';
import * as utils from './utils.js';

export default {
	extends: './tsconfig.base.json',
	include: constants.topJsFiles.map(utils.fromOsPathToPosixPath),
	exclude: [constants.viteTimeStampFileNamePattern],
	compilerOptions: {
		lib: ['ESNext'],
		types: ['node'],
		allowJs: true,
		checkJs: true
	}
};
