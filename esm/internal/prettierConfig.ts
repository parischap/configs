import * as constants from './constants.js';

export default {
	useTabs: true,
	overrides: [
		{
			files: constants.allJsFiles,
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
