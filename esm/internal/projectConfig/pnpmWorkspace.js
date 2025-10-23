// This file must not import anything external
import { packagesFolderName, prodFolderName } from './constants.js';

export default `packages:
  - '${packagesFolderName}/*'
  - '${packagesFolderName}/*/${prodFolderName}'`;
