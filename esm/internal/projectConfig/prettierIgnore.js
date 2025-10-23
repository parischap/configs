// This file must not import anything external
import { npmFolderName, projectFolderName, tsBuildInfoFolderName } from './constants.js';

export default `# Same rules as .git
${projectFolderName}/
${npmFolderName}/
vite.config.ts.timestamp-*.mjs
/${tsBuildInfoFolderName}/`;
