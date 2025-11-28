/**
 * This config implements what is necessary in all situations. A package is always composed of a
 * configInternalBase and either of a configInternalProject or a configInternalNoProject. It should
 * not be used directly. It is included by configMonoRepo.ts, configSubRepo.ts,
 * configOnePackageRepo.ts and configTop.ts.
 */
// This module must not import any external dependency. It must be runnable without a package.json
import {
  baseDevDependencies,
  mkdirpFilename,
  packageJsonFilename,
  prettierConfigFilename,
  prettierIgnoreFilename,
  rmrfFilename,
  slashedScope,
  tsConfigBaseFilename,
  tsConfigFilename,
} from '../constants.js';

import mkdirpCommand from './mkdirpCommandConfig.js';
import prettierConfig from './prettierConfig.js';
import prettierIgnore from './prettierIgnoreConfig.js';
import rmrfCommand from './rmrfCommandConfig.js';
import tsconfigBase from './tsconfigBase.js';

import type { ReadonlyStringRecord } from '../types.js';

export default ({
  packageName,
  description,
  scripts,
}: {
  readonly packageName: string;
  readonly description: string;
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
  [packageJsonFilename]: {
    name: `${slashedScope}${packageName}`,
    // Needs to be present even at the top or root of a monorepo because there are some javascript config files
    type: 'module',
    description,
    author: 'Jérôme MARTIN',
    license: 'MIT',
    scripts: {
      // tests can be run at all levels, even at non project levels because there are vitest projects
      test: 'vitest run',
      tscheck: `tsc -b ${tsConfigFilename} --force --noEmit`,
      lint: 'eslint .',
      'lint-and-analyze': 'eslint . --stats -f json > eslint-stats.json',
      'lint-rules': 'pnpx @eslint/config-inspector',
      format: 'prettier . --write',
      rmrf: 'node rmrf.ts',
      mkdirp: 'node mkdirp.ts',
      'clean-node-modules': 'pnpm rmrf node_modules',
      // Suppress package.json after because once suppressed the rmrf script no longer exists
      'clean-config-files': `pnpm rmrf ${tsConfigFilename} && pnpm rmrf ${packageJsonFilename}`,
      'reinstall-all-dependencies': 'pnpm i --force',
      ...scripts,
    },
    devDependencies: baseDevDependencies,
  },
});
