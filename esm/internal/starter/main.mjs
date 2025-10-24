import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import * as UpdateConfigFiles from "../bin/update-config-files.js";
import { packageJsonFileName } from "../projectConfig/constants.js";

import configOnePackageRepo from "../projectConfig/configOnePackageRepo.js";

/* eslint-disable-next-line functional/no-try-statements*/
try {
  try {
    // Create default package.json if none exists
    writeFileSync(
      packageJsonFileName,
      JSON.stringify(
        configOnePackageRepo({
          description: "",
          dependencies: {},
          devDependencies: {},
          internalPeerDependencies: {},
          externalPeerDependencies: {},
          examples: [],
          scripts: {},
          environment: "Node",
          bundled: true,
          visibility: "Private",
          hasDocGen: false,
          keywords: [],
        })[packageJsonFileName],
        null,
        2
      ),
      { flag: "wx" }
    );
  } catch (e) {
    if (e instanceof Error) if (e.code !== "EEXIST") throw e;
  }

  /* eslint-disable-next-line functional/no-expression-statements */
  execSync("pnpm i", { stdio: "inherit" });
  
  /* eslint-disable-next-line functional/no-expression-statements */
  await UpdateConfigFiles.command();

  /* eslint-disable-next-line functional/no-expression-statements */
  execSync("pnpm i", { stdio: "inherit" });
} catch (e) {
  if (e instanceof Error)
    /* eslint-disable-next-line functional/no-expression-statements*/
    console.log(`\tError thrown with message: '${e.message}'`);
  process.exit(1);
}

/* eslint-disable-next-line functional/no-expression-statements*/
console.log("\tSUCCESS");
