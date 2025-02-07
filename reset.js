import { resetCacheUtama } from './master.js';
import { resetInoutCache } from './inout.js';
import { resetCacheStok } from './stok.js';
import { resetListCache } from './list.js';

export async function resetAllCache(env) { // Tambahkan `async`
  await resetCacheUtama(env);
  await resetInoutCache(env);
  await resetListCache();
  await resetCacheStok();
  console.log("♻️ Cache utama telah direset");
  console.log("♻️ Cache inout telah direset");
  console.log("♻️ Cache stok telah direset");
  console.log("♻️ Cache list telah direset");
  console.log("♻️ Semua cache telah direset");
}