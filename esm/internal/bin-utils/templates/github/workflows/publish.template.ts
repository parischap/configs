/*
 * Publishes a sub-package or a one-package repo to npm. Triggered by a new release but can be started manually. Based on the release tag that must be in the form
 * `version` or `repo@version`, it will create and build the target repo, update the version number of the
 * package.json in this repo and publish the repo to npm. If started manually, it
 * uses the release number of the last issued release. It can be useful if the publish action has
 * failed and no modification to the code is necessary. If a modification to the code is necessary,
 * a new release will have to be issued.
 *
 */

import { githubActionTimeOut } from '../../../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../../../shared-utils/utils.js';

export default {
  name: 'publish',
  on: {
    workflow_dispatch: null,
    release: {
      types: ['created'],
    },
  },
  concurrency: {
    group: '${{ github.workflow }}-${{ github.ref }}',
    'cancel-in-progress': true,
  },
  permissions: {
    'id-token': 'write',
  },
  jobs: {
    publish: {
      'runs-on': 'ubuntu-latest',
      'timeout-minutes': githubActionTimeOut,
      steps: [
        {
          name: 'checkout files',
          uses: 'actions/checkout@v4',
        },
        {
          name: 'Setup pnpm',
          uses: 'pnpm/action-setup@v4.0.0',
          with: {
            run_install: true,
          },
        },
        {
          name: 'Install Node.js',
          uses: 'actions/setup-node@v4',
          with: {
            'node-version': 'latest',
            cache: 'pnpm',
            'registry-url': 'https://registry.npmjs.org/',
          },
        },
        {
          name: 'Get latest release when entering by workflow_dispatch',
          run: 'git fetch --prune --unshallow\necho "previous_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo \'\')" >> $GITHUB_ENV\n',
          if: '${{!github.event.release.tag_name}}',
        },
        {
          name: 'Get the target repository and version number',
          id: 'determine-repo_and_version',
          uses: 'actions/github-script@v7',
          env: {
            previous_tag: '${{env.previous_tag}}',
          },
          with: {
            script:
              "const {previous_tag} = process.env\nconst tag = context.payload.release?.tag_name??previous_tag;\nconst pos = tag.lastIndexOf('@');\nconst version = tag.substring(pos + 1);\nconst repo = (pos === -1) ? '.' : 'packages/' + tag.substring(0, pos);\nreturn {\n  repo,\n  version,\n  versionValidity: /^(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)$/.test(version)\n};\n",
          },
        },
        {
          id: 'get-version-validity',
          run: 'echo "versionValidity=${{fromJson(steps.determine-repo_and_version.outputs.result).versionValidity}}" >> $GITHUB_OUTPUT',
        },
        {
          name: 'Fail if version number is ill-formed',
          if: "${{steps.get-version-validity.outputs.versionValidity == 'false'}}",
          run: 'exit 1',
        },
        {
          id: 'get-version',
          run: 'echo "version=${{fromJson(steps.determine-repo_and_version.outputs.result).version}}" >> $GITHUB_OUTPUT',
        },
        {
          id: 'get-repo',
          run: 'echo "repo=${{fromJson(steps.determine-repo_and_version.outputs.result).repo}}" >> $GITHUB_OUTPUT',
        },
        {
          name: 'Update version number in package.json',
          id: 'update-package-json',
          uses: 'jaywcjlove/github-action-package@main',
          with: {
            path: "'${{steps.get-repo.outputs.repo}}/package.json'",
            version: '${{steps.get-version.outputs.version}}',
          },
        },
        {
          name: 'Build and publish',
          'working-directory': '${{steps.get-repo.outputs.repo}}',
          env: {
            NODE_AUTH_TOKEN: '${{ secrets.NPM_PUBLISH_TOKEN }}',
          },
          run: 'pnpm build-and-publish',
        },
      ],
    },
  },
} satisfies ReadonlyRecord;
