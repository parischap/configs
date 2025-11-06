/**
 * This config implements what is necessary in all situations. It should not be used directly. It is
 * included by config.monorepo.ts, config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  eslintConfigFilename,
  packageJsonFilename,
  prettierConfigFilename,
  prettierIgnoreFilename,
  slashedDevScope,
  tsConfigBaseFilename,
  tsConfigFilename,
  tsConfigNonProjectFilename,
  tsConfigProjectFilename
} from '../constants.js';
import eslintConfigBrowser from './eslintConfigBrowser.js';
import eslintConfigLibrary from './eslintConfigLibrary.js';
import eslintConfigNode from './eslintConfigNode.js';
import prettierConfig from './prettierConfig.js';
import prettierIgnore from './prettierIgnoreConfig.js';
import tsConfig from './tsconfig.js';
import tsconfigBase from './tsconfigBase.js';
import tsConfigNonProject from './tsconfigNonProject.js';
import tsConfigEsmBrowser from './tsconfigProjectBrowser.js';
import tsConfigEsmLibrary from './tsconfigProjectLibrary.js';
import tsConfigEsmNode from './tsconfigProjectNode.js';

import type { Config, Environment, ReadonlyStringRecord } from "../types.js";

const environmentConfig = (environment:Environment):Config =>
  environment === 'Browser' ?
    {
      [tsConfigProjectFilename]: tsConfigEsmBrowser,
      [eslintConfigFilename]: eslintConfigBrowser,
    }
  : environment === 'Node' ?
    {
      [tsConfigProjectFilename]: tsConfigEsmNode,
      [eslintConfigFilename]: eslintConfigNode,
    }
  : {
      [tsConfigProjectFilename]: tsConfigEsmLibrary,
      [eslintConfigFilename]: eslintConfigLibrary,
    };

export default ({ packageName, description, environment,scripts }:{
 readonly packageName: string;
 readonly description: string;
 readonly environment:Environment; 
 readonly scripts: ReadonlyStringRecord}):Config => ({
  // We could have a globa prettier.config.js. But it makes sense tio have it at the same level as the eslint.config.js
  [prettierConfigFilename]: prettierConfig,
  [prettierIgnoreFilename]: prettierIgnore,
  [tsConfigBaseFilename]: tsconfigBase,
  [tsConfigNonProjectFilename]: tsConfigNonProject,
  [tsConfigFilename]: tsConfig,
  [packageJsonFilename]: {
    name: `${slashedDevScope}${packageName}`,
    // Needs to be present even at the top or root of a monorepo because there are some javascript config files
    type: 'module',
    description,
    author: 'Jérôme MARTIN',
    license: 'MIT',
    scripts: {
      tscheck: `tsc -b ${tsConfigFilename} --force --noEmit`,
      lint: 'eslint .',
      'lint-rules': 'pnpx @eslint/config-inspector',
      format: 'prettier . --write',
      'update-config-files': 'node ./node_modules/update-config-files',
      'clean-config-files': `shx rm -f ${packageJsonFilename} && shx rm -f ${tsConfigFilename}`,
      'clean-node-modules': 'shx rm -rf node_modules',
      'reinstall-all-dependencies': 'pnpm i --force',
      ...scripts
    }
  },
  ...environmentConfig(environment),
});
