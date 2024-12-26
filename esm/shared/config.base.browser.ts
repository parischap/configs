import * as constants from './constants.js';
import eslintConfigBrowserTemplate from './eslint.config.browser.template.js';
import tsConfigSrcBrowser from './tsconfig.src.browser.js';

export default {
	[constants.projectTsConfigFileName]: tsConfigSrcBrowser,
	[constants.eslintConfigFileName]: eslintConfigBrowserTemplate
};
