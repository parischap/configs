/**
 * This config implements what is necessary in all situations. It should not be used directly. It is
 * included by config.monorepo.ts, config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  configsPackageName,
  eslintConfigFileName,
  gitIgnoreFileName,
  packageJsonFileName,
  prettierConfigFileName,
  prettierIgnoreFileName,
  slashedDevScope,
  slashedScope,
  tsConfigBaseFileName,
  tsConfigFileName,
  tsConfigNonProjectFileName,
  tsConfigProjectFileName
} from '../constants.js';
import eslintConfigBrowser from './eslintConfigBrowser.js';
import eslintConfigLibrary from './eslintConfigLibrary.js';
import eslintConfigNode from './eslintConfigNode.js';
import gitIgnore from './gitIgnore.js';
import prettierConfig from './prettierConfig.js';
import prettierIgnore from './prettierIgnore.js';
import tsConfig from './tsconfig.js';
import tsconfigBase from './tsconfigBase.js';
import tsConfigNonProject from './tsconfigNonProject.js';
import tsConfigEsmBrowser from './tsconfigProjectBrowser.js';
import tsConfigEsmLibrary from './tsconfigProjectLibrary.js';
import tsConfigEsmNode from './tsconfigProjectNode.js';

/** @import {Environment, Config, ReadonlyStringRecord} from "../types.js" */


/**
 * @param {Environment} environment
 * @returns {Config}
 */
const environmentConfig = (environment) =>
  environment === 'Browser' ?
    {
      [tsConfigProjectFileName]: tsConfigEsmBrowser,
      [eslintConfigFileName]: eslintConfigBrowser,
    }
  : environment === 'Node' ?
    {
      [tsConfigProjectFileName]: tsConfigEsmNode,
      [eslintConfigFileName]: eslintConfigNode,
    }
  : {
      [tsConfigProjectFileName]: tsConfigEsmLibrary,
      [eslintConfigFileName]: eslintConfigLibrary,
    };

/**
 * @param {{
 * readonly packageName: string;
 * readonly description: string;
 * readonly environment:Environment; 
 * readonly scripts: ReadonlyStringRecord}} params
 * @returns {Config}
 */
export default ({ packageName, description, environment,scripts }) => ({
  [prettierConfigFileName]: prettierConfig,
  [gitIgnoreFileName]: gitIgnore,
  [prettierIgnoreFileName]: prettierIgnore,
  [tsConfigBaseFileName]: tsconfigBase,
  [tsConfigNonProjectFileName]: tsConfigNonProject,
  [tsConfigFileName]: tsConfig,
  [packageJsonFileName]: {
    name: `${slashedDevScope}${packageName}`,
    description,
    type: 'module',
    author: 'Jérôme MARTIN',
    license: 'MIT',
    scripts: {
      tscheck: `tsc -b ${tsConfigFileName} --force --noEmit`,
      lint: 'eslint .',
      'lint-rules': 'pnpx @eslint/config-inspector',
      format: 'prettier . --write',
      'update-config-files': 'update-config-files',
      'clean-config-files': `shx rm -f ${packageJsonFileName} && shx rm -f ${tsConfigFileName}`,
      'clean-node-modules': 'shx rm -rf node_modules',
      'reinstall-all-dependencies': 'pnpm i --force',
      ...scripts
    },
    devDependencies:{
      // All packages need a tsconfig, even the root package of a monorepo because it has javascript config files
      '@tsconfig/strictest': '^2.0.6',
      // All packages need to import node types, even the root package of a monorepo because it has javascript config files
      '@types/node': '^24.7.0',
      shx: '^0.4.0',
      /** 
       * Import configs to generate config files for all packages
       * 
       * Use `file:` not `link:` so binaries get installed. But pnpm i must be run whenever the configs package gets modified for the modifications to take effect
       * */ 
      [`${slashedScope}${configsPackageName}`]: `file:../${configsPackageName}/.`,
    }
  },
  ...environmentConfig(environment),
});
