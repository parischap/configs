import * as constants from './constants.js';

export default {
	extends: './tsconfig.base.json',
	include: [],
	references: [
		{ path: `./tsconfig.${constants.projectMark}.json` },
		{ path: `./tsconfig.${constants.nonProjectMark}.json` }
	]
};
