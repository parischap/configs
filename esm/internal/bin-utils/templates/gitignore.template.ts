import {
  filesGeneratedByThirdParties,
  foldersGeneratedByThirdParties,
} from '../../shared-utils/constants.js';

export default [
  ...foldersGeneratedByThirdParties.map((folderName) => `/${folderName}/`),
  ...filesGeneratedByThirdParties.map((fileName) => `/${fileName}`),
].join('\n');
