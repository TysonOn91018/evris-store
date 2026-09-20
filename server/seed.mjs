// Explicit, one-time catalog initialization. Existing prices and stock are never overwritten.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
if (!projectId) throw new Error('Set GOOGLE_CLOUD_PROJECT to the intended Firebase project before seeding.');
initializeApp({ projectId, credential: applicationDefault() });
const db = getFirestore();
const context = { window: {} };
runInNewContext(readFileSync(new URL('../products-data.js', import.meta.url), 'utf8'), context);
for (const product of context.window.EVRIS_PRODUCTS) {
  await db.runTransaction(async tx => {
    const ref = db.doc(`products/${product.id}`);
    if ((await tx.get(ref)).exists) return;
    tx.create(ref, { slug: product.id, name: product.title, price: product.priceValue, category: product.category, image_path: product.image, stock: 0, is_active: true });
  });
}
console.log('Catalog created. Set actual stock in Firestore before accepting orders.');
