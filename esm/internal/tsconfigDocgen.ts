import * as constants from './constants.js';

export default {
	extends: './tsconfig.base.json',
	include: `${constants.projectFolderName}/${constants.allSubFolders}`,
	compilerOptions: {
		noEmit: true,
		lib: ['ESNext'],
		types: ['node'],
		allowJs: false,
		checkJs: false,
	}
};
