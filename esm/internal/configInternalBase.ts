/**
 * This config implements what is necessary in all situations. It should not be used directly. It is
 * included by config.monorepo.ts, config.starter.ts, config.subrepo.ts and config.onepackagerepo.ts
 * configs.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  baseDevDependencies,
  eslintConfigFilename,
  packageJsonFilename,
  prettierConfigFilename,
  prettierIgnoreFilename,
  slashedDevScope,
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

import type { Environment, ReadonlyStringRecord } from '../types.js';

const environmentConfig = (environment: Environment) =>
  environment === 'Browser' ?
    {
      // Used by the tscheck script
      [tsConfigProjectFilename]: tsConfigEsmBrowser,
      // Used by the lint script
      [eslintConfigFilename]: eslintConfigBrowser,
    }
  : environment === 'Node' ?
    {
      // Used by the tscheck script
      [tsConfigProjectFilename]: tsConfigEsmNode,
      // Used by the lint script
      [eslintConfigFilename]: eslintConfigNode,
    }
  : {
      // Used by the tscheck script
      [tsConfigProjectFilename]: tsConfigEsmLibrary,
      // Used by the lint script
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
}) => ({
  // Used by the format script
  [prettierConfigFilename]: prettierConfig,
  // Used by the format script
  [prettierIgnoreFilename]: prettierIgnore,
  // Used by the tscheck script
  [tsConfigBaseFilename]: tsconfigBase,
  // Used by the tscheck script
  [tsConfigNonProjectFilename]: tsConfigNonProject,
  // Used by the tscheck script
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
      'update-config-files':
        'vite-node node_modules/@parischap/configs/esm/bin/update-config-files.ts',
      'clean-node-modules': 'shx rm -rf node_modules',
      'clean-config-files': `shx rm -f ${packageJsonFilename} && shx rm -f ${tsConfigFilename}`,
      'reinstall-all-dependencies': 'pnpm i --force',
      ...scripts,
    },
    devDependencies: baseDevDependencies(packageName),
  },
  ...environmentConfig(environment),
});
