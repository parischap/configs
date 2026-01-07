import { type ReadonlyRecord } from '../../shared-utils/utils.js';
export default ({
  allPackagesPaths,
}: {
  readonly allPackagesPaths: ReadonlyArray<string>;
}): ReadonlyRecord => ({
  folders: allPackagesPaths.map((path) => ({ path })),
  /*settings: {
      'typescript.tsdk': `${npmFolderName}/@typescript/native-preview/lib`
    },*/
});
