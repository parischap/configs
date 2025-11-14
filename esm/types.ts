import { packageJsonFilename } from './constants.js';

export type Environment = 'Node' | 'Library' | 'Browser';

/**
 * A library is a set of exported modules that are made separately available to a client.
 *
 * All modules in a library need not be exported. The modules not to be exported must be put away
 * under `esm/internal/`.
 *
 * Any exported module must be made available to the client either as named import `import { MArray
 * } from "@parischap/effect-lib";` and default import `import * as MArray from
 * "@parischap/effect-lib/MArray";`.
 *
 * A `index.ts` file in `esm/` must reexport all modules under `esm/` and not under `esm/internal`.
 * This file could be generated during the build. However, it is very convenient to enable
 * auto-completion of imports in vscode and this only works with named imports reexported in the
 * `index.ts` file. So this file must be generated on the fly, either manually or by using vscode
 * `TypeScript Barrel Generator` plugin.
 *
 * A library can be public or private. A private library can be installed directly from github and
 * does not need to be built: it is directly consumed in its Typescript version.
 *
 * For public libraries, the build phase must:
 *
 * - transpile all modules from Typescript to a widely natively understandable javascript.
 *   Transpilation is performed by `tsc` for `esm` output and by `babel` for `cjs` output. Type
 *   files get also generated for `esm` output.
 * - Transform named imports after transpilation: Vscode will generate named imports during editing,
 *   but tree-shaking will the fail. So they must be changed to default imports during the build.
 * - Copy `esm/README.md` if there is one to `dist`.
 * - Generate a `LICENSE` file directly under `dist`.
 * - Copy `esm/package.json` to `dist`, change the package name to prod name, spread the
 *   `publishConfig`, remove specific keys (`scripts`, `devDependencies`, `publishConfig`,
 *   `packageManager`, `pnpm`, `devEngine`), remove keys with undefined values.
 * - Generate a `package.json` file under `dist/cjs` with a `commonjs` type.
 * - for each file under `esm/` and not under `esm/internal/` except `index.ts`, create a folder with
 *   a `package.json` for default imports and update the `exports` field of `package.json`
 *   accordingly.
 *
 * Each module in a library except those under `esm/internal` must be documented.
 *
 * Documentation and type do not get generated for any value commented with tsdoc `@internal`.
 * `@internal` should be used for any value exported in a module under `esm/internal`. It should
 * also be used for any value exported only for test purposes (clients using typescript will be
 * informed that this value should not be used).
 *
 * Each module in a library must be tested.
 *
 * A library must import itself as `devDependency` for test purposes.
 *
 * If several libraries are interdependent, they can be grouped in a monorepo. In that case, if one
 * of the libraries in the monorepo uses another library of the monorepo, it must import the dev
 * version of that library in development (so any modification in the dependencies is immediately
 * taken into account for tests) and the prod version of that library (the one in the `npm` registry
 * if it's a public library, or the one in the `dist/` directory if it's a private library) in
 * production.
 */
export type BuildMethod = 'None' | 'Transpile' | 'Bundle' | 'BundleWithDeps' | 'AppClient';

export type Record<K extends string | symbol = string, V = unknown> = {
  [k in K]: V;
};

export type ReadonlyRecord<K extends string | symbol = string, V = unknown> = {
  readonly [k in K]: V;
};

/* eslint-disable-next-line functional/type-declaration-immutability */
export interface StringRecord extends Record<string, string> {}

export interface ReadonlyStringRecord extends ReadonlyRecord<string, string> {}

export interface Config {
  readonly [key: string]: string | ReadonlyRecord;
  readonly [packageJsonFilename]: {
    readonly [key: string]: unknown;
    readonly name: string;
    readonly dependencies?: ReadonlyStringRecord;
    readonly devDependencies?: ReadonlyStringRecord;
    readonly peerDependencies?: ReadonlyStringRecord;
  };
}

export const isArray: (v: unknown) => v is Array<unknown> = Array.isArray;

export const isRecord = (v: unknown): v is Record =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
