#!/usr/bin/env node
import { rmSync } from 'node:fs';
const fileToDelete = process.argv[2];
if (fileToDelete === undefined) throw new Error('Expected 1 argument. Received 0');
rmSync(fileToDelete, { force: true, recursive: true });
