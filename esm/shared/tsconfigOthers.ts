import { join } from 'node:path';
import * as constants from './constants.js';
import * as utils from './utils.js';

export default {
	extends: './tsconfigInternalBase.json',
	include: constants.allJsFiles.map(utils.fromOsPathToPosixPath),
	exclude: [
		...constants.allProjectFiles.map(utils.fromOsPathToPosixPath),
		...constants.allNpmFiles.map(utils.fromOsPathToPosixPath),
		...constants.allProdFiles.map(utils.fromOsPathToPosixPath),
		constants.viteTimeStampFileNamePattern
	],
	compilerOptions: {
		rootDir: '.',
		tsBuildInfoFile: utils.fromOsPathToPosixPath(
			join(constants.tsBuildInfoFolderName, `others${constants.tsBuildInfoFolderName}`)
		),
		outDir: utils.fromOsPathToPosixPath(join(constants.prodFolderName, 'others')),
		lib: ['ESNext'],
		types: ['node'],
		allowJs: true,
		checkJs: true
	}
};
