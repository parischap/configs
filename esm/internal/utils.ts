import { Function, Option, String, pipe } from 'effect';
import * as path from 'node:path';
import * as constants from './constants.js';

//import { isAbsolute, join, relative, sep } from "node:path";

//const relativePathStart = '.' + path.sep;

//export const denormalize = (p: string): string => relativePathStart + p;

export const extension = (filename: string) =>
	pipe(
		filename,
		String.lastIndexOf('.'),
		Option.map(Function.flip(String.substring)(filename)),
		Option.getOrElse(() => '')
	);

export const fromOsPathToPosixPath: (p: string) => string =
	path.sep === path.posix.sep ? Function.identity : String.replaceAll(path.sep, path.posix.sep);

/*export const fromPosixPathToOsPath: (p: string) => string =
	path.sep === path.posix.sep ? Function.identity : String.replaceAll(path.posix.sep, path.sep);*/

export const expandify = (arr: ReadonlyArray<string>) => `{${arr.join(',')}}`;

export const isSubPathOf = (target: string) => (p: string) => {
	const relPath = path.relative(target, p);
	return !relPath.startsWith('..') && !path.isAbsolute(relPath);
};

/*export const replaceTopPathWith = (oldTopPath: string, newTopPath: string) => (p: string) => {
	const relPath = path.relative(oldTopPath, p);
	if (relPath.startsWith('..') || path.isAbsolute(relPath)) return p;
	return relativePathStart + path.join(newTopPath, relPath);
};

export const replaceExtensionWith = (oldExtension: string, newExtension: string) => (p: string) => {
	const pos = p.lastIndexOf('.');
	if (pos < 0 || p.substring(pos) !== oldExtension) return p;
	return p.substring(0, pos) + newExtension;
};*/

export const prodWorkspaceLink = 'workspace:*';
export const devWorkspaceLink = (packageName: string): string =>
	`workspace:${constants.slashedDevScope}${packageName}@*`;
