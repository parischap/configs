import * as constants from './constants.js';

export default {
	exports: {
		[`./${constants.staticFolderName}/*`]: {
			require: `./${constants.staticFolderName}/*`
		}
	},
	publishConfig: {
		exports: {
			[`./${constants.staticFolderName}/*`]: {
				require: `./${constants.staticFolderName}/*`
			}
		}
	}
};
