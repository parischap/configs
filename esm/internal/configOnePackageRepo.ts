/** This config is the one to be used in a standalone repo which is either a library or an executable */
import { Record } from 'effect';
import { basename, resolve } from 'node:path';
import { merge } from 'ts-deepmerge';
import configInternalBase, { Environment } from './configInternalBase.js';
import configInternalPackage, { Visibility } from './configInternalPackage.js';
import configInternalTop from './configInternalTop.js';

const packageName = basename(resolve());

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
  hasStaticFolder,
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
  readonly hasStaticFolder: boolean;
  readonly hasDocGen: boolean;
  readonly keywords: ReadonlyArray<string>;
}) =>
  merge(
    configInternalBase({
      packageName,
      environment,
    }),
    configInternalTop,
    configInternalPackage({
      packageName,
      repoName: packageName,
      description,
      dependencies,
      devDependencies,
      internalPeerDependencies,
      externalPeerDependencies,
      examples,
      scripts,
      bundled,
      visibility,
      hasStaticFolder,
      hasDocGen,
      keywords,
    }),
  );
