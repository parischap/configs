// Whatever external package this file uses must be added as peerDependency
export const owner = 'parischap';
export const scope = '@' + owner;
export const devScope = scope + '-dev';
export const slashedScope = scope + '/';
export const slashedDevScope = devScope + '/';

export const packageManager = `pnpm@10.19.0`

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
// Needs to be a .js file because will be imported in prod by a Node (non-typescript) executable
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

export const configsPackageName = 'configs'
export const testUtilsPackageName = 'test-utils'

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

export const lintingAndFormattingDependencies = {
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
    }

export const globalDependencies = {
      globals: '^16.4.0',
      '@tsconfig/strictest': '^2.0.6',
      shx: '^0.4.0',
      // Use `file:` not `link:` so binaries get installed. But pnpm i must be run whenever the configs package gets modified for the modifications to take effect
      [`@parischap/${configsPackageName}`]: `file:../${configsPackageName}/dist/.`,
      [`@parischap/${testUtilsPackageName}`]: '^0.14.0',
      '@types/node': '^24.7.0',
      typescript: '^5.9.3',
      // tsx must be installed because it is used by docgen and not requested as a dev-dependency
      tsx: '^4.20.6',
      vitest: '^3.2.4',
      // At some point, rolldown will be default in vite. But not the case for the moment
      vite: 'npm:rolldown-vite@^7.1.17',
      'vite-node': '^3.2.4',
      madge: '^8.0.0',
      '@babel/core': '^7.28.4',
      '@babel/plugin-transform-export-namespace-from': '^7.27.1',
      '@babel/plugin-transform-modules-commonjs': '^7.27.1',
      'babel-plugin-annotate-pure-calls': '^0.5.0',
      '@babel/cli': '^7.28.3',
      '@effect/docgen': '^0.5.2',
      ...lintingAndFormattingDependencies
    }
