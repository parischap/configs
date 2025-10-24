/**
 * This config implements what is necessary in all situations. It should not be used directly. It is
 * included by config.monorepo.ts, config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
// Whatever external package this file uses must be added as peerDependency
import {
  baseTsConfigFileName,
  eslintConfigFileName,
  gitIgnoreFileName,
  nonProjectTsConfigFileName,
  packageJsonFileName,
  prettierConfigFileName,
  prettierIgnoreFileName,
  projectTsConfigFileName,
  slashedDevScope,
  tsConfigFileName,
  viteConfigFileName,
} from './constants.js';
import eslintConfigBrowser from './eslintConfigBrowser.js';
import eslintConfigLibrary from './eslintConfigLibrary.js';
import eslintConfigNode from './eslintConfigNode.js';
import gitIgnore from './gitIgnore.js';
import prettierConfig from './prettierConfig.js';
import prettierIgnore from './prettierIgnore.js';
import tsConfig from './tsconfig.js';
import tsConfigEsmBrowser from './tsconfigEsmBrowser.js';
import tsConfigEsmLibrary from './tsconfigEsmLibrary.js';
import tsConfigEsmNode from './tsconfigEsmNode.js';
import tsconfigBase from './tsconfigInternalBase.js';
import tsConfigOthers from './tsconfigOthers.js';
import viteConfig from './viteConfig.js';

/**
 * @import {Environment, Config} from "./types.d.ts"
 */

/**
 * @param {Environment} environment
 * @returns {Config}
 */
const environmentConfig = (environment) =>
  environment === 'Browser' ?
    {
      [projectTsConfigFileName]: tsConfigEsmBrowser,
      [eslintConfigFileName]: eslintConfigBrowser,
    }
  : environment === 'Node' ?
    {
      [projectTsConfigFileName]: tsConfigEsmNode,
      [eslintConfigFileName]: eslintConfigNode,
    }
  : {
      [projectTsConfigFileName]: tsConfigEsmLibrary,
      [eslintConfigFileName]: eslintConfigLibrary,
    };

/**
 * @type 
 * ({packageName, environment }: { readonly packageName: string; readonly environment:Environment; })=>Config
 */
export default ({ packageName, environment }) => ({
  [prettierConfigFileName]: prettierConfig,
  [gitIgnoreFileName]: gitIgnore,
  [prettierIgnoreFileName]: prettierIgnore,
  [baseTsConfigFileName]: tsconfigBase,
  [nonProjectTsConfigFileName]: tsConfigOthers,
  [tsConfigFileName]: tsConfig,
  [viteConfigFileName]: viteConfig,
  [packageJsonFileName]: {
    name: `${slashedDevScope}${packageName}`,
    type: 'module',
    author: 'Jérôme MARTIN',
    license: 'MIT',
    scripts: {
      tscheck: `tsc -b ${tsConfigFileName} --force --noEmit`,
      lint: 'eslint .',
      'lint-fix': 'eslint . --fix',
      'lint-rules': 'pnpx @eslint/config-inspector',
      format: 'prettier . --write',
      'update-config-files': 'update-config-files',
      'clean-config-files': `shx rm -f ${packageJsonFileName} && shx rm -f ${tsConfigFileName}`,
      'clean-node-modules': 'shx rm -rf node_modules',
      'reinstall-all-dependencies': 'pnpm i --force',
    },
  },
  ...environmentConfig(environment),
});
