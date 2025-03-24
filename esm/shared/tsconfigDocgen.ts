import * as constants from './constants.js';
import * as utils from './utils.js';

export default {
	extends: './tsconfig.base.json',
	include: constants.allTsFiles.map(utils.fromOsPathToPosixPath),
	compilerOptions: {
		noEmit: true,
		lib: ['ESNext'],
		types: ['node']
	}
};
