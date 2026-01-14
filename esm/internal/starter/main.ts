import { exec } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';
import {
  internalFolderName,
  libBundler,
  prodFolderName,
  sourceFolderName,
  testsIndexFilename,
  typescript /* @ts-expect-error Need to import ts extension because this file is run with node --experimental-transform-types */,
} from '../shared-utils/constants.ts';

const promisifiedExec = promisify(exec);
const { dirname } = import.meta;

let tsdown: typeof import('tsdown');

try {
  /* eslint-disable-next-line functional/no-expression-statements */
  tsdown = await import('tsdown');
} catch (_e) {
  const { stdout, stderr } = await promisifiedExec(`pnpm add ${libBundler[0]} ${typescript[0]}`);
  if (stdout !== '') console.log(stdout);
  if (stderr !== '') {
    console.error(stderr);
    process.exit(1);
  }
  /* eslint-disable-next-line functional/no-expression-statements */
  tsdown = await import('tsdown');
}

/* eslint-disable-next-line functional/no-expression-statements */
await tsdown.build({
  cwd: join(dirname, '../../..'),
  entry: [
    `${sourceFolderName}/**/*.ts`,
    `!./${sourceFolderName}/${internalFolderName}/**/*.ts`,
    `!./${sourceFolderName}/${testsIndexFilename}`,
  ],
  clean: true,
  sourcemap: true,
  dts: { build: true, sourcemap: true, tsgo: true },
  target: 'esnext',
  minify: true,
  outDir: `${prodFolderName}/${sourceFolderName}`,
  outExtensions: () => ({ js: '.js' }),
  format: ['esm'],
});
