/* This module must only use Typescript syntax understandable by Node with the --experimental-transform-types flag */
import {
  indexTsFilename,
  javaScriptExtensions,
  sourceFolderName
} from '../internal/shared-utils/constants.js';

import { watch } from 'node:fs/promises';
import { extname } from 'node:path';

import { updateImports } from '../internal/bin-utils/update-imports.js';

const command = process.argv[2];
const packageName = process.argv[3];
const packagePrefix = process.argv[4];

if (packageName === undefined) throw new Error("Expected 'packageName' argument");

if (packagePrefix === undefined) throw new Error("Expected 'packagePrefix' argument");

if (command === 'run')
  /* eslint-disable-next-line functional/no-expression-statements */
  await updateImports({ packageName, packagePath:'.', packagePrefix });
else if (command === 'watch') {
  let lastEventTime = Date.now();
  const watcher = watch(sourceFolderName, { recursive: true });
  for await (const event of watcher) {
    const currentEventTime = Date.now();
    // Avoid too many events. It's not that bad if we miss an event since we regenerate the whole file each time
    if (currentEventTime - lastEventTime > 500) {
      const changeFilename = event.filename;

      if (changeFilename === null)
        throw new Error(`${packageNameTag}Watch event does not include filename on this platform`);
      if (
        changeFilename !== indexTsFilename
        && javaScriptExtensions.includes(extname(changeFilename))
      ) {
        /* eslint-disable-next-line functional/no-expression-statements */
        await updateImports({ packageName, packagePath:'.', packagePrefix });
      }
    }
    /* eslint-disable-next-line functional/no-expression-statements */
    lastEventTime = currentEventTime;
  }
} else throw new Error(`${packageNameTag}Expected argument 'run' or 'watch'. Actual: '${command}'`);
