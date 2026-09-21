import Stripe from 'stripe';
import { StoreError } from './orders.mjs';
import { draftOrder,reserveOrder,settleOrder } from './payments.mjs';
export function paymentService(db,timestamp,env=process.env) {
  let client;
  function stripe() {
    if(!env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || !env.STRIPE_WEBHOOK_SECRET || !env.STORE_URL) throw new StoreError('app/backend-unavailable','Test payment service is not configured.',503);
    return client ||= new Stripe(env.STRIPE_SECRET_KEY,{maxNetworkRetries:2,timeout:15000});
  }
  async function start(identity,payload) {
    const api=stripe();
    const order=await draftOrder(db,identity,payload,timestamp);
    if(order.status==='pending') return {order_id:order.id,checkout_url:order.checkout_url};
    if(order.status!=='draft' || order.expires_at_ms <= Date.now()+31*60*1000) throw new StoreError('payment/order-closed','This checkout is closed. Start a new checkout.');
    const root=env.STORE_URL.replace(/\/$/,'');
    const session=await api.checkout.sessions.create({mode:'payment',payment_method_types:['card'],customer_email:order.customer_email,
      line_items:[{price_data:{currency:'cny',unit_amount:order.amount_total,product_data:{name:'EVRIS test order',description:order.items.map(x=>`${x.product_name} × ${x.quantity}`).join(', ').slice(0,500)}},quantity:1}],
      metadata:{order_id:order.id},client_reference_id:order.id,expires_at:Math.floor(order.expires_at_ms/1000),
      success_url:`${root}/index.html?payment=return&order=${encodeURIComponent(order.id)}`,
      cancel_url:`${root}/index.html?payment=cancel&order=${encodeURIComponent(order.id)}`,
    },{idempotencyKey:order.id});
    try { await reserveOrder(db,order.id,session,timestamp); }
    catch(error) { try { await api.checkout.sessions.expire(session.id); } catch {} throw error; }
    return {order_id:order.id,checkout_url:session.url};
  }
  async function status(identity,payload) {
    if(typeof payload.order_id!=='string' || payload.order_id.includes('/')) throw new StoreError('order/invalid-input','Invalid order.');
    const ref=db.doc(`orders/${payload.order_id}`); let snap=await ref.get();
    if(!snap.exists || snap.data().user_id!==identity.uid) throw new StoreError('permission-denied','Order unavailable.',403);
    if(snap.data().status==='pending') {
      let session=await stripe().checkout.sessions.retrieve(snap.data().session_id);
      if (payload.cancel === true && session.status === 'open') session = await stripe().checkout.sessions.expire(session.id);
      await settleOrder(db,session,timestamp); snap=await ref.get();
    }
    const data=snap.data();
    const mail=await db.doc(`order_mail/${payload.order_id}`).get();
    return {order_id:payload.order_id,status:data.status,amount_total:data.amount_total,currency:data.currency,items:data.items,coupon_code:data.coupon_code,email_status:mail.data()?.status || 'not_queued'};
  }
  async function webhook(raw,signature) {
    let event;
    try { event=stripe().webhooks.constructEvent(raw,signature,env.STRIPE_WEBHOOK_SECRET); }
    catch { throw new StoreError('payment/invalid-signature','Invalid webhook.',400); }
    if(event.livemode) throw new StoreError('payment/live-disabled','Live payments are disabled.',400);
    if(['checkout.session.completed','checkout.session.expired','checkout.session.async_payment_succeeded'].includes(event.type)) {
      const session=await stripe().checkout.sessions.retrieve(event.data.object.id);
      await settleOrder(db,session,timestamp);
    }
  }
  async function reconcile() {
    if (!env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) return;
    const pending = await db.collection('orders').where('status','==','pending').get();
    for (const doc of pending.docs) {
      if (doc.data().expires_at_ms > Date.now()) continue;
      const session = await stripe().checkout.sessions.retrieve(doc.data().session_id);
      await settleOrder(db,session,timestamp);
    }
  }
  return {start,status,webhook,reconcile};
}
