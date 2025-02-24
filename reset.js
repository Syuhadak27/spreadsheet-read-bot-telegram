import { resetCacheUtama } from './master.js';
import { resetInoutCache } from './inout.js';
import { resetCacheStok } from './stok.js';
import { resetListCache } from './list.js';

export async function resetAllCache(env) { // Tambahkan `async`
  await resetCacheUtama(env);
  await resetInoutCache(env);
  await resetListCache();
  await resetCacheStok();
  console.log("♻️ Semua cache telah direset");
}