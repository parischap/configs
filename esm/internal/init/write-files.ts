/* eslint functional/no-expression-statements: off, functional/no-try-statements:off */
import { writeFileSync } from 'node:fs';
import configStarter from '../configStarter.js';
import * as constants from '../constants.js';

try {
  writeFileSync(
    constants.packageJsonFileName,
    JSON.stringify(configStarter[constants.packageJsonFileName]),
  );
  writeFileSync(constants.gitIgnoreFileName, configStarter[constants.gitIgnoreFileName]);
} catch (e) {
  console.log(e);
  process.exit(1);
}
