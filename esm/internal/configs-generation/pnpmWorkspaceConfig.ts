// This module must not import any external dependency. It must be runnable without a package.json

import { packagesFolderName, slashedScope } from '../shared-utils/constants.js';

/* We use overrides instead of linkWorkspacePackages or preferWorkspacePackages because it works even if the workspace package's version does not match the package.json specifier*/
export default (allPackages: ReadonlyArray<readonly [packageName: string, packagePath: string]>) =>
  `packages:
  - '${packagesFolderName}/*'
  - '${packagesFolderName}/*/${packagesFolderName}/*'
  
trustPolicy: no-downgrade
shellEmulator: true`
  + (allPackages.length !== 0 ?
    `
overrides:
${allPackages.map(([packageName]) => `  '${slashedScope}${packageName}': 'workspace:*'`)}`
  : '');
