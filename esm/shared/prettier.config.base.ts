import * as constants from './constants.js';
import * as utils from './utils.js';

export default {
	useTabs: true,
	overrides: [
		{
			files: constants.allJsFiles.map(utils.fromOsPathToPosixPath),
			options: {
				semi: true,
				singleQuote: true,
				trailingComma: 'none',
				printWidth: 100,
				experimentalTernaries: true,
				plugins: ['prettier-plugin-jsdoc']
			}
		}
	]
};
