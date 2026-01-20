import { type ReadonlyRecord, deepMerge2 } from '../../shared-utils/utils.js';
import TsconfigSource from './TsconfigSource.js';

export default deepMerge2(TsconfigSource, {
  compilerOptions: {
    types: [],
    /* We don't use any dom specifities in our client code because it must runnable on the server. DOM manipulation is taken care of by preact */
    //Lib: ['DOM', 'DOM.Iterable'],
  },
}) satisfies ReadonlyRecord;
