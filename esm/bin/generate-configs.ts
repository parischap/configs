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
/* This module must not import any external dependency. It must be runnable without a package.json. It must only use Typescript syntax understandable by Node with the --experimental-transform-types flag */
import * as Package from '../internal/bin-utils/Package.js';
import * as Project from '../internal/bin-utils/Project.js';

const project = await Project.make();

await Promise.all(
  project.map(async (currentPackage) => {
    const uselessFilesChecker = Package.toUselessFilesChecker(currentPackage);
    const packageFileSaver = Package.toPackageFileSaver(currentPackage);
    const packageFiles = await Package.toPackageFiles(currentPackage);
    await uselessFilesChecker(packageFiles);
    await packageFileSaver(packageFiles);
    /* Remove prod directories because the packages will need rebuilding and these directories might contain conflicting versions of imported packages. We do it also in packages with no source, just in case... */
    await Package.cleanProd(currentPackage);
  }),
);

console.log('SUCCESS');
