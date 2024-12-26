import * as constants from './constants.js';
import eslintConfigNodeTemplate from './eslint.config.node.template.js';
import tsConfigSrcNode from './tsconfig.src.node.js';

export default {
	[constants.projectTsConfigFileName]: tsConfigSrcNode,
	[constants.eslintConfigFileName]: eslintConfigNodeTemplate
};
