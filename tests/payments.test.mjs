import {test} from 'node:test';
import assert from 'node:assert/strict';
import {draftOrder,reserveOrder,settleOrder} from '../server/payments.mjs';
import {deliverMail,receipt} from '../server/order-mail.mjs';
function database(entries={}) {
 const rows=new Map(Object.entries(entries));let queue=Promise.resolve();
 return {rows,doc:path=>({path,id:path.split('/').at(-1)}),runTransaction(callback){
  const work=queue.then(async()=>{
   const writes=[];
   const result=await callback({get:async ref=>{assert.equal(writes.length,0);return {exists:rows.has(ref.path),data:()=>rows.get(ref.path)}},
    create(ref,value){assert.ok(!rows.has(ref.path));writes.push(()=>rows.set(ref.path,value));},
    set(ref,value){writes.push(()=>rows.set(ref.path,value));},update(ref,value){writes.push(()=>rows.set(ref.path,{...rows.get(ref.path),...value}));},delete(ref){writes.push(()=>rows.delete(ref.path));}});
   writes.forEach(write=>write());return result;
  });queue=work.catch(()=>{});return work;
 }};
}
const identity={uid:'alice',email:'member@example.com',email_verified:true};
const input={request_id:'12345678-1234-1234-1234-123456789abc',p_customer_name:'Test buyer',p_customer_email:'attacker@example.com',p_shipping_address:'Test address',p_items:[{product_slug:'moon-pearl-bracelet',quantity:2,price:1}],p_coupon_code:'alice_256'};
const entries=()=>({'products/moon-pearl-bracelet':{name:'Moon Pearl Bracelet',stock:5,price:458,is_active:true},'game_coupons/alice_256':{user_id:'alice',product_slug:'moon-pearl-bracelet',discount_percent:3,redeemed_at:null}});
const ts=()=> 'now';
async function prepared(){const db=database(entries());const order=await draftOrder(db,identity,input,ts);const session={id:'cs_test_1',url:'https://checkout.stripe.com/test',livemode:false,metadata:{order_id:order.id},amount_total:order.amount_total,currency:'cny',payment_status:'unpaid',status:'open'};await reserveOrder(db,order.id,session,ts);return {db,order,session};}
test('authoritative quote uses member email, integer cents and does not deduct unpaid stock',async()=>{
 const {db,order}=await prepared();assert.equal(order.customer_email,identity.email);assert.equal(order.amount_total,88852);assert.equal(order.discount_amount,2748);assert.equal(db.rows.get('products/moon-pearl-bracelet').stock,5);assert.equal(db.rows.get('payment_stock/moon-pearl-bracelet').quantity,2);
});
test('paid callbacks are idempotent and atomically deduct correct quantities and redeem coupon',async()=>{
 const {db,order,session}=await prepared();session.payment_status='paid';session.status='complete';
 await Promise.all([settleOrder(db,session,ts),settleOrder(db,session,ts)]);
 assert.equal(db.rows.get('products/moon-pearl-bracelet').stock,3);assert.equal(db.rows.get('payment_stock/moon-pearl-bracelet').quantity,0);assert.equal(db.rows.get('game_coupons/alice_256').order_id,order.id);assert.equal(db.rows.get(`order_mail/${order.id}`).status,'pending');
});
test('expired sessions release reservations without deducting stock, using coupons or sending mail',async()=>{
 const {db,order,session}=await prepared();session.status='expired';await settleOrder(db,session,ts);await settleOrder(db,session,ts);
 assert.equal(db.rows.get('products/moon-pearl-bracelet').stock,5);assert.equal(db.rows.get('payment_stock/moon-pearl-bracelet').quantity,0);assert.equal(db.rows.has(`order_mail/${order.id}`),false);assert.equal(db.rows.get('game_coupons/alice_256').redeemed_at,null);
});
test('live events, wrong sessions and mismatched totals cannot fulfill orders',async()=>{
 const {db,session}=await prepared();
 for(const change of [{livemode:true},{id:'wrong'},{amount_total:1}]) await assert.rejects(settleOrder(db,{...session,payment_status:'paid',...change},ts));
 assert.equal(db.rows.get('products/moon-pearl-bracelet').stock,5);
});
test('reservations stop overselling and duplicate coupon use',async()=>{
 const {db}=await prepared();
 const next=await draftOrder(db,identity,{...input,request_id:'22345678-1234-1234-1234-123456789abc'},ts);
 await assert.rejects(reserveOrder(db,next.id,{id:'cs_test_2'},ts),{code:'order/invalid-coupon'});
 const large=await draftOrder(db,identity,{...input,p_coupon_code:null,p_items:[{product_slug:'moon-pearl-bracelet',quantity:4}],request_id:'32345678-1234-1234-1234-123456789abc'},ts);
 await assert.rejects(reserveOrder(db,large.id,{id:'cs_test_3'},ts),{code:'order/out-of-stock'});
});
test('stock changes during payment go to review without negative stock or coupon redemption',async()=>{
 const {db,order,session}=await prepared();db.rows.get('products/moon-pearl-bracelet').stock=1;
 assert.equal(await settleOrder(db,{...session,payment_status:'paid'},ts),'payment_review');
 assert.equal(db.rows.get('products/moon-pearl-bracelet').stock,1);assert.equal(db.rows.get('game_coupons/alice_256').redeemed_at,null);assert.equal(db.rows.get(`order_mail/${order.id}`).review,true);
});
test('email failures stay queued and duplicate workers cannot send the same completed job again',async()=>{
 const {db,order,session}=await prepared();await settleOrder(db,{...session,payment_status:'paid'},ts);
 await deliverMail(db,order.id,async()=>{throw new Error('offline')},ts);assert.equal(db.rows.get(`order_mail/${order.id}`).status,'pending');
 let sent=0;const send=async message=>{sent++;assert.equal(message.to,identity.email);assert.match(message.subject,/TEST/);return {messageId:'mail1'}};
 await Promise.all([deliverMail(db,order.id,send,ts),deliverMail(db,order.id,send,ts)]);assert.equal(sent,1);assert.equal(db.rows.get(`order_mail/${order.id}`).status,'sent');
 assert.match(receipt(order,order.id).text,/888.52/);
});
test('changed request contents cannot reuse an existing request ID',async()=>{
 const {db}=await prepared();await assert.rejects(draftOrder(db,identity,{...input,p_shipping_address:'Another address'},ts),{code:'order/invalid-input'});
});
