/** This module must be run from the root directory of the configs package */
import { basename, resolve } from 'node:path/posix';

export const thisPackageName = basename(resolve());
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
export const othersFolderName = 'others';
export const examplesFolderName = 'examples';
export const testsFolderName = 'test';
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

//export const topRootPath = 'C:/Users/JEROME/Documents/MesDeveloppements/effect';
