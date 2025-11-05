/**
 * Posix paths are understood in all environments (including Windows). And configuration files (like package.json, `tsconfig.json`,...) only understand Posix paths. For that reason, this package works only with Posix paths. Only issue is when reading a directory with the `{recursive:true}` option, we get some local-system paths that we must therefore convert with the `utils.fromOsPathToPosixPath` function
 **/

export const owner = 'parischap';
export const scope = '@' + owner;
export const devScope = scope + '-dev';
export const slashedScope = scope + '/';
export const slashedDevScope = devScope + '/';

export const packageManager = `pnpm@10.20.0`;

export const nonProjectMark = 'others';
export const projectMark = 'esm';
export const docgenMark = 'docgen';

export const tsExecuter = 'vite-node';

export const docgenConfigFilename = 'docgen.json';
export const gitIgnoreFilename = '.gitignore';
export const prettierIgnoreFilename = '.prettierignore';
export const packageJsonFilename = 'package.json';
export const tsConfigFilename = 'tsconfig.json';
export const tsConfigBaseFilename = `tsconfig.base.json`;
export const tsConfigDocGenFilename = `tsconfig.${docgenMark}.json`;
export const tsConfigProjectFilename = `tsconfig.${projectMark}.json`;
export const tsConfigNonProjectFilename = `tsconfig.${nonProjectMark}.json`;
// Needs to be a .js file because will be imported in prod by a Node (non-typescript) executable
export const configFilename = 'project.config.js';
export const prettierConfigFilename = 'prettier.config.js';
export const eslintConfigFilename = 'eslint.config.js';
export const madgeConfigFilename = '.madgerc';
export const readMeFilename = 'README.md';
export const licenseFilename = 'LICENSE';
export const configsManagerInitFilename = 'init.mjs';
export const pnpmWorkspaceFilename = 'pnpm-workspace.yaml';
export const pnpmLockFilename = 'pnpm-lock.yaml';
export const actionFilename = 'action.yml';
export const viteConfigFilename = 'vite.config.js';
export const viteTimeStampFilenamePattern = 'vite.config.ts.timestamp-*.mjs';
export const vitestConfigFilename = 'vitest.config.js';
export const vitestWorkspaceConfigFilename = 'vitest.workspace.js';
export const vscodeWorkspaceFilenamePattern = '*.code-workspace';

export const configsPackageName = 'configs';
export const testUtilsPackageName = 'test-utils';

export const internalFolderName = 'internal';
export const tsBuildInfoFolderName = '.tsbuildinfo';
export const projectFolderName = projectMark;
export const othersFolderName = 'others';
export const examplesFolderName = 'examples';
export const testsFolderName = 'tests';
export const prodFolderName = 'dist';
export const typesFolderName = 'dts';
export const commonJsFolderName = 'cjs';
export const binariesFolderName = 'bin';
export const npmFolderName = 'node_modules';
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

export const allFiles = '**/*';
const allFilesInMd = allFiles + '.md/*';

export const tsExtensions = ['.ts', '.mts', '.cts'];
export const jsExtensions = [...tsExtensions, '.js', '.mjs', '.cjs'];
export const cjsExtensions = ['cts', '.cjs'];
export const htmlExtensions = ['.html', '.htm'];
export const mdExtensions = ['.md'];
export const jsonExtensions = ['.json'];
export const jsoncExtensions = ['.jsonc'];
export const json5Extensions = ['.json5'];
export const ymlExtensions = ['.yml', '.yaml'];

export const allTsFiles = tsExtensions.map((ext) => allFiles + ext);
export const allJsFiles = jsExtensions.map((ext) => allFiles + ext);
export const allCjsFiles = cjsExtensions.map((ext) => allFiles + ext);
export const allHtmlFiles = htmlExtensions.map((ext) => allFiles + ext);
export const allMdFiles = mdExtensions.map((ext) => allFiles + ext);
export const allJsonFiles = jsonExtensions.map((ext) => allFiles + ext);
export const allJsoncFiles = jsoncExtensions.map((ext) => allFiles + ext);
export const allJson5Files = json5Extensions.map((ext) => allFiles + ext);
export const allYmlFiles = ymlExtensions.map((ext) => allFiles + ext);
export const allProjectJsFiles = jsExtensions.map(
  (ext) => `${projectFolderName}/${allFiles}${ext}`,
);
export const allJsInMdFiles = jsExtensions.map((ext) => allFilesInMd + ext);

export const topJsFiles = jsExtensions.map((ext) => '*' + ext);

// These dependencies are those that are used by eslintInternalConfigBase.js and prettierConfig.js
export const lintingAndFormattingDependencies = {
  globals: '^16.4.0',
  eslint: '^9.37.0',
  '@eslint/eslintrc': '^3.3.1',
  '@eslint/js': '^9.37.0',
  'eslint-config-prettier': '^10.1.8',
  'eslint-plugin-functional': '^9.0.2',
  'eslint-plugin-yml': '^1.19.0',
  '@eslint/markdown': '^7.3.0',
  '@html-eslint/eslint-plugin': '^0.47.0',
  '@html-eslint/parser': '^0.47.0',
  '@eslint/json': '^0.13.2',
  prettier: '^3.6.2',
  'typescript-eslint': '^8.45.0',
  'prettier-plugin-jsdoc': '^1.3.3',
  //'eslint-plugin-import': 'latest',
  //'@typescript-eslint/parser': 'latest',
  //'eslint-import-resolver-typescript': 'latest',
};
