/**
 * This binary cleans the node-modules folders of all packages in the active Project or of the
 * active Package if used with the -activePackageOnly flag (see README.md for the definition of a
 * Project and of a Package). The active Project is the one that contains the path from which this
 * binary is executed. The active Package is the one in whose root this binary is executed.
 */
/* This module must not use any external dependency because it cleans the node-modules folders and must therfore not depend on any dependency in these folders */

import { activePackageOnlyFlag } from '../constants.js';
import * as PackageBase from '../internal/bin-utils/Package/Base.js';
import * as ProjectBase from '../internal/bin-utils/ProjectBase.js';

console.log('Cleaning config files');
const arg1 = process.argv[2];
if (arg1 !== undefined && arg1 !== activePackageOnlyFlag)
  throw new Error(`Unexpected flag '${arg1}' received`);
const activePackageOnly = arg1 === activePackageOnlyFlag;

const project = await ProjectBase.make();
const filteredProject = ProjectBase.filterAndShowCount(
  activePackageOnly ? PackageBase.isActive : () => true,
)(project);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  filteredProject.packages.map((currentPackage) => {
    try {
      return PackageBase.cleanNodeModulesFolder(currentPackage);
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
