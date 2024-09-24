import * as constants from './constants.js';
export default {
	parseCompilerOptions: `./${constants.docgenTsConfigFileName}`,
	examplesCompilerOptions: `./${constants.docgenTsConfigFileName}`,
	srcDir: `./${constants.projectFolderName}`,
	outDir: 'docs',
	exclude: [`${constants.projectFolderName}/index.ts`]
};
