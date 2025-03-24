import globals from 'globals';
import * as constants from './constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';
import * as utils from './utils.js';

export default [
	...eslintInternalConfigBase,
	{
		files: constants.allProjectFiles.map(utils.fromOsPathToPosixPath),
		languageOptions: {
			globals: {
				...globals['shared-node-browser']
			}
		}
	}
];
