import { owner } from '../constants.js';

export default (packageName: string) => `remote_theme: mikearnaldi/just-the-docs
search_enabled: true
aux_links:
  "GitHub":
    - "//github.com/${owner}/${packageName}"`;
