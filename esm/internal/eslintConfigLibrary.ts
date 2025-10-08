import { type ConfigObject } from '@eslint/core';
import globals from 'globals';
import * as constants from './constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';

/* eslint-disable-next-line functional/prefer-immutable-types */
const _default: Array<ConfigObject> = [
	...eslintInternalConfigBase,
	{
		files: constants.allProjectJsFiles,
		languageOptions: {
			globals: {
				...globals['shared-node-browser']
			}
		}
	}
];

export default _default;
