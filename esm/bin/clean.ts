/**
 * This binary cleans all packages in the active ProjectLoaded or of the active Package if used with
 * the -activePackageOnly flag (removes configuration files, node_modules and prod folder)
 */

import * as PackageBase from '../internal/bin-utils/Package/Base.js';
import * as PackageLoadedBase from '../internal/bin-utils/Package/LoadedBase.js';
import * as ProjectLoaded from '../internal/bin-utils/ProjectLoaded.js';
import * as SchemaFormat from '../internal/bin-utils/Schema/Format.js';
import * as SchemaParameterDescriptor from '../internal/bin-utils/Schema/ParameterDescriptor.js';
import * as SchemaParameterType from '../internal/bin-utils/Schema/ParameterType.js';
import { getExeFlags } from '../internal/shared-utils/utils.js';

console.log('Package cleaning');
const argsFormat = SchemaFormat.make({
  descriptors: {
    '-activePackageOnly': SchemaParameterDescriptor.make({
      defaultValue: false,
      expectedType: SchemaParameterType.boolean,
    }),
  },
});

const { '-activePackageOnly': activePackageOnly } = SchemaFormat.injectDefaultsAndValidate(
  argsFormat,
  {
    allowStringConversion: true,
  },
)(getExeFlags());

const project = await ProjectLoaded.filteredFromActiveProjectAndShowCount(
  activePackageOnly ? PackageBase.isActive : () => true,
);

await Promise.all(
  project.packages.map(async (currentPackage) => {
    try {
      await PackageLoadedBase.clean(currentPackage);
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
