// In this file, `.` represents the directory where this file is located
import { prodFolderName } from '../../shared-utils/constants.js';
export default {
  entry: ['../bin/**/*.ts', '../templates/**/*.ts'],
  target: 'esnext',
  outDir: `../../${prodFolderName}`,
};
