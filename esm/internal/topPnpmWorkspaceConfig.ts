// This module must not import any external dependency. It must be runnable without a package.json
import { packagesFolderName } from '../constants.js';

export default `packages:
  - '${packagesFolderName}/*'`;
