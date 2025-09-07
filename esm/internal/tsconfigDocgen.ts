import * as constants from './constants.js';

export default {
	extends: './tsconfig.base.json',
	include: constants.allTsFiles,
	compilerOptions: {
		noEmit: true,
		lib: ['ESNext'],
		types: ['node']
	}
};
