import { exec } from 'node:child_process';

exec('pnpx tsdown --clean --target esnext -d dist esm/bin/*.ts esm/templates/*.ts');
