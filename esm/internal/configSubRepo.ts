/** This config is the one to be used in the sub-package of a monorepo. */
import { Record } from 'effect';
import { basename, dirname, resolve } from 'node:path/posix';
import { merge } from 'ts-deepmerge';
import configInternalBase, { Environment } from './configInternalBase.js';
import configInternalPackage, { Visibility } from './configInternalPackage.js';

const rootPath = resolve();
const packageName = basename(rootPath);
const repoName = basename(dirname(dirname(rootPath)));

export default ({
  description,
  dependencies,
  devDependencies,
  internalPeerDependencies,
  externalPeerDependencies,
  examples,
  scripts,
  environment,
  bundled,
  visibility,
  hasDocGen,
  keywords,
}: {
  readonly description: string;
  readonly dependencies: Record.ReadonlyRecord<string, string>;
  readonly devDependencies: Record.ReadonlyRecord<string, string>;
  readonly internalPeerDependencies: Record.ReadonlyRecord<string, string>;
  readonly externalPeerDependencies: Record.ReadonlyRecord<string, string>;
  readonly examples: ReadonlyArray<string>;
  readonly scripts: Record.ReadonlyRecord<string, string>;
  readonly environment: Environment.Type;
  readonly bundled: boolean;
  readonly visibility: Visibility.Type;
  readonly hasDocGen: boolean;
  readonly keywords: ReadonlyArray<string>;
}) =>
  merge(
    configInternalBase({
      packageName,
      environment,
    }),
    configInternalPackage({
      packageName,
      repoName,
      description,
      dependencies,
      devDependencies,
      internalPeerDependencies,
      externalPeerDependencies,
      examples,
      scripts,
      bundled,
      visibility,
      hasDocGen,
      keywords,
    }),
  );
