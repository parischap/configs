// This module must not import any external dependency. It must be runnable without a package.json
import { npmFolderName, prodFolderName, tsBuildInfoFolderName } from '../constants.js';

export default `# Same rules as .git
${prodFolderName}/
${npmFolderName}/
vite.config.ts.timestamp-*.mjs
/${tsBuildInfoFolderName}/`;
