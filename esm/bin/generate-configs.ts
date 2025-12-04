/**
 * This bin reads the keys and values of a default object exported by the file named
 * `project.config.ts` located in the current path. It creates a file for each key of that object
 * with the key as name. If the key ends with .json, the value is converted from an object to a json
 * string with JSON.stringfy. Otherwise, the value must be a string and it is written as is. This
 * bin will also check that there are no unexpected config files present in the package, i.e config
 * files which are not created by this bin (there are a few exceptions: the `project.config.js` file
 * itself, the `README.md` file... see `patternsToIgnore` below).
 */
/* This module must not import any external dependency. It must be runnable without a package.json. It must only use Typescript syntax understandable by Node with the --experimental-transform-types flag */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';
import configMonoRepo from '../internal/configs-generation/configMonoRepo.js';
import configOnePackageRepo from '../internal/configs-generation/configOnePackageRepo.js';
import configSubRepo from '../internal/configs-generation/configSubRepo.js';
import configTop from '../internal/configs-generation/configTop.js';
import {
  configFilename,
  configsPackageName,
  docsFolderName,
  githubFolderName,
  packagesFolderName,
  pnpmLockFilename,
  prodFolderName,
  readMeFilename,
  topPackageName,
  viteTimeStampFilenamePattern,
  vscodeWorkspaceFilenamePattern,
} from '../internal/shared-utils/constants.js';
import {
  isReadonlyStringArray,
  isReadonlyStringRecord,
  isRecord,
  type Config,
} from '../internal/shared-utils/types.js';
import {
  fromPosixPathToOSPath,
  prettyStringify,
  regExpEscape,
  simpleGlob,
} from '../internal/shared-utils/utils.js';

const fromPatternsToRegExp = (patterns: ReadonlyArray<string>): RegExp =>
  new RegExp(
    '^'
      + patterns.map((pattern) => regExpEscape(pattern).replace(/\*/g, '[^\\/]*')).join('|')
      + '$',
  );
// List of configuration files for which an error must not be reported if they are present in the package and not overridden by project.config.js
const patternsToIgnore = [readMeFilename, configFilename, viteTimeStampFilenamePattern];
const patternsToIgnoreRegExp = fromPatternsToRegExp(patternsToIgnore);

// more patterns added to patternsToIgnore only for the top repo
const topPatternsToIgnore = [pnpmLockFilename, vscodeWorkspaceFilenamePattern];
const topPatternsToIgnoreRegExp = fromPatternsToRegExp(topPatternsToIgnore);

// List of folders where configuration files might be found
const foldersToInclude = [githubFolderName, docsFolderName];

