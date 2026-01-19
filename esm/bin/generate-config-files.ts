/**
 * This binary generates and saves the prod and dev configuration files of all packages in the
 * active ProjectLoaded or of the active Package if used with the -activePackageOnly flag (see
 * README.md for the definition of a ProjectLoaded and of a Package). It also checks that there are
 * no unexpected and possibly dangerous dev configuration files in the package.
 */

/* This module must not import any external dependency. It must be runnable without a package.json because it is used at the very start of a project */

import * as PackageBase from '../internal/bin-utils/Package/Base.js';
import * as PackageLoadedBase from '../internal/bin-utils/Package/LoadedBase.js';
import * as ProjectLoaded from '../internal/bin-utils/ProjectLoaded.js';
import * as SchemaFormat from '../internal/bin-utils/Schema/Format.js';
import * as SchemaParameterDescriptor from '../internal/bin-utils/Schema/ParameterDescriptor.js';
import * as SchemaParameterType from '../internal/bin-utils/Schema/ParameterType.js';
import { getExeFlags } from '../internal/shared-utils/utils.js';

console.log('Generating config files');
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
      await PackageLoadedBase.generateSaveAndCheckDevConfigFiles(currentPackage);
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
