/* This module must only use Typescript syntax understandable by Node with the --experimental-transform-types flag */
import { watch } from 'node:fs/promises';
import { extname } from 'node:path';
import * as Package from '../internal/bin-utils/Package.js';
import * as PackageFiles from '../internal/bin-utils/PackageFiles.js';
import * as Project from '../internal/bin-utils/Project.js';
import {
  activePackageOnlyFlag,
  allJavaScriptExtensions,
  indexTsFilename,
  packagePrefixFlag,
  sourceFolderName,
  watchFlag,
} from '../internal/shared-utils/constants.js';

const command = process.argv[1] ?? 'update-exports';

const arg1 = process.argv[2] ?? '';

const firstEqualIndex = arg1.indexOf('=');
const packagePrefixName = arg1.slice(0, firstEqualIndex);
const packagePrefix = arg1.slice(firstEqualIndex + 1);
if (packagePrefixName !== packagePrefixFlag)
  throw new Error(`Bad '-packagePrefix' argument for '${command}' command. Actual: '${arg1}'`);

const arg2 = process.argv[3];
const arg3 = process.argv[4];
const isWatch = arg2 === watchFlag || arg3 === watchFlag;
const activePackageOnly = arg2 === activePackageOnlyFlag || arg3 === activePackageOnlyFlag;

const project = await Project.make(activePackageOnly);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  project.packages.map(async (currentPackage) => {
    try {
      if (isWatch) {
        let lastEventTime = Date.now();
        const watcher = watch(sourceFolderName, { recursive: true });
        for await (const event of watcher) {
          const currentEventTime = Date.now();
          // Avoid too many events. It's not that bad if we miss an event since we regenerate the whole file each time
          if (currentEventTime - lastEventTime > 500) {
            const changeFilename = event.filename;

            if (changeFilename === null)
              throw new Error('${tag]watch event does not include filename on this platform');
            if (
              changeFilename !== indexTsFilename
              && allJavaScriptExtensions.includes(extname(changeFilename))
            ) {
              /* eslint-disable-next-line functional/no-expression-statements */
              await updateImports({
                packagePath: '.',
                packagePrefix,
                keepFileExtensions: isConfigsPackage,
                tag,
              });
            }
          }
          /* eslint-disable-next-line functional/no-expression-statements */
          lastEventTime = currentEventTime;
        }
      } else {
        const packageFiles = await Package.toPackageFiles(currentPackage, {
          exportsFilesOnly: true,
        });

        return await PackageFiles.save(currentPackage.path)(packageFiles);
      }
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