const getConfigFromConfigFile = async ({
  repoName,
  packageName,
  packagePath,
}: {
  readonly repoName: string;
  readonly packageName: string;
  readonly packagePath: string;
}): Promise<Config> => {
  const configFile = await readFile(join(packagePath, configFilename), 'utf8');

  const configParameters: unknown = JSON.parse(configFile);

  if (!isRecord(configParameters))
    throw new Error(
      `'${configFilename}' must contain the json representation of a non-null object`,
    );

  const configName = configParameters['configName'];

  if (configName === 'configMonoRepo' || configName === 'configTop') {
    const description = configParameters['description'];
    if (typeof description !== 'string')
      throw new Error(
        `Parameter 'description' of '${configFilename}' should be of type string'`,
      );

    const extraKeys = Object.keys(configParameters).filter(
      (key) => !['configName', 'description'].includes(key),
    );
    if (extraKeys.length !== 0)
      throw new Error(
        `'${configFilename}' contains unexpected parameters for config '${configName}': '${extraKeys.join("', '")}'`,
      );

    if (configName === 'configMonoRepo') return configMonoRepo({ packageName, description });

    return configTop({ description });
  }

  if (configName === 'configOnePackageRepo' || configName === 'configSubRepo') {
    const description = configParameters['description'];
    if (typeof description !== 'string')
      throw new Error(
        `Parameter 'description' of '${configFilename}' should be of type string'`,
      );

    const dependencies = configParameters['dependencies'] ?? {};
    if (!isReadonlyStringRecord(dependencies))
      throw new Error(
        `Parameter 'dependencies' of '${configFilename}' should be of type ReadonlyStringRecord'`,
      );

    const devDependencies = configParameters['devDependencies'] ?? {};
    if (!isReadonlyStringRecord(devDependencies))
      throw new Error(
        `Parameter 'devDependencies' of '${configFilename}' should be of type ReadonlyStringRecord'`,
      );

    const peerDependencies = configParameters['peerDependencies'] ?? {};
    if (!isReadonlyStringRecord(peerDependencies))
      throw new Error(
        `Parameter 'peerDependencies' of '${configFilename}' should be of type ReadonlyStringRecord'`,
      );

    const examples = configParameters['examples'] ?? [];
    if (!isReadonlyStringArray(examples))
      throw new Error(
        `Parameter 'examples' of '${configFilename}' should be of type ReadonlyStringArray'`,
      );

    const scripts = configParameters['scripts'] ?? {};
    if (!isReadonlyStringRecord(scripts))
      throw new Error(
        `Parameter 'scripts' of '${configFilename}' should be of type ReadonlyStringRecord'`,
      );

    const environment = configParameters['environment'];
    if (typeof environment !== 'string')
      throw new Error(
        `Parameter 'environment' of '${configFilename}' should be of type string'`,
      );

    const buildMethod = configParameters['buildMethod'];
    if (typeof buildMethod !== 'string')
      throw new Error(
        `Parameter 'buildMethod' of '${configFilename}' should be of type string'`,
      );

    const isPublished = configParameters['isPublished'];
    if (typeof isPublished !== 'boolean')
      throw new Error(
        `Parameter 'isPublished' of '${configFilename}' should be of type boolean'`,
      );

    const hasDocGen = configParameters['hasDocGen'];
    if (typeof hasDocGen !== 'boolean')
      throw new Error(
        `Parameter 'hasDocGen' of '${configFilename}' should be of type boolean'`,
      );

    const keywords = configParameters['keywords'] ?? [];
    if (!isReadonlyStringArray(keywords))
      throw new Error(
        `Parameter 'keywords' of '${configFilename}' should be of type ReadonlyStringArray'`,
      );

    const useEffectAsPeerDependency = configParameters['useEffectAsPeerDependency'];
    if (typeof useEffectAsPeerDependency !== 'boolean')
      throw new Error(
        `Parameter 'useEffectAsPeerDependency' of '${configFilename}' should be of type boolean'`,
      );

    const useEffectPlatform = configParameters['useEffectPlatform'] ?? 'No';
    if (typeof useEffectPlatform !== 'string')
      throw new Error(
        `Parameter 'useEffectPlatform' of '${configFilename}' should be of type string'`,
      );

    const prefixForAutogeneratedIndex = configParameters['prefixForAutogeneratedIndex'];
    if (typeof prefixForAutogeneratedIndex !== 'string')
      throw new Error(
        `Parameter 'prefixForAutogeneratedIndex' of '${configFilename}' should be of type string'`,
      );

    const extraKeys = Object.keys(configParameters).filter(
      (key) =>
        ![
          'configName',
          'description',
          'dependencies',
          'devDependencies',
          'peerDependencies',
          'examples',
          'scripts',
          'environment',
          'buildMethod',
          'isPublished',
          'hasDocGen',
          'keywords',
          'useEffectAsPeerDependency',
          'useEffectPlatform',
          'prefixForAutogeneratedIndex',
        ].includes(key),
    );
    if (extraKeys.length !== 0)
      throw new Error(
        `'${configFilename}' contains unexpected parameters for config '${configName}': '${extraKeys.join("', '")}'`,
      );

    if (configName === 'configOnePackageRepo')
      return configOnePackageRepo({
        packageName,
        description,
        dependencies,
        devDependencies,
        peerDependencies,
        examples,
        scripts,
        environment,
        buildMethod,
        isPublished,
        hasDocGen,
        keywords,
        useEffectAsPeerDependency,
        useEffectPlatform,
        prefixForAutogeneratedIndex,
      });

    return configSubRepo({
      repoName,
      packageName,
      description,
      dependencies,
      devDependencies,
      peerDependencies,
      examples,
      scripts,
      environment,
      buildMethod,
      isPublished,
      hasDocGen,
      keywords,
      useEffectAsPeerDependency,
      useEffectPlatform,
      prefixForAutogeneratedIndex,
    });
  }

  throw new Error(
    `'${configFilename}' contains unexpected value for configName parameter`,
  );
};

