export default `
# This workflow is used to debug npm publish

name: publish-debug

on:
  workflow_dispatch:

jobs:
  publish-npm:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: checkout files
        uses: actions/checkout@v4
      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "latest"
          registry-url: https://registry.npmjs.org/
      - run: mkdir dist
      - run: echo '{"name":"@parischap/configs","version":"0.0.19"}' > dist/package.json
      - run: npm publish ./dist
        env:
          NODE_AUTH_TOKEN: \${{secrets.NPM_PUBLISH_TOKEN}}
`;
