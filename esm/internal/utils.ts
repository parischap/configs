import { Function, Option, String, pipe } from 'effect';
import * as path from 'node:path';
import * as constants from './constants.js';

export const extension = (filename: string) =>
  pipe(
    filename,
    String.lastIndexOf('.'),
    Option.map(Function.flip(String.substring)(filename)),
    Option.getOrElse(() => ''),
  );

export const fromOsPathToPosixPath: (p: string) => string =
  path.sep === path.posix.sep ? Function.identity : String.replaceAll(path.sep, path.posix.sep);

export const isSubPathOf = (target: string) => (p: string) => {
  const relPath = path.posix.relative(target, p);
  return !relPath.startsWith('..') && !path.posix.isAbsolute(relPath);
};

export const prodWorkspaceLink = 'workspace:*';
export const devWorkspaceLink = (packageName: string): string =>
  `workspace:${constants.slashedDevScope}${packageName}@*`;
