// This module must not import any external dependency. It must be runnable without a package.json
import {
    npmFolderName,
    packagesFolderName,
    pnpmLockFilename,
    prodFolderName,
    tsBuildInfoFolderName,
    viteTimeStampFilenamePattern,
    vscodeFolderName,
    vscodeWorkspaceFilename,
} from '../shared-utils/constants.js';

// The way to specify ignored files in prettier is the same as in git
// Must work at all levels: top, monorepo, one-package repo and subrepo
export default `/${prodFolderName}/
/${tsBuildInfoFolderName}/
/${viteTimeStampFilenamePattern}
/${packagesFolderName}/
/${npmFolderName}/,
/${vscodeWorkspaceFilename},
/${vscodeFolderName}/
/${pnpmLockFilename}`;
