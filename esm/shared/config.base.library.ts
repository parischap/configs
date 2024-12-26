import * as constants from './constants.js';
import eslintConfigLibraryTemplate from './eslint.config.library.template.js';
import tsConfigSrcLibrary from './tsconfig.src.library.js';

export default {
	[constants.projectTsConfigFileName]: tsConfigSrcLibrary,
	[constants.eslintConfigFileName]: eslintConfigLibraryTemplate
};
