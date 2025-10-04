import * as constants from './constants.js';

export default {
	include: [],
	references: [
		{ path: `./tsconfig.${constants.projectMark}.json` },
		{ path: `./tsconfig.${constants.nonProjectMark}.json` }
	]
};
