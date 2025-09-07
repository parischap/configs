import * as constants from './constants.js';

export default {
	extends: './tsconfig.base.json',
	include: constants.allProjectFiles,
	compilerOptions: {
		rootDir: constants.projectFolderName,
		tsBuildInfoFile: `${constants.tsBuildInfoFolderName}/${constants.projectMark}${constants.tsBuildInfoFolderName}`,
		declarationDir: `${constants.prodFolderName}/${constants.typesFolderName}`,
		declarationMap: true,
		outDir: `${constants.prodFolderName}/${constants.projectFolderName}`
	}
};
