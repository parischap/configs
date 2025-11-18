// This module must not import any external dependency. It must be runnable without a package.json
import { npmFolderName, prodFolderName, tsBuildInfoFolderName } from '../constants.js';

// The way to specify ignored files in prettier is the same as in git
export default `${prodFolderName}/
vite.config.ts.timestamp-*.mjs
${tsBuildInfoFolderName}/
${npmFolderName}/`;
