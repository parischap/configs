/** This module must be run from the root directory of the configs package */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import * as constants from '../constants.js';
import {
  configStarterDependencies,
  configStarterDevDependencies,
  devDependencies,
} from '../dependencies.js';

/** @type {string} */
/* eslint-disable-next-line functional/no-let */
let packageJsonText;

/* eslint-disable-next-line functional/no-try-statements */
try {
  /* eslint-disable-next-line functional/no-expression-statements */
  packageJsonText = readFileSync(constants.packageJsonFileName, 'utf-8');
} catch (e) {
  /* eslint-disable-next-line functional/no-throw-statements */
  if (typeof e === 'object' && e !== null && 'code' in e && e.code !== 'ENOENT') throw e;
  /* eslint-disable-next-line functional/no-expression-statements */
  packageJsonText = '';
}

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
const packageJson = packageJsonText === '' ? {} : JSON.parse(packageJsonText);

/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
const targetPackageJson = {
  ...packageJson,
  name: constants.slashedDevScope + constants.thisPackageName,
  type: 'module',
  devDependencies: { ...devDependencies, ...configStarterDevDependencies },
  dependencies: configStarterDependencies,
};

/* eslint-disable-next-line functional/no-expression-statements */
writeFileSync(constants.packageJsonFileName, JSON.stringify(targetPackageJson));

/**
 * Use pnpm add: it will create a package.json file if it does not exist and will add the missing
 * dependencies if it already exists. So we don't uninstall everything and then reinstall it
 */
/* eslint-disable-next-line functional/no-expression-statements */
execSync('pnpm i', { stdio: 'inherit' });
