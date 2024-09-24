import * as constants from './shared/constants.js';
import docgenConfig from './shared/docgenConfig.js';
import eslintConfigBase from './shared/eslint.config.base.js';
import eslintConfigBrowser from './shared/eslint.config.browser.js';
import eslintConfigBrowserTemplate from './shared/eslint.config.browser.template.js';
import eslintConfigLibrary from './shared/eslint.config.library.js';
import eslintConfigLibraryTemplate from './shared/eslint.config.library.template.js';
import eslintConfigNode from './shared/eslint.config.node.js';
import eslintConfigNodeTemplate from './shared/eslint.config.node.template.js';
import githubWorkflowsPagesTemplate from './shared/github.workflows.pages.template.js';
import githubWorkflowsPublishDebugTemplate from './shared/github.workflows.publish-debug.template.js';
import githubWorkflowsPublishTemplate from './shared/github.workflows.publish.template.js';
import gitIgnoreTemplate from './shared/gitignore.template.js';
import licenseTemplate from './shared/license.template.js';
import madgercTemplate from './shared/madge.template.js';
import packageBase from './shared/package.base.js';
import packageMonoRepo from './shared/package.monorepo.js';
import packageStarter from './shared/package.starter.js';
import packageSubRepoBundledEffect from './shared/package.subrepo.bundled.effect.js';
import packageSubRepoBundled from './shared/package.subrepo.bundled.js';
import packageSubRepo from './shared/package.subrepo.js';
import packageSubRepoPrivate from './shared/package.subrepo.private.js';
import packageSubRepoPublic from './shared/package.subrepo.public.js';
import packageSubRepoTranspiledEffect from './shared/package.subrepo.transpiled.effect.js';
import packageSubRepoTranspiled from './shared/package.subrepo.transpiled.js';
import packageSubRepoWithPublic from './shared/package.subrepo.with-public.js';
import packageTop from './shared/package.top.js';
import pnpmWorkspaceTemplate from './shared/pnpm.workspace.template.js';
import prettierConfigBase from './shared/prettier.config.base.js';
import prettierConfigTemplate from './shared/prettier.config.template.js';
import prettierIgnore from './shared/prettierignore.js';
import tsConfigBase from './shared/tsconfig.base.js';
import tsConfigCheck from './shared/tsconfig.check.js';
import tsconfigDocgen from './shared/tsconfig.docgen.js';
import tsConfig from './shared/tsconfig.js';
import tsConfigOthers from './shared/tsconfig.others.js';
import tsConfigSrcBrowser from './shared/tsconfig.src.browser.js';
import tsConfigSrcLibrary from './shared/tsconfig.src.library.js';
import tsConfigSrcNode from './shared/tsconfig.src.node.js';
import tsConfigTop from './shared/tsconfig.top.js';
import * as utils from './shared/utils.js';
import vitestWorkspaceTemplate from './shared/vitest.workspace.template.js';

export {
	constants,
	docgenConfig,
	eslintConfigBase,
	eslintConfigBrowser,
	eslintConfigBrowserTemplate,
	eslintConfigLibrary,
	eslintConfigLibraryTemplate,
	eslintConfigNode,
	eslintConfigNodeTemplate,
	gitIgnoreTemplate,
	githubWorkflowsPagesTemplate,
	githubWorkflowsPublishDebugTemplate,
	githubWorkflowsPublishTemplate,
	licenseTemplate,
	madgercTemplate,
	packageBase,
	packageMonoRepo,
	packageStarter,
	packageSubRepo,
	packageSubRepoBundled,
	packageSubRepoBundledEffect,
	packageSubRepoPrivate,
	packageSubRepoPublic,
	packageSubRepoTranspiled,
	packageSubRepoTranspiledEffect,
	packageSubRepoWithPublic,
	packageTop,
	pnpmWorkspaceTemplate,
	prettierConfigBase,
	prettierConfigTemplate,
	prettierIgnore,
	tsConfig,
	tsConfigBase,
	tsConfigCheck,
	tsConfigOthers,
	tsConfigSrcBrowser,
	tsConfigSrcLibrary,
	tsConfigSrcNode,
	tsConfigTop,
	tsconfigDocgen,
	utils,
	vitestWorkspaceTemplate
};
