/**
 * Adds an exports entry in index.js and creates namespace exports entries for each file in the
 * `esm` directory not in the `internal` or `binaries` sub-directory.
 */
/* This module must only use Typescript syntax understandable by Node with the --experimental-transform-types flag */
import {
  binariesFolderName,
  indexTsFilename,
  internalFolderName,
  javaScriptExtensions,
  sourceFolderName,
} from '../shared-utils/constants.js';

import { join } from 'node:path';
import { Record } from '../shared-utils/types.js';
import { fromOSPathToPosixPath, readFilesRecursively } from '../shared-utils/utils.js';

/** Capitalizes the first letter of a string */
const capitalizeFirstLetter = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Returns `indexTsContents`, the contents of an `index.ts` file that reexports all exports of the
 * modules present in `sourcePath` except in the `bin` and `internal` directories and,
 * packageJsonExports, a record to insert in the export fields of package.json to enable namespace
 * imports of the modules present in the `esm` directory except in the `bin` and `internal`
 * directories. Modules are prefixed with `packagePrefix`. If keepFileExtensions is true, modules
 * are exported with their original extension. Otherwise, they are always exported with a `.js`
 * extension. This is useful for the configs package because it exports `prettierConfig.ts`.
 * Prettier uses the Node --experimental-transform-types flag to read its config file.Node is not
 * capable of loading a `.ts` file when importing a `.js` file.
 */
export const generateImports = async ({
  sourcePath,
  packagePrefix,
  keepFileExtensions,
}: {
  readonly sourcePath: string;
  readonly packagePrefix: string;
  readonly keepFileExtensions: boolean;
}): Promise<readonly [indexTsContents: string, packageJsonExports: Record]> => {
  const basePackageJsonExports = {
    '.': {
      import: `./${sourceFolderName}/index.js`,
    },
    './tests': {
      import: `./${sourceFolderName}/index.tests.js`,
    },
  };

  if (packagePrefix === '') return ['', basePackageJsonExports];
  const sourceFiles = (
    await readFilesRecursively({
      path: sourcePath,
      foldersToExclude: [internalFolderName, binariesFolderName],
      dontFailOnInexistentPath: false,
    })
  )
    .filter(
      ({ extension, name }) => name !== indexTsFilename && javaScriptExtensions.includes(extension),
    )
    .map(({ bareName, relativeParentPath, extension }) => {
      const barePath = fromOSPathToPosixPath(join(relativeParentPath, bareName));
      return {
        namespaceExportName: `./${packagePrefix}${barePath.split('/').map(capitalizeFirstLetter).join('')}`,
        exportPath: `./${barePath}.${keepFileExtensions ? extension : 'js'}`,
      };
    });

  return [
    sourceFiles
      // path.join removes upfront './' but typescript requires them so we must add them
      .map(
        ({ exportPath, namespaceExportName }) =>
          `export * as ${namespaceExportName} from '${exportPath}';`,
      )
      .join('\n'),
    {
      ...Object.fromEntries(
        sourceFiles.map(({ exportPath, namespaceExportName }) => {
          return [
            `./${namespaceExportName}`,
            {
              import: exportPath,
            },
          ] as const;
        }),
      ),
      ...basePackageJsonExports,
    },
  ] as const;
};
