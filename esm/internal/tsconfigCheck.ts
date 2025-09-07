import * as constants from './constants.js';

export default {
	extends: './tsconfig.esm.json',
	compilerOptions: {
		noEmit: true,
		tsBuildInfoFile: `${constants.tsBuildInfoFolderName}/${constants.tscLintMark}${constants.tsBuildInfoFolderName}`
	}
};
