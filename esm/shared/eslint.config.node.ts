import globals from 'globals';
import * as constants from './constants.js';
import eslintconfigBase from './eslint.config.base.js';
import * as utils from './utils.js';

export default [
	...eslintconfigBase,
	{
		files: constants.allProjectFiles.map(utils.fromOsPathToPosixPath),
		languageOptions: {
			globals: {
				...globals.nodeBuiltin
			}
		}
	}
];
