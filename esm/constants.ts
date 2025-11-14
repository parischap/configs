export const owner = 'parischap';
export const scope = '@' + owner;
export const devScope = scope + '-dev';
export const slashedScope = scope + '/';
export const slashedDevScope = devScope + '/';

export const packageManager = `pnpm@10.22.0`;

export const versionControlService = 'github.com';
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
export const configFilename = 'project.config.ts';
export const prettierConfigFilename = 'prettier.config.ts';
export const eslintConfigFilename = 'eslint.config.ts';
export const madgeConfigFilename = '.madgerc';
export const readMeFilename = 'README.md';
export const licenseFilename = 'LICENSE';
export const pnpmWorkspaceFilename = 'pnpm-workspace.yaml';
export const pnpmLockFilename = 'pnpm-lock.yaml';
export const actionFilename = 'action.yml';
export const viteConfigFilename = 'vite.config.ts';
export const viteTimeStampFilenamePattern = 'vite.config.ts.timestamp-*.mjs';
export const vitestConfigFilename = 'vitest.config.ts';
export const vscodeWorkspaceFilenamePattern = '*.code-workspace';

export const configsPackageName = 'configs';
export const testUtilsPackageName = 'test-utils';
export const topPackageName = 'myeffectdevs';

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
  '@eslint/json': '^0.14.0',
  prettier: '^3.6.2',
  'typescript-eslint': '^8.45.0',
  'prettier-plugin-jsdoc': '^1.3.3',
  'eslint-plugin-import-x': '4.16.1',
  'eslint-import-resolver-typescript': '4.4.4',
};

// These dependencies are necessary at the top
export const topDependencies = {
  // Used by vscode plugins
  ...lintingAndFormattingDependencies,
  // Used by vscode, see `typescript.tsdk` key of settings.json
  typescript: '^5.9.3',
  // Needed by the vscode vitest plugin
  vitest: '^4.0.7',
  // Necessary at the top because used by top tsconfig.json
  '@tsconfig/strictest': '^2.0.6',
  // Necessary at the top because used by top tsconfig.json
  '@types/node': '^24.7.0',
  // Used by eslint and the `update-config-files` script
  jiti: '2.6.1',
};

export const docGenDependencies = {
  '@effect/docgen': '^0.5.2',
  // tsx must be installed because it is used by docgen (strangely, it is not requested as a dev-dependency
  tsx: '^4.20.6',
};

export const effectDependencies = {
  effect: '^3.18.1',
};

export const effectPlatformDependencies = {
  '@effect/platform': '^0.93.0',
  '@effect/platform-node': '^0.100.0',
  '@effect/cluster': '^0.52.5',
  '@effect/rpc': '^0.72.1',
  '@effect/sql': '^0.48.0',
  '@effect/workflow': '^0.12.2',
};

export const repoOnlyDependencies = {
  ...effectPlatformDependencies,
  '@effect/language-service': '^0.55.2',
  '@effect/experimental': '0.57.0',
  // Better have the same version across the whole repo
  shx: '^0.4.0',
  // Better have the same version across the whole repo
  madge: '^8.0.0',
  // At some point, rolldown will be default in vite. But not the case for the moment
  // Not necessary in all configurations but vite is installed by vitest in any case so better install it here
  vite: 'npm:rolldown-vite@^7.1.17',
  // Not necessary in all configurations but better have the same version across the whole repo
  'vite-node': '^5.0.0',
  // Not necessary in all configurations but best if shared when neeeded
  '@babel/core': '^7.28.4',
  'babel-plugin-annotate-pure-calls': '^0.5.0',
  '@babel/plugin-transform-export-namespace-from': '^7.27.1',
  '@babel/plugin-transform-modules-commonjs': '^7.27.1',
};
