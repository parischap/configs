import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import {
  configsPackageName,
  packageJsonFilename,
  pnpmWorkspaceFilename,
  prodFolderName,
  slashedScope,
  testUtilsPackageName,
  topPackageName,
  tsConfigFilename,
} from '../constants.js';
import topPnpmWorkspaceConfig from '../internal/topPnpmWorkspaceConfig.js';
import { packageNameFromCWD } from '../utils.js';

/**
 * Creates a diretory - Does not fail if the directory already exist
 *
 * @param {string} dirName
 * @returns {void}
 */
function mkDir(dirName) {
  if (!existsSync(dirName)) {
    /* eslint-disable-next-line functional/no-expression-statements*/
    console.log(`\tCreated directory ${dirName}`);
    /* eslint-disable-next-line functional/no-expression-statements*/
    mkdirSync(dirName, { recursive: true });
  }
}

/**
 * Creates a file with the given content if it does not exist. Does nothing if the file already
 * exists
 *
 * @param {string} filename
 * @param {string} content
 * @returns {void}
 */
function writeFileIfInexistent(filename, content) {
  /* eslint-disable-next-line functional/no-try-statements*/
  try {
    // Create prod package.json if none exists
    /* eslint-disable-next-line functional/no-expression-statements */
    writeFileSync(filename, content, { flag: 'wx' });
    /* eslint-disable-next-line functional/no-expression-statements*/
    console.log(`\tCreated file ${filename}`);
  } catch (e) {
    if (e instanceof Error) if (e.code !== 'EEXIST') throw e;
  }
}

/**
 * Creates a default package.json file with the given name at the given path if it does not exist.
 * Does nothing otherwise
 *
 * @param {string} filePath
 * @param {string} name
 * @returns {void}
 */
function writeDefaultPackageJsonAt(filePath, name) {
  /* eslint-disable-next-line functional/no-expression-statements */
  writeFileIfInexistent(
    `${filePath}/${packageJsonFilename}`,
    JSON.stringify({
      name,
    }),
  );
}

/* eslint-disable-next-line functional/no-expression-statements */
console.log('Initial setup');

if (existsSync(packageJsonFilename)) {
  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`\t'${packageJsonFilename}' already exists. Run 'pnpm update-config-files' instead`);
  /* eslint-disable-next-line functional/no-expression-statements*/
  process.exit(1);
}

if (packageNameFromCWD() !== configsPackageName) {
  /* eslint-disable-next-line functional/no-expression-statements*/
  console.log(`\tThis setup should be called from the '${configsPackageName}' package`);
  /* eslint-disable-next-line functional/no-expression-statements*/
  process.exit(1);
}

/* eslint-disable-next-line functional/no-expression-statements */
console.log(`\tRemoved ${tsConfigFilename}`);
// Remove tsconfig.json if it exists because it loads '@tsconfig/strictest' which does not exist (there is no package.json)
rmSync(tsConfigFilename, { force: true });

const prodPath = prodFolderName;
/* eslint-disable-next-line functional/no-expression-statements */
mkDir(prodPath);
/* eslint-disable-next-line functional/no-expression-statements */
writeDefaultPackageJsonAt(prodPath, `${slashedScope}${configsPackageName}`);

const testPath = `../${testUtilsPackageName}`;
/* eslint-disable-next-line functional/no-expression-statements */
mkDir(testPath);
/* eslint-disable-next-line functional/no-expression-statements */
writeDefaultPackageJsonAt(testPath, `${slashedScope}${configsPackageName}`);

const topPath = `../..`;
/* eslint-disable-next-line functional/no-expression-statements */
writeDefaultPackageJsonAt(topPath, `${slashedScope}${topPackageName}`);
/* eslint-disable-next-line functional/no-expression-statements */
writeFileIfInexistent(`${topPath}/${pnpmWorkspaceFilename}`, topPnpmWorkspaceConfig);

/* eslint-disable-next-line functional/no-expression-statements */
//execSync("pnpm i", { stdio: "inherit" });
