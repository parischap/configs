import { join } from 'node:path';
import * as constants from './constants.js';
import * as utils from './utils.js';

export default {
	extends: './tsconfigInternalBase.json',
	include: constants.allProjectFiles.map(utils.fromOsPathToPosixPath),
	compilerOptions: {
		rootDir: utils.fromOsPathToPosixPath(constants.projectFolderName),
		tsBuildInfoFile: utils.fromOsPathToPosixPath(
			join(
				constants.tsBuildInfoFolderName,
				`${constants.projectMark}${constants.tsBuildInfoFolderName}`
			)
		),
		declarationDir: utils.fromOsPathToPosixPath(
			join(constants.prodFolderName, constants.typesFolderName)
		),
		declarationMap: true,
		outDir: utils.fromOsPathToPosixPath(join(constants.prodFolderName, constants.projectFolderName))
	}
};
