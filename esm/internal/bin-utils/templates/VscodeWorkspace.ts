import type { ReadonlyRecord } from '../../shared-utils/utils.js';
export default ({
  allPackagesPaths,
}: {
  readonly allPackagesPaths: ReadonlyArray<string>;
}): ReadonlyRecord => ({
  folders: allPackagesPaths.map((path) => ({ path })),
  // Decomment when tsgo replaces normal typescript
  /*Settings: {
    //'typescript.tsdk': `${npmFolderName}/typescript/lib`
  },*/
});
