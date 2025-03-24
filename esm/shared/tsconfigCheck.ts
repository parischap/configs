import { join } from 'node:path';
import * as constants from './constants.js';
import * as utils from './utils.js';

export default {
	extends: './tsconfigEsm.json',
	compilerOptions: {
		noEmit: true,
		tsBuildInfoFile: utils.fromOsPathToPosixPath(
			join(
				constants.tsBuildInfoFolderName,
				`${constants.tscLintMark}${constants.tsBuildInfoFolderName}`
			)
		)
	}
};
