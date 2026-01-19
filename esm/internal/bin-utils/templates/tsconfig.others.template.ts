import { extname } from 'node:path';
import {
  filesGeneratedByThirdParties,
  foldersWithoutConfigFiles,
  javaScriptExtensions,
  othersFolderName,
  othersMark,
  prodFolderName,
  tsBuildInfoFolderName,
  tsConfigBaseFilename,
  tsConfigSourceFilename,
  typesFolderName,
} from '../../shared-utils/constants.js';
import type { ReadonlyRecord } from '../../shared-utils/utils.js';

// Must work at all levels: top, monorepo, one-package repo, subrepo
export default (isConfigsPackage: boolean): ReadonlyRecord => ({
  extends: [`./${tsConfigBaseFilename}`],
  exclude: [
    ...foldersWithoutConfigFiles,
    ...filesGeneratedByThirdParties.filter((file) => javaScriptExtensions.includes(extname(file))),
  ],
  // The configs package others project needs to import the source project, e.g. eslint.config.ts, vitest.config.ts...
  ...(isConfigsPackage ? { references: [{ path: tsConfigSourceFilename }] } : {}),
  compilerOptions: {
    tsBuildInfoFile: `${tsBuildInfoFolderName}/${othersMark}.tsbuildinfo`,
    outDir: `${prodFolderName}/${othersFolderName}`,
    declarationDir: `${prodFolderName}/${typesFolderName}/${othersFolderName}`,
    // Disable dts generation on a per-file basis. Files in this scope will not be bundled
    isolatedModules: false,
    isolatedDeclarations: false,
    // Some js configuration files may be present
    allowJs: true,
    checkJs: true,
  },
});
