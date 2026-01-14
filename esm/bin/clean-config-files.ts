/**
 * This binary cleans the dev configuration files of all packages in the active ProjectLoaded or of
 * the active Package if used with the -activePackageOnly flag
 */

import * as PackageBase from '../internal/bin-utils/Package/Base.js';
import * as PackageLoadedBase from '../internal/bin-utils/Package/LoadedBase.js';
import * as ProjectLoaded from '../internal/bin-utils/ProjectLoaded.js';
import * as SchemaFormat from '../internal/bin-utils/Schema/Format.js';
import * as SchemaParameterDescriptor from '../internal/bin-utils/Schema/ParameterDescriptor.js';
import * as SchemaParameterType from '../internal/bin-utils/Schema/ParameterType.js';
import { getExeFlags } from '../internal/shared-utils/utils.js';

console.log('Removing all configuration files');
const argsFormat = SchemaFormat.make({
  descriptors: {
    '-activePackageOnly': SchemaParameterDescriptor.make({
      expectedType: SchemaParameterType.boolean,
      defaultValue: false,
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

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  project.packages.map(async (currentPackage) => {
    try {
      /* eslint-disable-next-line functional/no-expression-statements*/
      await PackageLoadedBase.cleanConfigFiles(currentPackage);
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
