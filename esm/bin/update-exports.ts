/* This module must only use Typescript syntax understandable by Node with the --experimental-transform-types flag */
import { watch } from 'node:fs/promises';
import { extname, join } from 'node:path';
import * as ConfigFiles from '../internal/bin-utils/ConfigFiles.js';
import * as PackageBase from '../internal/bin-utils/Package/Base.js';
import * as PackageLoadedBase from '../internal/bin-utils/Package/LoadedBase.js';
import * as PackageOnePackageRepo from '../internal/bin-utils/Package/OnePackageRepo.js';
import * as PackageSubRepo from '../internal/bin-utils/Package/SubRepo.js';
import * as Project from '../internal/bin-utils/Project.js';
import * as SchemaFormat from '../internal/bin-utils/Schema/Format.js';
import * as SchemaParameterDescriptor from '../internal/bin-utils/Schema/ParameterDescriptor.js';
import * as SchemaParameterType from '../internal/bin-utils/Schema/ParameterType.js';

import {
  indexTsFilename,
  javaScriptExtensions,
  sourceFolderName,
} from '../internal/shared-utils/constants.js';
import { getExeFlags } from '../internal/shared-utils/utils.js';

console.log('Generating exports config files');

const argsFormat = SchemaFormat.make({
  descriptors: {
    '-activePackageOnly': SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.boolean,
      defaultValue: false,
    }),
    '-watch': SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.boolean,
      defaultValue: false,
    }),
  },
});

const { '-activePackageOnly': activePackageOnly, '-watch': isWatch } =
  SchemaFormat.injectDefaultsAndValidate(argsFormat, {
    allowStringConversion: true,
  })(getExeFlags());

if (isWatch) console.log('Watch mode activated');

const project = await Project.filteredFromActiveProject(
  activePackageOnly ? PackageBase.isActive : () => true,
);
const filteredProject = Project.filterAndShowCount(
  (currentPackage) =>
    (currentPackage instanceof PackageOnePackageRepo.Type
      || currentPackage instanceof PackageSubRepo.Type)
    && currentPackage.packagePrefix !== undefined,
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
                && javaScriptExtensions.includes(extname(changeFilename)))
            ) {
              console.log(`Updating exports files of package: '${currentPackage.name}'`);
              const configFiles = await PackageLoadedBase.generateConfigFiles(
                currentPackage,
                ConfigFiles.Mode.ExportsOnly,
              );
              /* eslint-disable-next-line functional/no-expression-statements*/
              await ConfigFiles.save({
                packagePath: currentPackage.path,
                packageName: currentPackage.name,
              })(configFiles);
            }
            /* eslint-disable-next-line functional/no-expression-statements */
            lastEventTime = currentEventTime;
          }
        }
      } else {
        const configFiles = await PackageLoadedBase.generateConfigFiles(
          currentPackage,
          ConfigFiles.Mode.ExportsOnly,
        );
        /* eslint-disable-next-line functional/no-expression-statements*/
        await ConfigFiles.save({
          packagePath: currentPackage.path,
          packageName: currentPackage.name,
        })(configFiles);
      }
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
