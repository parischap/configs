import { execSync } from 'node:child_process';
import { unlinkSync } from 'node:fs';
import { join } from 'node:path';

/* eslint functional/no-expression-statements: off */
try {
	try {
		unlinkSync('tsconfig.json');
	} catch (e) {
		if (typeof e === 'object' && e !== null && 'code' in e && e.code !== 'ENOENT') throw e;
	}

	execSync(
		`pnpm add -D effect@latest && pnpm add -D ts-deepmerge@latest && pnpm add -D vite@latest && pnpm add -D vite-node@latest && pnpm i`
	);

	const { createServer } = await import('vite');
	const { ViteNodeRunner } = await import('vite-node/client');
	const { ViteNodeServer } = await import('vite-node/server');
	const { installSourcemapsSupport } = await import('vite-node/source-map');

	// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- Necessary check to make sure the import was available
	if (!createServer) {
		console.log('createServer should be available in vite');
		process.exit(1);
	}

	// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- Necessary check to make sure the import was available
	if (!ViteNodeServer) {
		console.log('ViteNodeServer should be available in vite-node/server');
		process.exit(1);
	}

	// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- Necessary check to make sure the import was available
	if (!ViteNodeRunner) {
		console.log('ViteNodeRunner should be available in vite-node/client');
		process.exit(1);
	}

	// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- Necessary check to make sure the import was available
	if (!installSourcemapsSupport) {
		console.log('installSourcemapsSupport should be available in vite-node/source-map');
		process.exit(1);
	}
	// create vite server
	const server = await createServer({
		optimizeDeps: {
			// It's recommended to disable deps optimization
			noDiscovery: true,
			include: []
		}
	});
	// this is needed to initialize the plugins
	await server.pluginContainer.buildStart({});

	// create vite-node server
	const node = new ViteNodeServer(server);

	// fixes stacktraces in Errors
	installSourcemapsSupport({
		getSourceMap: (source) => node.getSourceMap(source)
	});

	// create vite-node runner
	const runner = new ViteNodeRunner({
		root: server.config.root,
		base: server.config.base,
		// when having the server and runner in a different context,
		// you will need to handle the communication between them
		// and pass to this function
		fetchModule(id) {
			return node.fetchModule(id);
		},
		resolveId(id, importer) {
			return node.resolveId(id, importer);
		}
	});

	await runner.executeFile(join(import.meta.dirname, 'write-files.ts'));

	// close the vite server
	await server.close();

	execSync('pnpm i');
} catch (e) {
	console.log(e);
	process.exit(1);
}
