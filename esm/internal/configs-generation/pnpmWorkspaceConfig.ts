// This module must not import any external dependency. It must be runnable without a package.json

import { configsPackageName, packagesFolderName, slashedScope } from '../shared-utils/constants.js';

const topConfig = (isTop: boolean) =>
  isTop ?
    `  

overrides:
  '${slashedScope}${configsPackageName}': 'workspace:*'
  '${slashedScope}ansi-styles': 'workspace:*'
  '${slashedScope}conversions': 'workspace:*'
  '${slashedScope}effect-lib': 'workspace:*'
  '${slashedScope}effect-report': 'workspace:*'
  '${slashedScope}node-effect-lib': 'workspace:*'
  '${slashedScope}pretty-print': 'workspace:*'
  
trustPolicy: no-downgrade
shellEmulator: true`
  : ``;

/* We use overrides instead of linkWorkspacePackages or preferWorkspacePackages because it works even if the workspace package's version does not match the package.json specifier*/
export default (isTop: boolean) => `packages:
  - '${packagesFolderName}/*'
  - '${packagesFolderName}/*/${packagesFolderName}/*'${topConfig(isTop)}`;
