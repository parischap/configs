// This module must not import any external dependency. It must be runnable without a package.json
import {
  examplesFolderName,
  filesGeneratedByThirdParties,
  foldersGeneratedByThirdParties,
  othersFolderName,
  othersMark,
  prodFolderName,
  sourceFolderName,
  testsFolderName,
  tsConfigSrcFilename,
  typesFolderName
} from '../shared-utils/constants.js';
import type { ReadonlyRecord } from '../shared-utils/types.js';

// Must work at all levels: top, monorepo, one-package repo, subrepo
export default ({isConfigsPackage}:{readonly isConfigsPackage:boolean})=>({
  extends: './tsconfig.base.json',
  exclude: [sourceFolderName,
    examplesFolderName,
    testsFolderName,...foldersGeneratedByThirdParties,
            ...filesGeneratedByThirdParties],
  // The others project of the configs package needs to import the source project for eslintConfig and prettierConfig
    ...(isConfigsPackage ? {references: [{ path: tsConfigSrcFilename }]}:{}),
  /* NoEmit cannot be set to true in a referenced project even though we never emit anything . rootDir, outDir and declarationDir need to be set otherwise Typescript will complain */
  compilerOptions: {
    tsBuildInfoFile: `.tsbuildinfo/${othersMark}.tsbuildinfo`,
    rootDir: '.',
    outDir: `${prodFolderName}/${othersFolderName}`,
    declarationDir: `${prodFolderName}/${othersFolderName}/${typesFolderName}`,
    //declarationMap: true
  },
}) satisfies ReadonlyRecord;
