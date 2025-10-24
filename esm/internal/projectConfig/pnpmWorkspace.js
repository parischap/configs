// Whatever external package this file uses must be added as peerDependency
import { packagesFolderName, prodFolderName } from './constants.js';

export default `packages:
  - '${packagesFolderName}/*'
  - '${packagesFolderName}/*/${prodFolderName}'`;
