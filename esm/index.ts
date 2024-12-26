import configBaseBrowser from './shared/config.base.browser.js';
import configBaseLibrary from './shared/config.base.library.js';
import configBaseNode from './shared/config.base.node.js';
import configStarter from './shared/config.starter.js';
import configTop from './shared/config.top.js';
import * as constants from './shared/constants.js';
import eslintConfigBase from './shared/eslint.config.base.js';
import eslintConfigBrowser from './shared/eslint.config.browser.js';
import eslintConfigLibrary from './shared/eslint.config.library.js';
import eslintConfigNode from './shared/eslint.config.node.js';
import githubWorkflowsPublishDebugTemplate from './shared/github.workflows.publish-debug.template.js';
import packageBase from './shared/package.base.js';
import packageMonoRepo from './shared/package.monorepo.js';
import packageSubRepoPrivate from './shared/package.subrepo.private.js';
import packageSubRepoPublic from './shared/package.subrepo.public.js';
import packageSubRepoWithPublic from './shared/package.subrepo.with-public.js';
import pnpmWorkspaceTemplate from './shared/pnpm.workspace.template.js';
import prettierConfigBase from './shared/prettier.config.base.js';
import tsConfigTop from './shared/tsconfig.top.js';
import * as utils from './shared/utils.js';
import vitestWorkspaceTemplate from './shared/vitest.workspace.template.js';

export {
	configBaseBrowser,
	configBaseLibrary,
	configBaseNode,
	configStarter,
	configTop,
	constants,
	eslintConfigBase,
	eslintConfigBrowser,
	eslintConfigLibrary,
	eslintConfigNode,
	githubWorkflowsPublishDebugTemplate,
	packageBase,
	packageMonoRepo,
	packageSubRepoPrivate,
	packageSubRepoPublic,
	packageSubRepoWithPublic,
	pnpmWorkspaceTemplate,
	prettierConfigBase,
	tsConfigTop,
	utils,
	vitestWorkspaceTemplate
};
