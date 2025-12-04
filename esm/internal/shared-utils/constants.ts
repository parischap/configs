// This module must not import any external dependency. It must be runnable without a package.json
export const owner = 'parischap';
export const scope = '@' + owner;
export const devScope = scope + '-dev';
export const slashedScope = scope + '/';
export const slashedDevScope = devScope + '/';

export const packageManager = `pnpm@10.24.0`;

export const versionControlService = 'github.com';

export const srcMark = 'esm';
export const testsMark = 'tests';
export const examplesMark = 'examples';
export const othersMark = 'others';

export const docgenMark = 'docgen';

export const tsExecuter = 'jiti';

export const githubWorkflowsPublishFilename = 'publish.yml';
export const githubWorkflowsPagesFilename = 'pages.yml';
export const docsIndexMdFilename = 'index.md';
export const indexTsFilename = 'index.ts';
export const docsConfigYmlFilename = '_config.yml';
export const docgenConfigFilename = 'docgen.json';
export const gitIgnoreFilename = '.gitignore';
export const prettierIgnoreFilename = '.prettierignore';
export const packageJsonFilename = 'package.json';
export const tsConfigFilename = 'tsconfig.json';
export const tsConfigBaseFilename = `tsconfig.base.json`;
export const tsConfigDocGenFilename = `tsconfig.${docgenMark}.json`;
export const tsConfigSrcFilename = `tsconfig.${srcMark}.json`;
export const tsConfigTestsFilename = `tsconfig.${testsMark}.json`;
export const tsConfigExamplesFilename = `tsconfig.${examplesMark}.json`;
export const tsConfigOthersFilename = `tsconfig.${othersMark}.json`;
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
export const topPackageName = 'myeffectdevs';

export const internalFolderName = 'internal';
export const tsBuildInfoFolderName = '.tsbuildinfo';
export const sourceFolderName = srcMark;
export const examplesFolderName = examplesMark;
export const testsFolderName = testsMark;
export const othersFolderName = othersMark;
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

export const binariesPath = (isConfigsPackage: boolean) =>
  (isConfigsPackage ? '' : `${npmFolderName}/${scope}/${configsPackageName}/`)
  + `${sourceFolderName}/${binariesFolderName}`;

export const allFilesPattern = '**/*';
const allFilesInMd = allFilesPattern + '.md/*';

export const tsExtensions = ['.ts', '.mts', '.cts'];
export const javaScriptExtensions = [...tsExtensions, '.js', '.mjs', '.cjs'];
export const htmlExtensions = ['.html', '.htm'];
export const mdExtensions = ['.md'];
export const jsonExtensions = ['.json'];
export const jsoncExtensions = ['.jsonc'];
export const json5Extensions = ['.json5'];
export const ymlExtensions = ['.yml', '.yaml'];

export const tsConfigStyleIncludeForSourceFiles = `${sourceFolderName}/${allFilesPattern}`;
export const tsConfigStyleIncludeForTestsFiles = `${testsFolderName}/${allFilesPattern}`;
export const tsConfigStyleIncludeForExampleFiles = `${examplesFolderName}/${allFilesPattern}`;

export const eslintStyleIncludeForSourceFiles = javaScriptExtensions.map(
  (extension) => `${sourceFolderName}/${allFilesPattern}${extension}`,
);
export const eslintStyleExcludeForSourceFiles = `${sourceFolderName}/**`;

const prefixWith =
  (prefix: string) =>
  (as: ReadonlyArray<string>): Array<string> =>
    as.map((a) => prefix + a);
const prefixWithAllFilePatterns = prefixWith(allFilesPattern);
export const allTsFiles = prefixWithAllFilePatterns(tsExtensions);
export const allJavaScriptFiles = prefixWithAllFilePatterns(javaScriptExtensions);
export const allHtmlFiles = prefixWithAllFilePatterns(htmlExtensions);
export const allMdFiles = prefixWithAllFilePatterns(mdExtensions);
export const allJsonFiles = prefixWithAllFilePatterns(jsonExtensions);
export const allJsoncFiles = prefixWithAllFilePatterns(jsoncExtensions);
export const allJson5Files = prefixWithAllFilePatterns(json5Extensions);
export const allYmlFiles = prefixWithAllFilePatterns(ymlExtensions);
export const allJsInMdFiles = prefixWith(allFilesInMd)(javaScriptExtensions);

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

// Add here all dependencies used by modules exported in index.ts.
export const configsPeerDependencies = {
  // Used by the eslintConfig.ts file
  '@eslint/js': '9.39.1',
  // Used by the eslintConfig.ts file
  '@eslint/json': '0.14.0',
  // Used by the eslintConfig.ts file
  '@eslint/markdown': '7.5.1',
  // Used by the eslintConfig.ts file
  '@html-eslint/eslint-plugin': '0.49.0',
  // Used as peerDependency of '@html-eslint/eslint-plugin'
  '@html-eslint/parser': '0.49.0',
  // Used by the eslintConfig.ts file
  'eslint-config-prettier': '10.1.8',
  // Used by the eslintConfig.ts file
  'eslint-plugin-functional': '9.0.2',
  // Used by the eslintConfig.ts file
  //'eslint-plugin-import-x': '4.16.1',
  // Used as peerDependency of 'eslint-plugin-import-x'
  //'eslint-import-resolver-typescript': '4.4.4',
  // Used by the eslintConfig.ts file
  'eslint-plugin-yml': '1.19.0',
  // Used by the lint script, vscode and its plugins
  eslint: '9.39.1',
  // Used by the eslintConfig file
  globals: '16.4.0',
  // Used by the eslintConfig file
  'typescript-eslint': '8.47.0',
  // Used by the prettierConfig.ts file
  'prettier-plugin-jsdoc': '1.5.0',
};

// Add here all devDependencies used by configInternalBase.ts, be it in scripts, github actions, installed config files...
export const baseDevDependencies = {
  // Used by the script format and by vscode and its plugins
  prettier: '3.6.2',
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
  // Used by the test script
  vitest: '4.0.7',
};

// Add here all devDependencies used by configInternalProject.ts, be it in scripts, github actions, installed config files...
export const projectDevDependencies = {
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

export const autoGeneratedFileWarning =
  '// ************** This file was automatically generated. DO NOT MODIFY ************************';
