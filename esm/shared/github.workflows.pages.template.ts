export default `
# This workflow is triggered by a new release. It will create the documentation and push it to github pages

name: Pages
on:
  workflow_dispatch:

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

permissions: {}

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v4.0.0
        with:
          run_install: true
      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "latest"
          cache: pnpm
          registry-url: https://registry.npmjs.org/
      - run: pnpm docgen
      - name: Build pages Jekyll
        uses: actions/jekyll-build-pages@v1
        with:
          source: ./docs
          destination: ./_site
      - name: Upload pages artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: build
    permissions:
      pages: write # To deploy to GitHub Pages
      id-token: write # To verify the deployment originates from an appropriate source
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
