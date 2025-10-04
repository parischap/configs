import * as constants from './constants.js';

export default {
	extends: './tsconfig.base.json',
	include: [`${constants.projectFolderName}/${constants.allSubFolders}`],
	compilerOptions: {
		rootDir: constants.projectFolderName,
		declarationDir: `${constants.prodFolderName}/${constants.typesFolderName}`,
		declarationMap: true,
		outDir: `${constants.prodFolderName}/${constants.projectFolderName}`,
		allowJs: false,
		checkJs: false,
	}
};
