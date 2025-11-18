// This module must not import any external dependency. It must be runnable without a package.json
import { npmFolderName, prodFolderName, tsBuildInfoFolderName } from '../constants.js';

// Must work both for monorepos and one-package repos
export default `${prodFolderName}/
vite.config.ts.timestamp-*.mjs
${tsBuildInfoFolderName}/
${npmFolderName}/`;
