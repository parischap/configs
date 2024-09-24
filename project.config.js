import * as Configs from '@parischap/configs';

export default {
	// Put prettier in first position so the next generated files will get formatted
	[Configs.constants.prettierConfigFileName]: Configs.prettierConfigTemplate,
	[Configs.constants.gitIgnoreFileName]: Configs.gitIgnoreTemplate,
	[Configs.constants.madgeConfigFileName]: Configs.madgercTemplate,
	[Configs.constants.prettierIgnoreFileName]: Configs.prettierIgnore,
	[Configs.constants.projectTsConfigFileName]: Configs.tsConfigSrcNode,
	[Configs.constants.nonProjectTsConfigFileName]: Configs.tsConfigOthers,
	[Configs.constants.baseTsConfigFileName]: Configs.tsConfigBase,
	[Configs.constants.tsConfigFileName]: Configs.tsConfig,
	//[Configs.constants.eslintTsConfigFileName]: Configs.tsConfigEslint,
	[Configs.constants.tscLintTsConfigFileName]: Configs.tsConfigCheck,
	[Configs.constants.eslintConfigFileName]: Configs.eslintConfigNodeTemplate,
	[Configs.constants.viteConfigFileName]: 'export default {};',
	[Configs.constants.packageJsonFileName]: Configs.packageStarter,
	[Configs.constants.licenseFileName]: Configs.licenseTemplate,
	[`${Configs.constants.githubFolderName}/${Configs.constants.workflowsFolderName}/publish.yml`]:
		Configs.githubWorkflowsPublishTemplate
};
