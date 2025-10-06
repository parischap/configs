import { type ConfigObject } from '@eslint/core';
import globals from 'globals';
import * as constants from './constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';

const _default: ReadonlyArray<ConfigObject> = [
	...eslintInternalConfigBase,
	{
		files: constants.allProjectJsFiles,
		languageOptions: {
			globals: {
				...globals.nodeBuiltin
			}
		}
	}
];

export default _default;
