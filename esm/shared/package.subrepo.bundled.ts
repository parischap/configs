export default {
	scripts: {
		build: 'pnpm clean-prod && bundle-files && prodify && pnpm install-prod',
		// Checks have to be carried out after build for the configs repo
		'build-and-publish': 'pnpm build && pnpm checks && pnpm publish-to-npm'
	}
};
