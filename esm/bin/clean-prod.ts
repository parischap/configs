/**
 * This binary cleans the prod folders (dist/ and .tsbuildinfo/) of all packages in the active
 * Project or of the active Package if used with the -activePackageOnly flag (see README.md for the
 * definition of a Project and of a Package). The active Project is the one that contains the path
 * from which this binary is executed. The active Package is the one in whose root this binary is
 * executed.
 */

import { activePackageOnlyFlag } from '../constants.js';
import * as PackageUnloaded from '../internal/bin-utils/Package/Base.js';
import * as ProjectUnloaded from '../internal/bin-utils/ProjectUnloaded.js';

console.log('Removing prod directories');
const arg1 = process.argv[2];
if (arg1 !== undefined && arg1 !== activePackageOnlyFlag)
  throw new Error(`Unexpected flag '${arg1}' received`);
const activePackageOnly = arg1 === activePackageOnlyFlag;

const project = await ProjectUnloaded.make();
const filteredProject = ProjectUnloaded.filterAndShowCount(
  activePackageOnly ? PackageUnloaded.isActive : () => true,
)(project);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  filteredProject.packages.map((currentPackage) => {
    try {
      return PackageUnloaded.cleanProdFolders(currentPackage);
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
