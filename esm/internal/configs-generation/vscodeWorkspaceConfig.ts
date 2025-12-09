import { relative } from 'path';
import { npmFolderName } from '../shared-utils/constants.js';
import { Package } from '../shared-utils/types.js';
import { prettyStringify } from '../shared-utils/utils.js';

export default ({
  topRepoName,
  topRepoPath,
  allPackages,
}: {
  readonly topRepoName: string;
  readonly topRepoPath: string;
  allPackages: ReadonlyArray<Package>;
}) => `{
  "settings": {
    "typescript.tsdk": "${topRepoName}/${npmFolderName}/typescript/lib",
  },
  ${prettyStringify({ folders: allPackages.map(({ absolutePath }) => ({ path: relative(topRepoPath, absolutePath) })) })}
}`;
