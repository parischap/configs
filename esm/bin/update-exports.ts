import { watch } from 'node:fs/promises';
import { extname, join } from 'node:path';
import * as ConfigFiles from '../internal/bin-utils/ConfigFiles.js';
import * as PackageBase from '../internal/bin-utils/Package/Base.js';
import * as PackageLoadedBase from '../internal/bin-utils/Package/LoadedBase.js';
import * as PackageOnePackageRepo from '../internal/bin-utils/Package/OnePackageRepo.js';
import * as PackageSubRepo from '../internal/bin-utils/Package/SubRepo.js';
import * as ProjectLoaded from '../internal/bin-utils/ProjectLoaded.js';
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
      defaultValue: false,
      expectedType: SchemaParameterType.boolean,
    }),
    '-watch': SchemaParameterDescriptor.make({
      defaultValue: false,
      expectedType: SchemaParameterType.boolean,
    }),
  },
});

const { '-activePackageOnly': activePackageOnly, '-watch': isWatch } =
  SchemaFormat.injectDefaultsAndValidate(argsFormat, {
    allowStringConversion: true,
  })(getExeFlags());

if (isWatch) {console.log('Watch mode activated');}

const project = await ProjectLoaded.filteredFromActiveProject(
  activePackageOnly ? PackageBase.isActive : () => true,
);
const filteredProject = ProjectLoaded.filterAndShowCount(
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
              /* eslint-disable-next-line functional/no-expression-statements*/
              await PackageLoadedBase.generateAndSaveConfigFiles(
                currentPackage,
                ConfigFiles.Mode.ExportsOnly,
              );
            }
            /* eslint-disable-next-line functional/no-expression-statements */
            lastEventTime = currentEventTime;
          }
        }
      } else {
        /* eslint-disable-next-line functional/no-expression-statements*/
        await PackageLoadedBase.generateAndSaveConfigFiles(
          currentPackage,
          ConfigFiles.Mode.ExportsOnly,
        );
      }
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
