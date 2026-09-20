import { randomUUID } from 'node:crypto';
export class StoreError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}
function ensure(condition, code, message) { if (!condition) throw new StoreError(code, message); }
const slugPattern = /^[a-z0-9-]{1,100}$/;
export function validateOrder(input) {
  for (const field of ['p_customer_name', 'p_customer_email', 'p_shipping_address']) {
    ensure(typeof input[field] === 'string' && input[field].trim().length > 0 && input[field].length <= 2000, 'order/invalid-input', 'Complete the delivery details.');
  }
  ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.p_customer_email), 'order/invalid-input', 'Enter a valid email address.');
  ensure(Array.isArray(input.p_items) && input.p_items.length > 0 && input.p_items.length <= 30, 'order/invalid-input', 'Your cart is invalid.');
  const items = new Map();
  for (const item of input.p_items) {
    ensure(item && slugPattern.test(item.product_slug) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99, 'order/invalid-input', 'Invalid product or quantity.');
    const quantity = (items.get(item.product_slug) || 0) + item.quantity;
    ensure(quantity <= 99, 'order/invalid-input', 'Quantity exceeds the limit.');
    items.set(item.product_slug, quantity);
  }
  ensure(!input.p_coupon_code || (typeof input.p_coupon_code === 'string' && /^[A-Za-z0-9_-]{8,180}$/.test(input.p_coupon_code)), 'order/invalid-coupon', 'Invalid coupon.');
  return [...items].map(([slug, quantity]) => ({ slug, quantity }));
}
export async function placeOrder(db, uid, input, timestamp) {
  const items = validateOrder(input);
  ensure(typeof input.request_id === 'string' && /^[a-f0-9-]{36}$/.test(input.request_id), 'order/invalid-input', 'Invalid request ID.');
  // A retry after a dropped response cannot charge stock twice.
  const orderRef = db.doc(`orders/${uid}_${input.request_id}`);
  return db.runTransaction(async tx => {
    const previous = await tx.get(orderRef);
    if (previous.exists) return previous.data().result;
    const products = [];
    for (const item of items) {
      const ref = db.doc(`products/${item.slug}`);
      const snapshot = await tx.get(ref);
      const product = snapshot.data();
      ensure(snapshot.exists && product.is_active && Number.isInteger(product.stock) && product.stock >= item.quantity, 'order/out-of-stock', 'An item is unavailable or has insufficient stock.');
      ensure(Number.isInteger(product.price) && product.price >= 0, 'order/out-of-stock', 'An item price is unavailable.');
      products.push({ ref, product, ...item });
    }
    let coupon, couponRef;
    if (input.p_coupon_code) {
      couponRef = db.doc(`game_coupons/${input.p_coupon_code}`);
      const snapshot = await tx.get(couponRef);
      coupon = snapshot.data();
      ensure(snapshot.exists && coupon.user_id === uid && !coupon.redeemed_at && products.some(item => item.slug === coupon.product_slug), 'order/invalid-coupon', 'Coupon is invalid, used, or does not match your cart.');
      ensure(Number.isInteger(coupon.discount_percent) && coupon.discount_percent > 0 && coupon.discount_percent <= 100, 'order/invalid-coupon', 'Invalid coupon discount.');
    }
    const subtotal = products.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const target = coupon ? products.find(item => item.slug === coupon.product_slug) : null;
    const discount = target ? Math.floor(target.product.price * target.quantity * coupon.discount_percent / 100) : 0;
    const result = { order_id: orderRef.id, subtotal_before_discount: subtotal, discount_amount: discount, subtotal: subtotal - discount };
    tx.create(orderRef, {
      user_id: uid, customer_name: input.p_customer_name.trim(), customer_email: input.p_customer_email.trim(),
      shipping_address: input.p_shipping_address.trim(), gift_option: String(input.p_gift_option || 'none').slice(0, 100),
      status: 'received', created_at: timestamp(), result,
      items: products.map(item => ({ product_slug: item.slug, quantity: item.quantity, unit_price: item.product.price, product_name: item.product.name })),
      coupon_code: input.p_coupon_code || null,
    });
    for (const item of products) tx.update(item.ref, { stock: item.product.stock - item.quantity, updated_at: timestamp() });
    if (couponRef) tx.update(couponRef, { redeemed_at: timestamp(), order_id: orderRef.id });
    return result;
  });
}
export async function claimCoupon(db, uid, input, timestamp) {
  const tiers = { 256: 3, 512: 5, 1024: 8, 2048: 10 };
  ensure(Number.isInteger(input.p_milestone) && tiers[input.p_milestone], 'order/invalid-coupon', 'Invalid reward tier.');
  ensure(['citrine-drop-earrings', 'moon-pearl-bracelet', 'minimal-pearl-chain'].includes(input.p_product_slug), 'order/invalid-coupon', 'Invalid reward product.');
  const claimRef = db.doc(`coupon_claims/${uid}_${input.p_milestone}`);
  const code = `EVRIS-${randomUUID()}`;
  return db.runTransaction(async tx => {
    const existing = await tx.get(claimRef);
    if (existing.exists) return existing.data();
    const data = { user_id: uid, code, milestone: input.p_milestone, product_slug: input.p_product_slug, discount_percent: tiers[input.p_milestone], issued_at: timestamp(), redeemed_at: null };
    tx.create(claimRef, data);
    tx.create(db.doc(`game_coupons/${code}`), data);
    return data;
  });
}
