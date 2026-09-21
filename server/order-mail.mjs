import nodemailer from 'nodemailer';
import { randomUUID } from 'node:crypto';
export function receipt(order,id,review=false) {
  const amount = (order.amount_total/100).toFixed(2);
  return {
    to:order.customer_email,
    subject:`[TEST / テスト決済] EVRIS ${review ? 'Order requires review' : 'Order confirmation'} ${id}`,
    text:[`EVRIS — TEST PAYMENT / テスト決済 / 測試付款`, 'No real money was charged. 実際の請求はありません。沒有扣取真實款項。', '',
      `Order / 注文番号: ${id}`, `Customer / お名前: ${order.customer_name}`, '',
      ...order.items.map(item=>`${item.product_name} × ${item.quantity} — CNY ${(item.unit_amount*item.quantity/100).toFixed(2)}`),
      `Discount / 割引: CNY ${(order.discount_amount/100).toFixed(2)}`, `Total / 合計: CNY ${amount}`,
      '', review ? 'Payment confirmed, but stock changed. The store must review this order. 商品在庫が変更されたため、店舗による確認が必要です。' : 'Test payment confirmed. Your order and stock have been updated. テスト決済が完了し、注文と在庫を更新しました。',
      '', `Delivery address / 配送先: ${order.shipping_address}`].join('\n'),
  };
}
export async function deliverMail(db,id,send,timestamp,now=Date.now()) {
  const ref=db.doc(`order_mail/${id}`),token=randomUUID();
  const job=await db.runTransaction(async tx=>{
    const snap=await tx.get(ref); const data=snap.data();
    if(!snap.exists || data.status==='sent' || (data.lease_until || 0)>now) return null;
    const order=(await tx.get(db.doc(`orders/${id}`))).data();
    if(!order || !['paid','payment_review'].includes(order.status)) return null;
    tx.update(ref,{status:'sending',lease_until:now+120000,lease_token:token,attempts:(data.attempts || 0)+1});
    return {order,review:data.review};
  });
  if(!job) return;
  try {
    const result=await send({...receipt(job.order,id,job.review),messageId:`<${id}@evris.test>`});
    await db.runTransaction(async tx=>{const current=(await tx.get(ref)).data();if(current?.lease_token===token) tx.update(ref,{status:'sent',sent_at:timestamp(),lease_until:0,provider_id:result.messageId || ''});});
  } catch {
    await db.runTransaction(async tx=>{const current=(await tx.get(ref)).data();if(current?.lease_token===token) tx.update(ref,{status:'pending',lease_until:0,last_error:'email/send-failed'});});
  }
}
export function mailWorker(db,timestamp,env=process.env) {
  if(!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) return async()=>{};
  const transport=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:env.GMAIL_USER,pass:env.GMAIL_APP_PASSWORD},connectionTimeout:15000,socketTimeout:30000});
  let running=false;
  return async()=>{
    if(running)return; running=true;
    try {
      const snapshot=await db.collection('order_mail').where('status','in',['pending','sending']).limit(30).get();
      for(const job of snapshot.docs) await deliverMail(db,job.id,message=>transport.sendMail({...message,from:env.GMAIL_USER}),timestamp);
    } finally {running=false;}
  };
}
