/* This module must only use Typescript syntax understandable by Node with the --experimental-transform-types flag */
import { watch } from 'node:fs/promises';
import { extname, join } from 'node:path';
import {
  activePackageOnlyFlag,
  allJavaScriptExtensions,
  indexTsFilename,
  sourceFolderName,
  watchFlag,
} from '../constants.js';
import * as ConfigFiles from '../internal/bin-utils/ConfigFiles.js';
import * as PackageAll from '../internal/bin-utils/Package/All.js';
import * as PackageBase from '../internal/bin-utils/Package/Base.js';
import * as Project from '../internal/bin-utils/Project.js';

const getParams = (): { isWatch: boolean; activePackageOnly: boolean } => {
  const arg1 = process.argv[2];
  const arg2 = process.argv[3];
  if (arg1 === undefined) return { isWatch: false, activePackageOnly: false };
  if (arg2 === undefined) {
    if (arg1 === watchFlag) return { isWatch: true, activePackageOnly: false };
    if (arg1 === activePackageOnlyFlag) return { isWatch: false, activePackageOnly: true };
    throw new Error(`Unexpected flag '${arg1}' received`);
  }
  if (arg1 !== watchFlag && arg1 !== activePackageOnlyFlag)
    throw new Error(`Unexpected flag '${arg1}' received`);
  if (arg2 !== watchFlag && arg2 !== activePackageOnlyFlag)
    throw new Error(`Unexpected flag '${arg2}' received`);
  if (arg1 === arg2) throw new Error(`Flag '${arg1}' received twice`);
  return { isWatch: true, activePackageOnly: true };
};
const arg3 = process.argv[4];
if (arg3 !== undefined) throw new Error(`Unexpected flag '${arg3}' received`);

const { isWatch, activePackageOnly } = getParams();

const project = await Project.makeFiltered(activePackageOnly ? PackageBase.isActive : () => true);
const filteredProject = Project.filterAndShowCount(
  (currentPackage) =>
    PackageAll.isSourcePackage(currentPackage) && currentPackage.packagePrefix !== undefined,
)(project);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  filteredProject.packages.map(async (currentPackage) => {
    try {
      if (isWatch) {
        let lastEventTime = Date.now();
        const watcher = watch(join(currentPackage.path, sourceFolderName), { recursive: true });
        for await (const event of watcher) {
          const currentEventTime = Date.now();
          // Avoid too many events. It's not that bad if we miss an event since we regenerate the whole file each time
          if (currentEventTime - lastEventTime > 500) {
            const changeFilename = event.filename;
            if (
              changeFilename === null
              || (changeFilename !== indexTsFilename
                && allJavaScriptExtensions.includes(extname(changeFilename)))
            ) {
              const configFiles = await PackageAll.generateConfigFiles(currentPackage, {
                exportsFilesOnly: true,
              });
              /* eslint-disable-next-line functional/no-expression-statements*/
              await ConfigFiles.save(currentPackage.path)(configFiles);
            }
            /* eslint-disable-next-line functional/no-expression-statements */
            lastEventTime = currentEventTime;
          }
        }
      } else {
        const configFiles = await PackageAll.generateConfigFiles(currentPackage, {
          exportsFilesOnly: true,
        });
        /* eslint-disable-next-line functional/no-expression-statements*/
        await ConfigFiles.save(currentPackage.path)(configFiles);
      }
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
