// This module must not import any external dependency. It must be runnable without a package.json
import { packagesFolderName } from '../constants.js';

//  - '${projectsFolderName}/*/${prodFolderName}'
//  - '${projectsFolderName}/*/${packagesFolderName}/*/${prodFolderName}'
/* overrides:
  '@parischap/ansi-styles': 'workspace:@parischap-dev/ansi-styles@*'
  '@parischap/conversions': 'workspace:@parischap-dev/conversions@*'
  '@parischap/effect-lib': 'workspace:@parischap-dev/effect-lib@*'
  '@parischap/effect-report': 'workspace:@parischap-dev/effect-report@*'
  '@parischap/node-effect-lib': 'workspace:@parischap-dev/node-effect-lib@*'
  '@parischap/pretty-print': 'workspace:@parischap-dev/pretty-print@*'
  '@parischap/test-utils': 'workspace:@parischap-dev/test-utils@*'
*/

export default `packages:
  - '${packagesFolderName}/*'
  - '${packagesFolderName}/*/${packagesFolderName}/*'`;
