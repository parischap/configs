// Whatever external package this file uses must be added as peerDependency
import { npmFolderName, projectFolderName, tsBuildInfoFolderName } from './constants.js';

export default `# Same rules as .git
${projectFolderName}/
${npmFolderName}/
vite.config.ts.timestamp-*.mjs
/${tsBuildInfoFolderName}/`;
