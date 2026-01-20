import { packagesFolderName, slashedScope } from '../../shared-utils/constants.js';
import type { ReadonlyRecord } from '../../shared-utils/utils.js';
export default ({
  allSourcePackagesNames,
}: {
  readonly allSourcePackagesNames: ReadonlyArray<string>;
}): ReadonlyRecord => ({
  overrides: Object.fromEntries(
    allSourcePackagesNames.map((packageName) => [
      `'${slashedScope}${packageName}'`,
      "'workspace:*'",
    ]),
  ),
  packages: [`'**/${packagesFolderName}/*'`],
  shellEmulator: true,
});
