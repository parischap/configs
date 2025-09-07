import globals from 'globals';
import * as constants from './constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';

export default [
	...eslintInternalConfigBase,
	{
		files: constants.allProjectFiles,
		languageOptions: {
			globals: {
				...globals['shared-node-browser']
			}
		}
	}
];
