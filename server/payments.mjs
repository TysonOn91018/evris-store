import { createHash } from 'node:crypto';
import { StoreError, validateOrder } from './orders.mjs';
const check = (ok, code, message) => { if (!ok) throw new StoreError(code, message); };
const reference = (db, id) => db.doc(`orders/${id}`);
export async function draftOrder(db, identity, input, timestamp, now = Date.now()) {
  const items = validateOrder({ ...input, p_customer_email: identity.email });
  check(identity.email_verified && identity.email, 'auth/login-required', 'Sign in with a verified email.');
  check(/^[a-f0-9-]{36}$/.test(input.request_id || ''), 'order/invalid-input', 'Invalid request ID.');
  const id = `${identity.uid}_${input.request_id}`;
  const normalized = { items, name:input.p_customer_name.trim(), address:input.p_shipping_address.trim(), gift:String(input.p_gift_option || 'none').slice(0,100), coupon:input.p_coupon_code || null };
  const fingerprint = createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  return db.runTransaction(async tx => {
    const ref = reference(db,id), existing = await tx.get(ref);
    if (existing.exists) {
      check(existing.data().fingerprint === fingerprint, 'order/invalid-input', 'Request ID already used for another cart.');
      return {id,...existing.data()};
    }
    const rows = [];
    for (const item of items) {
      const snap = await tx.get(db.doc(`products/${item.slug}`)); const p = snap.data();
      check(snap.exists && p.is_active && p.stock >= item.quantity && Number.isSafeInteger(p.price) && p.price >= 0, 'order/out-of-stock', 'Product unavailable.');
      rows.push({product_slug:item.slug,quantity:item.quantity,unit_amount:p.currency === 'jpy' ? p.price : Math.round(p.price*21.8),product_name:p.name});
    }
    let discount = 0;
    if (normalized.coupon) {
      const snap = await tx.get(db.doc(`game_coupons/${normalized.coupon}`)); const c = snap.data();
      const target = c && rows.find(row=>row.product_slug === c.product_slug);
      check(snap.exists && c.user_id === identity.uid && !c.redeemed_at && target && Number.isInteger(c.discount_percent) && c.discount_percent > 0 && c.discount_percent <= 100, 'order/invalid-coupon', 'Coupon unavailable.');
      discount = Math.round(target.unit_amount * target.quantity * c.discount_percent / 100);
    }
    const subtotal = rows.reduce((sum,row)=>sum+row.unit_amount*row.quantity,0);
    const amount = subtotal-discount;
    check(Number.isSafeInteger(amount) && amount >= 50 && amount <= 99999999, 'order/invalid-input', 'Test order total must be between JPY 50 and JPY 99,999,999.');
    const data = {user_id:identity.uid, customer_email:identity.email, customer_name:normalized.name, shipping_address:normalized.address, gift_option:normalized.gift,
      items:rows,coupon_code:normalized.coupon,fingerprint,status:'draft',payment_mode:'test',currency:'jpy',subtotal_amount:subtotal,discount_amount:discount,amount_total:amount,
      shipping_amount:0,created_at:timestamp(),expires_at_ms:now+35*60*1000};
    tx.create(ref,data);return {id,...data};
  });
}
export async function reserveOrder(db, id, session, timestamp) {
  return db.runTransaction(async tx => {
    const ref=reference(db,id), snap=await tx.get(ref); const order=snap.data();
    check(snap.exists, 'order/invalid-input','Unknown order.');
    if(order.status === 'pending' || order.status === 'paid') {
      check(order.session_id === session.id,'order/invalid-input','Session mismatch.'); return order;
    }
    check(order.status === 'draft','order/invalid-input','Order is closed.');
    const holds=[];
    for(const item of order.items) {
      const productRef=db.doc(`products/${item.product_slug}`), holdRef=db.doc(`payment_stock/${item.product_slug}`);
      const p=(await tx.get(productRef)).data(); const hold=(await tx.get(holdRef)).data()?.quantity || 0;
      check(p?.is_active && Number.isSafeInteger(p.stock) && p.stock-hold>=item.quantity,'order/out-of-stock','Insufficient available stock.');
      holds.push({ref:holdRef,quantity:hold+item.quantity});
    }
    let couponRef;
    if(order.coupon_code) {
      const coupon=(await tx.get(db.doc(`game_coupons/${order.coupon_code}`))).data();
      couponRef=db.doc(`payment_coupons/${order.coupon_code}`); const lock=(await tx.get(couponRef)).data();
      check(coupon?.user_id === order.user_id && !coupon.redeemed_at && (!lock?.order_id || lock.order_id===id),'order/invalid-coupon','Coupon in use or redeemed.');
    }
    for(const hold of holds) tx.set(hold.ref,{quantity:hold.quantity});
    if(couponRef) tx.set(couponRef,{order_id:id});
    tx.update(ref,{status:'pending',session_id:session.id,checkout_url:session.url,updated_at:timestamp()});
    return {...order,status:'pending',session_id:session.id,checkout_url:session.url};
  });
}
export async function settleOrder(db, session, timestamp) {
  check(session.livemode === false, 'payment/live-disabled','Live payments are disabled.');
  const id=session.metadata?.order_id;
  check(typeof id==='string' && !id.includes('/'),'order/invalid-input','Invalid order.');
  return db.runTransaction(async tx=>{
    const ref=reference(db,id),snap=await tx.get(ref),order=snap.data();
    check(snap.exists && order.session_id===session.id,'order/invalid-input','Session not ready.');
    if(['paid','expired','payment_review'].includes(order.status)) return order.status;
    check(order.status==='pending','order/invalid-input','Invalid order state.');
    const paid=session.payment_status==='paid';
    if(!paid && session.status!=='expired') return 'pending';
    check(!paid || (session.amount_total===order.amount_total && session.currency===order.currency),'payment/amount-mismatch','Payment amount mismatch.');
    const rows=[];
    for(const item of order.items) {
      const productRef=db.doc(`products/${item.product_slug}`),holdRef=db.doc(`payment_stock/${item.product_slug}`);
      rows.push({item,productRef,holdRef,product:(await tx.get(productRef)).data(),held:(await tx.get(holdRef)).data()?.quantity || 0});
    }
    const couponRef=order.coupon_code ? db.doc(`game_coupons/${order.coupon_code}`) : null;
    const coupon=couponRef ? (await tx.get(couponRef)).data() : null;
    const lockRef=order.coupon_code ? db.doc(`payment_coupons/${order.coupon_code}`) : null;
    const lock=lockRef ? (await tx.get(lockRef)).data() : null;
    // A manager may have changed physical stock while payment was pending.
    const review=paid && (rows.some(row=>!Number.isSafeInteger(row.product?.stock) || row.product.stock<row.item.quantity) || (couponRef && (!coupon || coupon.redeemed_at || lock?.order_id!==id)));
    const status=paid ? review ? 'payment_review' : 'paid' : 'expired';
    for(const row of rows) {
      tx.set(row.holdRef,{quantity:Math.max(0,row.held-row.item.quantity)});
      if(paid && !review) tx.update(row.productRef,{stock:row.product.stock-row.item.quantity,updated_at:timestamp()});
    }
    if(lockRef && lock?.order_id===id) tx.delete(lockRef);
    if(paid && !review && couponRef) tx.update(couponRef,{redeemed_at:timestamp(),order_id:id});
    tx.update(ref,{status,payment_intent:session.payment_intent || null,updated_at:timestamp(),...(paid ? {paid_at:timestamp()} : {})});
    if(paid) tx.create(db.doc(`order_mail/${id}`),{order_id:id,status:'pending',attempts:0,created_at:timestamp(),review});
    return status;
  });
}
