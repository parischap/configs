import * as constants from './constants.js';
import docgenConfig from './docgenConfig.js';
import tsconfigDocgen from './tsconfig.docgen.js';

export default {
	[constants.packageJsonFileName]: {
		scripts: {
			docgen: 'docgen'
		}
	},
	[constants.docgenTsConfigFileName]: tsconfigDocgen,
	[constants.docgenConfigFileName]: docgenConfig
};
