import * as constants from './constants.js';
export default `packages:
  - '${constants.packagesFolderName}/*'
  - '${constants.packagesFolderName}/*/${constants.prodFolderName}'`;
