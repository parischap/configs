import { type ConfigObject } from '@eslint/core';
import globals from 'globals';
import * as constants from './constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';

const _default: Array<ConfigObject> = [
	...eslintInternalConfigBase,
	{
		files: constants.allProjectJsFiles,
		languageOptions: {
			globals: {
				...globals.browser
			}
		}
	}
];
export default _default;
