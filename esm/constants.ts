export const owner = 'parischap';
export const scope = '@' + owner;
export const devScope = scope + '-dev';
export const slashedScope = scope + '/';
export const slashedDevScope = devScope + '/';

export const packageManager = `pnpm@10.23.0`;

export const versionControlService = 'github.com';

export const nonProjectMark = 'others';
export const projectMark = 'esm';
export const docgenMark = 'docgen';

export const tsExecuter = 'jiti';

export const githubWorkflowsPublishFilename = 'publish.yml';
export const githubWorkflowsPagesFilename = 'pages.yml';
export const docsIndexMdFilename = 'index.md';
export const docsConfigYmlFilename = '_config.yml';
export const rmrfFilename = 'rmrf.ts';
export const mkdirpFilename = 'mkdirp.ts';
export const docgenConfigFilename = 'docgen.json';
export const gitIgnoreFilename = '.gitignore';
export const prettierIgnoreFilename = '.prettierignore';
export const packageJsonFilename = 'package.json';
export const tsConfigFilename = 'tsconfig.json';
export const tsConfigBaseFilename = `tsconfig.base.json`;
export const tsConfigDocGenFilename = `tsconfig.${docgenMark}.json`;
export const tsConfigProjectFilename = `tsconfig.${projectMark}.json`;
export const tsConfigNonProjectFilename = `tsconfig.${nonProjectMark}.json`;
export const configFilename = 'project.config.json';
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
export const projectsFolderName = 'projects';
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

const fromExtensionsToPaths = (extensions: ReadonlyArray<string>, prefix: string): Array<string> =>
  extensions.map((ext) => prefix + ext);
export const allTsFiles = tsExtensions.map((ext) => allFiles + ext);
export const allJsFiles = fromExtensionsToPaths(jsExtensions, allFiles);
export const allHtmlFiles = fromExtensionsToPaths(htmlExtensions, allFiles);
export const allMdFiles = fromExtensionsToPaths(mdExtensions, allFiles);
export const allJsonFiles = fromExtensionsToPaths(jsonExtensions, allFiles);
export const allJsoncFiles = fromExtensionsToPaths(jsoncExtensions, allFiles);
export const allJson5Files = fromExtensionsToPaths(json5Extensions, allFiles);
export const allYmlFiles = fromExtensionsToPaths(ymlExtensions, allFiles);
export const allProjectJsFiles = fromExtensionsToPaths(
  jsExtensions,
  `${projectFolderName}/${allFiles}`,
);
export const allJsInMdFiles = fromExtensionsToPaths(jsExtensions, allFilesInMd);

/* Do not use carret at start of dependency versions because we could end up with different versions in the diverse projects. Set one version and update it regularly */

export const effectDependencies = {
  effect: '3.19.6',
};

export const effectPlatformDependencies = {
  '@effect/platform': '0.93.3',
  '@effect/platform-node': '0.101.1',
  '@effect/cluster': '0.53.4',
  '@effect/rpc': '0.72.2',
  '@effect/sql': '0.48.0',
  '@effect/workflow': '0.13.0',
};

export const docGenDependencies = {
  '@effect/docgen': '0.5.2',
  // tsx must be installed because it is used by docgen (strangely, it is not requested as a dev-dependency
  tsx: '4.20.6',
};

export const testDependencies = {
  vitest: '4.0.7',
};

// Add here all devDependencies used by configInternalBase.ts, be it in scripts, github actions, installed config files...
export const baseDevDependencies = {
  // Used by the eslint.config.ts file
  globals: '16.4.0',
  // Used by the lint script and vscode and its plugins
  eslint: '9.39.1',
  // Used by the eslint.config.ts file
  '@eslint/js': '9.39.1',
  // Used by the eslint.config.ts file
  '@eslint/json': '0.14.0',
  // Used by the eslint.config.ts file
  '@eslint/markdown': '7.5.1',
  // Used by the eslint.config.ts file
  '@html-eslint/eslint-plugin': '0.49.0',
  // Used as peerDependency of '@html-eslint/eslint-plugin'
  '@html-eslint/parser': '0.49.0',
  // Used by the eslint.config.ts file
  'eslint-config-prettier': '10.1.8',
  // Used by the eslint.config.ts file
  'eslint-plugin-functional': '9.0.2',
  // Used by the eslint.config.ts file
  //'eslint-plugin-import-x': '4.16.1',
  // Used as peerDependency of 'eslint-plugin-import-x'
  //'eslint-import-resolver-typescript': '4.4.4',
  // Used by the eslint.config.ts file
  'eslint-plugin-yml': '1.19.0',
  // Used by the eslint.config.ts file
  'typescript-eslint': '8.47.0',
  // Used by the script format and by vscode and its plugins
  prettier: '3.6.2',
  // Used by the prettier.config.ts file
  'prettier-plugin-jsdoc': '1.5.0',
  // Used by tsconfig.base.json
  '@tsconfig/strictest': '2.0.8',
  // Used as plugin by tsconfig.base.json
  '@effect/language-service': '0.56.0',
  // Used by tsconfig.docgen.json and tsconfig.others.json
  '@types/node': '24.10.1',
  // Used by the tscheck script and by vscode and its plugins
  typescript: '5.9.3',
  // Used as peerDependency of eslint, to run the examples scripts and by the update-config-files script
  jiti: '2.6.1',
};

// Add here all devDependencies used by configInternalRepo.ts, be it in scripts, github actions, installed config files...
export const repoDevDependencies = {};

// Add here all devDependencies used by configInternalProject.ts, be it in scripts, github actions, installed config files...
export const packageDevDependencies = {
  // Used by the test script
  ...testDependencies,
  madge: '8.0.0',
  /* All packages use Effect and all may use @effect/experimental. @effect/experimental is included in the esm modules and should therefore be included as a dependency. But @effect/experimental is for debugging and performance optimization only. So the code that uses it must be removed or by-passed in prod. So this dependency must not be shipped in prod: it's a devDependency. */
  '@effect/experimental': '0.57.4',
  // Used as peerDependency by @effect/experimental
  ...effectPlatformDependencies,
  // At some point, rolldown will be default in vite. But not the case for the moment
  // Not necessary in all configurations but vite is installed by vitest in any case so better install it here
  vite: 'npm:rolldown-vite@7.2.7',
  // Not necessary in all configurations but best if shared when neeeded
  '@babel/core': '7.28.5',
  'babel-plugin-annotate-pure-calls': '0.5.0',
  '@babel/plugin-transform-export-namespace-from': '7.27.1',
  '@babel/plugin-transform-modules-commonjs': '7.27.1',
};

// Add here all devDependencies used by configInternalTop.ts, be it in scripts, github actions, installed config files...
export const topDevDependencies = {
  // Used by the tscheck script and by vscode and its plugins
  ...testDependencies,
};
