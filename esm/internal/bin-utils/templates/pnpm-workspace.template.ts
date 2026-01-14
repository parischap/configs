import { packagesFolderName, slashedScope } from '../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../shared-utils/utils.js';
export default ({
  allSourcePackagesNames,
}: {
  readonly allSourcePackagesNames: ReadonlyArray<string>;
}): ReadonlyRecord => ({
  packages: [`'**/${packagesFolderName}/*'`],
  shellEmulator: true,
  overrides: Object.fromEntries(
    allSourcePackagesNames.map((packageName) => {
      const scopedPackageName = `${slashedScope}${packageName}`;
      return [`'${scopedPackageName}'`, `'workspace:${scopedPackageName}@*'`];
    }),
  ),
});
