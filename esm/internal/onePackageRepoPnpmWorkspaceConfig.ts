// This module must not import any external dependency. It must be runnable without a package.json
import { prodFolderName } from '../constants.js';

export default `packages:
  - '${prodFolderName}/*'`;
