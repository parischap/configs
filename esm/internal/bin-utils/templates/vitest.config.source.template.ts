export default `import {basename} from 'node:path';
import Config from '@parischap/configs/VitestConfigSource';
export default Config(basename(import.meta.dirname))`;
