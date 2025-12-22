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
import * as PackageSource from '../internal/bin-utils/Package/Source.js';
import * as Project from '../internal/bin-utils/Project.js';
import { getExeFlags } from '../internal/shared-utils/utils.js';

const [isWatch, activePackageOnly] = getExeFlags([watchFlag, activePackageOnlyFlag] as const);

const project = await Project.makeFiltered(activePackageOnly ? PackageBase.isActive : () => true);
const filteredProject = Project.filterAndShowCount(
  (currentPackage) =>
    PackageSource.has(currentPackage) && currentPackage.packagePrefix !== undefined,
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
              const configFiles = ConfigFiles.filterExportsFiles(
                await PackageAll.generateConfigFiles(currentPackage),
              );
              /* eslint-disable-next-line functional/no-expression-statements*/
              await ConfigFiles.save(currentPackage.path)(configFiles);
            }
            /* eslint-disable-next-line functional/no-expression-statements */
            lastEventTime = currentEventTime;
          }
        }
      } else {
        const configFiles = ConfigFiles.filterExportsFiles(
          await PackageAll.generateConfigFiles(currentPackage),
        );
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
