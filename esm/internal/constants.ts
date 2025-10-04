export const effectVersion = '^3.18.1';
export const effectPlatformNodeVersion = '^0.98.3';
export const effectPlatformVersion = '^0.92.1';
export const effectExperimentalVersion = '^0.56.0';
export const effectLanguageServiceVersion = '^0.41.1';

export const effectLibVersion = '^0.11.0';
export const ansiStylesVersion = '^0.2.6';
export const prettyPrintVersion = '^0.3.7';
export const conversionsVersion = '^0.8.0';

export const pnpmVersion = '10.15.1';

export const owner = 'parischap';
export const scope = '@' + owner;
export const devScope = scope + '-dev';
export const slashedScope = scope + '/';
export const slashedDevScope = devScope + '/';

export const nonProjectMark = 'others';
export const projectMark = 'esm';
export const docgenMark = 'docgen';

export const tsExecuter = 'vite-node';

export const docgenConfigFileName = 'docgen.json';
export const gitIgnoreFileName = '.gitignore';
export const prettierIgnoreFileName = '.prettierignore';
export const packageJsonFileName = 'package.json';
export const tsConfigFileName = 'tsconfig.json';
export const baseTsConfigFileName = `tsconfig.base.json`;
export const docgenTsConfigFileName = `tsconfig.${docgenMark}.json`;
export const projectTsConfigFileName = `tsconfig.${projectMark}.json`;
export const nonProjectTsConfigFileName = `tsconfig.${nonProjectMark}.json`;
export const configFileName = 'project.config.js';
export const prettierConfigFileName = 'prettier.config.js';
export const eslintConfigFileName = 'eslint.config.js';
export const madgeConfigFileName = '.madgerc';
export const viteConfigFileName = 'vite.config.ts';
export const viteTimeStampFileNamePattern = 'vite.config.ts.timestamp-*.mjs';
export const readMeFileName = 'README.md';
export const licenseFileName = 'LICENSE';
export const configsManagerInitFileName = 'init.mjs';
export const pnpmWorkspaceFileName = 'pnpm-workspace.yaml';
export const pnpmLockFileName = 'pnpm-lock.yaml';
export const actionFileName = 'action.yml';
export const vscodeWorkspaceFileNamePattern = '*.code-workspace';

export const internalFolderName = 'internal';
export const tsBuildInfoFolderName = '.tsbuildinfo';
export const projectFolderName = projectMark;
export const examplesFolderName = 'examples';
export const testsFolderName = 'test';
export const prodFolderName = 'dist';
export const typesFolderName = 'dts';
export const commonJsFolderName = 'cjs';
export const binariesFolderName = 'bin';
export const npmFolderName = 'node_modules';
export const staticFolderName = 'public';
export const vscodeFolderName = '.vscode';
export const gitFolderName = '.git';
export const packagesFolderName = 'packages';
export const starterFolderName = 'init';
export const githubFolderName = '.github';
export const workflowsFolderName = 'workflows';
export const actionsFolderName = 'actions';
export const docsFolderName = 'docs';
export const docgenFolderName = 'modules';
export const readmeAssetsFolderName = 'readme-assets';

export const allSubFolders = '**/*';
//export const subRepoPath = `**/${packagesFolderName}/*`;

/*export const jsInMdExtensions = [
	...mdExtensions.map((ext) => `${ext}/*.js`),
	...mdExtensions.map((ext) => `${ext}/*.ts`)
];*/
export const tsExtensions = ['.ts', '.mts', '.cts'];
export const jsExtensions = [...tsExtensions, '.js', '.mjs', '.cjs'];
export const cjsExtensions = ['cts', '.cjs'];
export const htmlExtensions = ['.html', '.htm'];
//export const mdExtensions = ['.md'];
//export const jsonExtensions = ['.json'];
export const ymlExtensions = ['.yml', '.yaml'];

export const allTsFiles = tsExtensions.map((ext) => allSubFolders + ext);
export const allJsFiles = jsExtensions.map((ext) => allSubFolders + ext);
export const allCjsFiles = cjsExtensions.map((ext) => allSubFolders + ext);
export const allHtmlFiles = htmlExtensions.map((ext) => allSubFolders + ext);
//export const allMdFiles = mdExtensions.map((ext) => allSubFolders + ext);
//export const allJsonFiles = jsonExtensions.map((ext) => allSubFolders + ext);
export const allYmlFiles = ymlExtensions.map((ext) => allSubFolders + ext);
export const allProjectJsFiles = jsExtensions.map(
	(ext) => `${projectFolderName}/${allSubFolders}${ext}`
);

export const topJsFiles = jsExtensions.map((ext) => '*' + ext);

//export const topRootPath = 'C:/Users/JEROME/Documents/MesDeveloppements/effect';
