/**
 * This binary generates the configuration files of all Packages of a Project (see ReadMe.md). It
 * can be launched at any level under the project root.
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

import { rm } from 'fs/promises';
import { join } from 'path';
import * as Package from '../internal/bin-utils/Package.js';
import * as Project from '../internal/bin-utils/Project.js';

const option = process.argv[2];
const activePackageOnly = option !== undefined && option === '-activePackageOnly';

const project = await Project.make(activePackageOnly);

await Promise.all(
  project.packages.map(async (currentPackage) => {
    try {
      const allConfigurationFiles = await Package.allConfigurationFiles(currentPackage);

      /* eslint-disable-next-line functional/no-expression-statements*/
      await Promise.all(
        allConfigurationFiles.map((relativeFilepath) =>
          rm(join(currentPackage.path, relativeFilepath), { force: true, recursive: true }),
        ),
      );
    } catch (e: unknown) {
      console.log(`Package '${currentPackage.name}': error rethrown`);
      throw e;
    }
  }),
);

console.log('SUCCESS');
