/**
 * This binary cleans the node-modules folders of all packages in the active Project or of the
 * active Package if used with the -activePackageOnly flag (see README.md for the definition of a
 * Project and of a Package). The active Project is the one that contains the path from which this
 * binary is executed. The active Package is the one in whose root this binary is executed.
 */
/* This module must not use any external dependency because it cleans the node-modules folders and must therfore not depend on any dependency in these folders */
import { rm } from 'fs/promises';
import { join } from 'path';
import * as Project from '../internal/bin-utils/ProjectBase.js';
import { activePackageOnlyFlag, npmFolderName } from '../internal/shared-utils/constants.js';

const arg1 = process.argv[2];
const activePackageOnly = arg1 === activePackageOnlyFlag;

const project = await Project.make(activePackageOnly);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  project.packages.map(async (currentPackage) => {
    try {
      /* eslint-disable-next-line functional/no-expression-statements*/
      await rm(join(currentPackage.path, npmFolderName), { force: true, recursive: true });
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
