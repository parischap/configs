import {
  configsPackageName,
  packagesFolderName,
  slashedDevScope,
  slashedScope,
} from '../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../shared-utils/utils.js';
export default ({
  allSourcePackagesNames,
}: {
  readonly allSourcePackagesNames: ReadonlyArray<string>;
}): ReadonlyRecord => ({
  packages: [`'**/${packagesFolderName}/*'`, `'**/${packagesFolderName}/*/dist'`],
  shellEmulator: true,
  overrides: Object.fromEntries(
    allSourcePackagesNames.map((packageName) => [
      `'${slashedScope}${packageName}'`,
      `'workspace:${packageName === configsPackageName ? '' : `${slashedDevScope}${packageName}`}*'`,
    ]),
  ),
});
