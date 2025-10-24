/**
 * Note that this package has very few dependencies. So all the imports used by the eslint
 * configuration (plugins and pre-defined configs) are devDependencies and therefore do not ship
 * bundled with this package. This is intentional:
 *
 * - Because the client packages will import the same devDependencies, which they will need for vsCode
 *   and its plugins;
 * - Because if they were bundled, there would be a risk that the bundled package and the one imported
 *   by the client packages are not in the same version.
 */
import { allJsFiles } from '../projectConfig/constants.js';
/**
 * @import { Config} from "prettier"
 */

/**
 * @type Config
 */
export default {
  printWidth:  100,
  overrides: [
    {
      files: allJsFiles,
      options: {
        singleQuote: true,
        experimentalTernaries: true,
        experimentalOperatorPosition: 'start',
        jsdocCapitalizeDescription: false,
        plugins: ['prettier-plugin-jsdoc'],
      },
    },
  ],
};
