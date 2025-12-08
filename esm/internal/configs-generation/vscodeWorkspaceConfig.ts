import { npmFolderName } from '../shared-utils/constants.js';
import { prettyStringify } from '../shared-utils/utils.js';

export default ({
  topRepoName,
  allPackages,
}: {
  readonly topRepoName: string;
  allPackages: ReadonlyArray<readonly [packageName: string, packagePath: string]>;
}) => `{
  "settings": {
    "typescript.tsdk": "${topRepoName}/${npmFolderName}/typescript/lib",
  },
  ${prettyStringify({ folders: [[topRepoName, '.'], ...allPackages].map(([_, packagePath]) => ({ path: packagePath })) })}
}`;
