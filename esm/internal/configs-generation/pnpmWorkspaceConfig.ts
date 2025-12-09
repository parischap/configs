// This module must not import any external dependency. It must be runnable without a package.json

import { packagesFolderName, slashedScope } from '../shared-utils/constants.js';
import { Package } from '../shared-utils/types.js';

/* We use overrides instead of linkWorkspacePackages or preferWorkspacePackages because it works even if the workspace package's version does not match the package.json specifier*/
export default (allPackages: ReadonlyArray<Package>) => {
  const allPackagesWithSource = allPackages.filter(
    ({ type }) => type === 'OnePackageRepo' || type === 'SubRepo',
  );
  return (
    `packages:
  - '${packagesFolderName}/*'
  - '${packagesFolderName}/*/${packagesFolderName}/*'
  
trustPolicy: no-downgrade
shellEmulator: true`
    + (allPackagesWithSource.length !== 0 ?
      `
overrides:
${allPackagesWithSource.map((name) => `  '${slashedScope}${name}': 'workspace:*'`)}`
    : '')
  );
};
