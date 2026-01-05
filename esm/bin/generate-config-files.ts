/**
 * This binary generates the configuration files of all packages in the active Project or of the
 * active Package if used with the -activePackageOnly flag (see README.md for the definition of a
 * Project and of a Package). The active Project is the one that contains the path from which this
 * binary is executed. The active Package is the one in whose root this binary is executed.
 *
 * Each Package, except the top package, must contain a `project.config.json` file that contains the
 * parameters of that package. The parameters of the top package are stored in Package.ts, so that
 * the top package does not need to be saved on github. Based on the parameters, this binary creates
 * a configuration object whose keys are the names of the files to create and values the contents of
 * these files.
 *
 * It then saves this configuration files and checks that no useless configuration files are present
 * in the package.
 *
 * Finally, it cleans all prod directories of all packages.
 */

/* This module must not import any external dependency. It must be runnable without a package.json because it is used at the very start of a project */

import * as ConfigFiles from "../internal/bin-utils/Config/Files.js";
import * as PackageAllBase from "../internal/bin-utils/Package/AllBase.js";
import * as PackageBase from "../internal/bin-utils/Package/Base.js";
import * as Project from "../internal/bin-utils/Project.js";
import * as SchemaFormat from "../internal/bin-utils/Schema/Format.js";
import { getExeFlags } from "../internal/shared-utils/utils.js";

console.log("Generating config files");
const { "-activePackageOnly": activePackageOnly } = SchemaFormat.injectDefaultsAndValidate(
  SchemaFormat.filteringArgs,
  {
    allowStringConversion: true,
  },
)(getExeFlags());

const project = await Project.filteredFromActiveProjectAndShowCount(
  activePackageOnly ? PackageBase.isActive : () => true,
);

/* eslint-disable-next-line functional/no-expression-statements*/
await Promise.all(
  project.packages.map(async (currentPackage) => {
    try {
      const configFiles = await PackageAllBase.generateConfigFiles(currentPackage);
      /* eslint-disable-next-line functional/no-expression-statements*/
      await ConfigFiles.save({
        packagePath: currentPackage.path,
        packageName: currentPackage.name,
      })(configFiles);

      const configurationFileList = await PackageBase.getPathsOfExistingConfigFiles(currentPackage);

      const filesToCreate = Object.keys(configFiles.configurationFiles);
      const unexpectedConfigFiles = configurationFileList.filter(
        (relativePath) => !filesToCreate.includes(relativePath),
      );
      if (unexpectedConfigFiles.length > 0)
        throw new Error(
          `Package '${currentPackage.name}': following unexpected files were found: '${unexpectedConfigFiles.join("', '")}'`,
        );

      /* Remove prod directories because the packages will need rebuilding and these directories might contain conflicting versions of imported packages. We do it also in packages with no source, just in case... */
      /* eslint-disable-next-line functional/no-expression-statements*/
      await PackageBase.cleanProdFolders(currentPackage);
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log("SUCCESS");
