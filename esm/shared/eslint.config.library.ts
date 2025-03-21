import globals from 'globals';
import * as constants from './constants.js';
import eslintconfigInternalBase from './eslint.config.base.js';
import * as utils from './utils.js';

export default [
	...eslintconfigInternalBase,
	{
		files: constants.allProjectFiles.map(utils.fromOsPathToPosixPath),
		languageOptions: {
			globals: {
				...globals['shared-node-browser']
			}
		}
	}
];
