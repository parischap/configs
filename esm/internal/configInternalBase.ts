/**
 * This config implements what is necessary in all situations. It should not be used directly. It is
 * included by config.monorepo.ts, config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  configsPackageName,
  eslintConfigFilename,
  packageJsonFilename,
  prettierConfigFilename,
  prettierIgnoreFilename,
  slashedDevScope,
  slashedScope,
  tsConfigBaseFilename,
  tsConfigFilename,
  tsConfigNonProjectFilename,
  tsConfigProjectFilename,
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

import type { Config, Environment, ReadonlyStringRecord } from '../types.js';

const environmentConfig = (environment: Environment): Config =>
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

export default ({
  packageName,
  description,
  environment,
  scripts,
}: {
  readonly packageName: string;
  readonly description: string;
  readonly environment: Environment;
  readonly scripts: ReadonlyStringRecord;
}): Config => ({
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
      'update-config-files':
        'vite-node node_modules/@parischap/configs/esm/bin/update-config-files.ts',
      tscheck: `tsc -b ${tsConfigFilename} --force --noEmit`,
      lint: 'eslint .',
      'lint-rules': 'pnpx @eslint/config-inspector',
      format: 'prettier . --write',
      'clean-config-files': `shx rm -f ${packageJsonFilename} && shx rm -f ${tsConfigFilename}`,
      'clean-node-modules': 'shx rm -rf node_modules',
      'reinstall-all-dependencies': 'pnpm i --force',
      ...scripts,
    },
    devDependencies: {
      /**
       * Import configs. Do it here so we can find it at `node_modules/@parischap/configs` in all
       * packages. Necessary for the `update-config-files` script so as not to have to install bin
       * executables which would force us to reinstall the configs package after every modification
       */
      [`${slashedScope}${configsPackageName}`]: 'latest',
    },
  },
  ...environmentConfig(environment),
});
