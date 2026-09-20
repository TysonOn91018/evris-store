import { test } from 'node:test';
import assert from 'node:assert/strict';
import { placeOrder, claimCoupon, validateOrder } from '../server/orders.mjs';
function database(entries) {
  const rows = new Map(Object.entries(entries));
  return {
    rows,
    doc(path) { return { path, id: path.split('/').at(-1) }; },
    async runTransaction(callback) {
      const writes = [];
      const result = await callback({
        async get(ref) { assert.equal(writes.length, 0, 'All transaction reads must precede writes'); return { exists: rows.has(ref.path), data: () => rows.get(ref.path) }; },
        create(ref, value) { assert.equal(rows.has(ref.path), false); writes.push([ref.path, value]); },
        update(ref, value) { writes.push([ref.path, { ...rows.get(ref.path), ...value }]); },
      });
      for (const [key, value] of writes) rows.set(key, value);
      return result;
    },
  };
}
const request = (extra = {}) => ({ request_id: '12345678-1234-1234-1234-123456789abc', p_customer_name: 'Test', p_customer_email: 'test@example.com', p_shipping_address: 'Test address', p_items: [{ product_slug: 'test-product', quantity: 2, price: 1 }], ...extra });
const product = { name: 'Test product', price: 100, stock: 5, is_active: true };
test('checkout ignores submitted prices and retries do not deduct stock twice', async () => {
  const db = database({ 'products/test-product': product });
  const result = await placeOrder(db, 'user', request(), () => 'now');
  assert.equal(result.subtotal, 200);
  assert.equal(db.rows.get('products/test-product').stock, 3);
  assert.deepEqual(await placeOrder(db, 'user', request(), () => 'later'), result);
  assert.equal(db.rows.get('products/test-product').stock, 3);
});
test('duplicate cart rows are combined before stock checks; failed order has no writes', async () => {
  const db = database({ 'products/test-product': product });
  await assert.rejects(placeOrder(db, 'user', request({ p_items: [{ product_slug: 'test-product', quantity: 3 }, { product_slug: 'test-product', quantity: 3 }] }), () => 'now'), { code: 'order/out-of-stock' });
  assert.equal(db.rows.size, 1);
  assert.equal(db.rows.get('products/test-product').stock, 5);
  assert.throws(() => validateOrder(request({ p_items: [{ product_slug: '../private', quantity: 1 }] })));
  assert.throws(() => validateOrder(request({ p_items: [{ product_slug: 'test-product', quantity: -1 }] })));
});
test('coupon ownership, redemption and target product are checked server side', async () => {
  const db = database({ 'products/test-product': product, 'game_coupons/EVRIS-test-code': { user_id: 'other', product_slug: 'test-product', discount_percent: 10, redeemed_at: null } });
  const input = request({ p_coupon_code: 'EVRIS-test-code' });
  await assert.rejects(placeOrder(db, 'user', input, () => 'now'), { code: 'order/invalid-coupon' });
  assert.equal(db.rows.get('products/test-product').stock, 5);
  db.rows.get('game_coupons/EVRIS-test-code').user_id = 'user';
  assert.equal((await placeOrder(db, 'user', input, () => 'now')).subtotal, 180);
  assert.equal(db.rows.get('game_coupons/EVRIS-test-code').redeemed_at, 'now');
  await assert.rejects(placeOrder(db, 'user', { ...input, request_id: '22345678-1234-1234-1234-123456789abc' }, () => 'now'), { code: 'order/invalid-coupon' });
});
test('reward tiers have server-issued codes and one claim per user and milestone', async () => {
  const db = database({});
  const input = { p_milestone: 512, p_product_slug: 'moon-pearl-bracelet', p_code: 'forged-code', discount_percent: 100 };
  const coupon = await claimCoupon(db, 'user', input, () => 'now');
  assert.equal(coupon.discount_percent, 5);
  assert.notEqual(coupon.code, input.p_code);
  assert.deepEqual(await claimCoupon(db, 'user', input, () => 'later'), coupon);
  assert.equal(db.rows.size, 2);
  await assert.rejects(claimCoupon(db, 'user', { ...input, p_milestone: 999 }, () => 'now'));
});
