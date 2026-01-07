import { owner } from '../../../../shared-utils/constants.js';
import { type ReadonlyRecord } from '../../../../shared-utils/utils.js';

export default ({ name }: { readonly name: string }): ReadonlyRecord => ({
  remote_theme: 'mikearnaldi/just-the-docs',
  search_enabled: true,
  aux_links: { '"GitHub"': [`"//github.com/${owner}/${name}"`] },
});
