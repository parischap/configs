/**
 * This binary cleans the node-modules folders of all packages in the active Project or of the
 * active Package if used with the -activePackageOnly flag (see README.md for the definition of a
 * Project and of a Package). The active Project is the one that contains the path from which this
 * binary is executed. The active Package is the one in whose root this binary is executed.
 */
/* This module must not use any external dependency because it cleans the node-modules folders and must therfore not depend on any dependency in these folders */

import * as PackageBase from '../internal/bin-utils/Package/Base.js';
import * as ProjectUnloaded from '../internal/bin-utils/ProjectUnloaded.js';
import * as SchemaFormat from '../internal/bin-utils/Schema/Format.js';
import { getExeFlags } from '../internal/shared-utils/utils.js';

console.log('Removing node_modules directory');
const { ['-activePackageOnly']: activePackageOnly } = SchemaFormat.injectDefaultsAndValidate(
  SchemaFormat.filteringArgs,
  {
    allowStringConversion: true,
  },
)(getExeFlags());

const project = await ProjectUnloaded.filteredFromActiveProjectAndShowCount(
  activePackageOnly ? PackageBase.isActive : () => true,
);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  project.packages.map((currentPackage) => {
    try {
      return PackageBase.cleanNodeModulesFolder(currentPackage);
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