const applyConfig = async ({
  packagePath,
  repoName,
  packageName,
  isTop,
}: {
  readonly packagePath: string;
  readonly repoName: string;
  readonly packageName: string;
  readonly isTop: boolean;
}) => {
  console.log(`\nCreating configuration files for '${packageName}'`);

  console.log(`  Reading '${configFilename}'`);

  const config = await getConfigFromConfigFile({ repoName, packageName, packagePath });

  // In project.config.ts, paths are posix-Style. Let's convert them to OS style
  const filesToCreate = Object.keys(config).map(fromPosixPathToOSPath);
  console.log('  Determining potential conflicting files');

  const configFiles = (
    await Promise.all([
      simpleGlob({ path: packagePath, recursive: false, keepFilesOrFolders: 'Files' }),
      ...foldersToInclude.map((folderPath) =>
        simpleGlob({
          path: join(packagePath, folderPath),
          recursive: true,
          keepFilesOrFolders: 'Files',
          relativePathSource: packagePath,
        }),
      ),
    ])
  ).flat();

  const unexpectedConfigFiles = configFiles
    .filter(
      ({ relativePath }) =>
        !filesToCreate.includes(relativePath)
        && !patternsToIgnoreRegExp.test(relativePath)
        && !(isTop || topPatternsToIgnoreRegExp.test(relativePath)),
    )
    .map(({ name }) => name);

  if (unexpectedConfigFiles.length > 0)
    throw new Error(
      'Following unexpected files where found in the package:\n'
        + unexpectedConfigFiles.join(',\n'),
    );

  console.log('  Writing configuration files');
  for (const [filename, fileContent] of Object.entries(config)) {
    const contentToWriteFunc =
      extname(filename) === '.json' ? () => prettyStringify(fileContent)
      : typeof fileContent === 'string' ? () => fileContent
      : () => {
          throw new Error(
            `Entry '${filename}' in '${configFilename}' must have value of type string`,
          );
        };

    const targetFilename = join(packagePath, filename);
    // Create directory in case it does not exist
    /* eslint-disable-next-line functional/no-expression-statements*/
    await mkdir(dirname(targetFilename), { recursive: true });

    /* eslint-disable-next-line functional/no-expression-statements*/
    await writeFile(targetFilename, contentToWriteFunc());
  }
};

const packagePath = process.cwd();
const packageName = basename(packagePath);

if (packageName === configsPackageName) {
  console.log('Creating configuration files and updating imports for all packages');

  const topPath = join('..', '..');
  /* eslint-disable-next-line functional/no-expression-statements*/
  await applyConfig({
    packagePath: topPath,
    repoName: topPackageName,
    packageName: topPackageName,
    isTop: true,
  });

  console.log('\nHandling repo level');
  const topPackagesPath = join(topPath, packagesFolderName);
  const repoNames =
    await simpleGlob({ path: topPackagesPath, recursive: false, keepFilesOrFolders: 'Folders' });

  /* eslint-disable-next-line functional/no-expression-statements*/
  await Promise.all(
    repoNames.map(({name, path}) =>
      applyConfig({
        packagePath: path,
        repoName:name,
        packageName: name,
        isTop: false,
      }),
    ),
  );

  /* eslint-disable-next-line functional/no-expression-statements*/
  await Promise.all(
    repoNames.map(async (repoName) => {
        const repoPath = join(topPackagesPath, repoName);
        const subRepos = await simpleGlob({
          path: join(repoPath, packagesFolderName),
          recursive: false,
          keepFilesOrFolders: 'Folders',
        });

      const isMonoRepo = subRepos.length === 0;

      console.log(`\nHandling ${isMonoRepo ? 'monorepo' : 'one-package repo'} '${repoName}'`);

      if (!isMonoRepo) {
          /* Remove dist directories of one-package repos because the packages will need rebuilding and these directories might contain conflicting versions of imported packages */
          console.log('  Removing dist directory');
          /* eslint-disable-next-line functional/no-expression-statements*/
          await rm(join(repoPath, prodFolderName), { force: true, recursive: true });
      }
      
      console.log(`\nHandling subrepos of '${repoName}'`);

      /* Remove dist directories of subrepos because the packages will need rebuilding and these directories might contain conflicting versions of imported packages */
      /* eslint-disable-next-line functional/no-expression-statements*/
      await Promise.all(
        subRepos.map(({ name, path }) => {
          console.log(`  '${name}': Removing dist directory`);
          return rm(join(path, prodFolderName), { force: true, recursive: true });
        }),
      );

      /* eslint-disable-next-line functional/no-expression-statements*/
      await Promise.all(
        subRepos.map(({ name, path }) =>
          applyConfig({
            packagePath: path,
            repoName,
            packageName: name,
            isTop: false,
          }),
        ),
      );
    }),
  );
} else {
  console.log('Creating configuration files and updating imports');

  const [isTop, repoName] =
    packageName === topPackageName ?
      [true, topPackageName]
    : ((name: string) => (name === topPackageName ? [false, packageName] : [false, name]))(
        basename(dirname(dirname(packagePath))),
      );

  /* eslint-disable-next-line functional/no-expression-statements*/
  await applyConfig({
    packagePath: '.',
    repoName,
    packageName,
    isTop,
  });
}

console.log('SUCCESS');
