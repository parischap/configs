/**
 * This config implements what is necessary in all situations. It should not be used directly. It is
 * included by configMonoRepo.ts, configSubRepo.ts, configOnePackageRepo.ts and configTop.ts.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  baseDevDependencies,
  eslintConfigFilename,
  mkdirpFilename,
  packageJsonFilename,
  prettierConfigFilename,
  prettierIgnoreFilename,
  rmrfFilename,
  slashedDevScope,
  tsConfigBaseFilename,
  tsConfigFilename,
  tsConfigNonProjectFilename,
  tsConfigProjectFilename,
} from '../constants.js';
import eslintConfig from './eslintConfig.js';
import mkdirpCommand from './mkdirpCommandConfig.js';
import prettierConfig from './prettierConfig.js';
import prettierIgnore from './prettierIgnoreConfig.js';
import rmrfCommand from './rmrfCommandConfig.js';
import tsConfig from './tsconfig.js';
import tsconfigBase from './tsconfigBase.js';
import tsConfigNonProject from './tsconfigNonProject.js';
import tsConfigEsmBrowser from './tsconfigProjectBrowser.js';
import tsConfigEsmLibrary from './tsconfigProjectLibrary.js';
import tsConfigEsmNode from './tsconfigProjectNode.js';

import type { ReadonlyStringRecord } from '../types.js';

const environmentConfig = ({
  packageName,
  environment,
}: {
  readonly packageName: string;
  readonly environment: string;
}) => {
  if (environment === 'Browser')
    return {
      // Used by the tscheck script
      [tsConfigProjectFilename]: tsConfigEsmBrowser,
      // Used by the lint script
      [eslintConfigFilename]: eslintConfig('globals.browser'),
    };

  if (environment === 'Node')
    return {
      // Used by the tscheck script
      [tsConfigProjectFilename]: tsConfigEsmNode,
      // Used by the lint script
      [eslintConfigFilename]: eslintConfig('globals.nodeBuiltin'),
    };

  if (environment === 'Library')
    return {
      // Used by the tscheck script
      [tsConfigProjectFilename]: tsConfigEsmLibrary,
      // Used by the lint script
      [eslintConfigFilename]: eslintConfig("globals['shared-node-browser']"),
    };

  throw new Error(
    `'${packageName}': disallowed value for 'environment' parameter. Actual: '${environment}'`,
  );
};

export default ({
  packageName,
  description,
  environment,
  scripts,
}: {
  readonly packageName: string;
  readonly description: string;
  readonly environment: string;
  readonly scripts: ReadonlyStringRecord;
}) => ({
  // Used by the rmrf script
  [rmrfFilename]: rmrfCommand,
  // Used by the mkdirp script
  [mkdirpFilename]: mkdirpCommand,
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
      rmrf: 'node --experimental-transform-types rmrf.ts',
      mkdirp: 'node --experimental-transform-types mkdirp.ts',
      'clean-node-modules': 'rm node  node_modules',
      // Suppress package.json after because once suppressed the rmrf script no longer exists
      'clean-config-files': `pnpm rmrf ${tsConfigFilename} && pnpm rmrf ${packageJsonFilename}`,
      'reinstall-all-dependencies': 'pnpm i --force',
      ...scripts,
    },
    devDependencies: baseDevDependencies,
  },
  ...environmentConfig({ packageName, environment }),
});
