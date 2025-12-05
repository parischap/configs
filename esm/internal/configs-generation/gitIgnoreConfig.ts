// This module must not import any external dependency. It must be runnable without a package.json
import {
  filesGeneratedByThirdParties,
  foldersGeneratedByThirdParties
} from '../shared-utils/constants.js';

// Must work for top, monorepos and one-package repos
export default [...foldersGeneratedByThirdParties.map((folderName)=>`/${folderName}/`),
    ...filesGeneratedByThirdParties.map((fileName)=>`/${fileName}`)].join('\n')