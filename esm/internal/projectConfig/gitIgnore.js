// Whatever external package this file uses must be added as peerDependency
import { npmFolderName, prodFolderName, tsBuildInfoFolderName } from './constants.js';

export default `${prodFolderName}/
${npmFolderName}/
vite.config.ts.timestamp-*.mjs
/${tsBuildInfoFolderName}/`;
