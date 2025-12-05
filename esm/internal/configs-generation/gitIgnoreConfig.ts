// This module must not import any external dependency. It must be runnable without a package.json
import {
  npmFolderName,
  packagesFolderName,
  prodFolderName,
  tsBuildInfoFolderName,
  viteTimeStampFilenamePattern,
} from '../shared-utils/constants.js';

// Must work for top, monorepos and one-package repos
export default `/${prodFolderName}/
/${tsBuildInfoFolderName}/
/${viteTimeStampFilenamePattern}
/${packagesFolderName}/
/${npmFolderName}/`;