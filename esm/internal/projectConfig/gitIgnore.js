// This file must not import anything external
import { npmFolderName, prodFolderName, tsBuildInfoFolderName } from './constants.js';

export default `${prodFolderName}/
${npmFolderName}/
vite.config.ts.timestamp-*.mjs
/${tsBuildInfoFolderName}/`;
