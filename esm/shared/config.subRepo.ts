import merge from 'deepmerge';
import { basename, dirname, resolve } from 'node:path';
import configBase from './config.base.js';
import configCode from './config.code.js';

const rootPath = resolve();
const packageName = basename(rootPath);
const repoName = basename(dirname(dirname(rootPath)));

export default merge.all([configBase(packageName, repoName), configCode]);
