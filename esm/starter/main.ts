import { exec } from 'node:child_process';
import { build } from 'tsdown';

await build({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  // ...any other options
});

exec('pnpx tsdown --clean --target esnext -d dist esm/bin/*.ts esm/templates/*.ts');
