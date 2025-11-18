// This module must not import any external dependency. It must be runnable without a package.json
import { npmFolderName, packagesFolderName } from '../constants.js';

export default `/${packagesFolderName}/
/${npmFolderName}/`;
