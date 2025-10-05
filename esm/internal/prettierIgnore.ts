import * as constants from './constants.js';

export default `# Same rules as .git
${constants.prodFolderName}/
${constants.npmFolderName}/
vite.config.ts.timestamp-*.mjs
/${constants.tsBuildInfoFolderName}/`;
