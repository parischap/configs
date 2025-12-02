/** This config is the one to be used at the root (top) of a monorepo. */
// This module must not import any external dependency. It must be runnable without a package.json
import { topPackageName } from '../constants.js';
import { type Config } from '../types.js';
import { deepMerge } from '../utils.js';
import configInternalBase from './configInternalBase.js';
import configInternalRepo from './configInternalRepo.js';
import configInternalWithoutSource from './configInternalWithoutSource.js';

export default ({ description }: { readonly description: string }): Config =>
  deepMerge(
    configInternalBase({
      packageName: topPackageName,
      description,
      scripts: {},
      isConfigsPackage: false,
    }),
    configInternalRepo({
      isPublished: false,
    }),
    configInternalWithoutSource({ isTopPackage: true }),
  );
