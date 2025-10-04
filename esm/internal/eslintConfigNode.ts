import globals from 'globals';
import { type ConfigArray } from 'typescript-eslint';
import * as constants from './constants.js';
import eslintInternalConfigBase from './eslintInternalConfigBase.js';

const _default:ConfigArray = [
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

export default _default