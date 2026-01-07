import { deepMerge2, type ReadonlyRecord } from '../../shared-utils/utils.js';
import TsconfigSource from './tsconfig.source.template.js';

export default deepMerge2(TsconfigSource, {
  compilerOptions: {
    types: [],
    /* We don't use any dom specifities in our client code because it must runnable on the server. DOM manipulation is taken care of by preact */
    //lib: ['DOM', 'DOM.Iterable'],
  },
}) satisfies ReadonlyRecord;
