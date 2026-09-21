import {test} from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {paymentService} from '../server/payment-service.mjs';
const secret='whsec_test_fixture';
const env={STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:secret,STORE_URL:'https://example.com/store'};
const stripe=new Stripe(env.STRIPE_SECRET_KEY);
const payload=JSON.stringify({id:'evt_fixture',type:'unrelated.event',livemode:false,data:{object:{}}});
const signature=body=>stripe.webhooks.generateTestHeaderString({payload:body,secret});
test('webhook accepts correctly signed test events and rejects tampering and live events',async()=>{
 const service=paymentService({},()=>null,env);
 await service.webhook(Buffer.from(payload),signature(payload));
 await assert.rejects(service.webhook(Buffer.from(payload+' '),signature(payload)),{code:'payment/invalid-signature'});
 const live=payload.replace('"livemode":false','"livemode":true');
 await assert.rejects(service.webhook(Buffer.from(live),signature(live)),{code:'payment/live-disabled'});
});
test('live secret keys cannot start checkout',async()=>{
 const service=paymentService({},()=>null,{...env,STRIPE_SECRET_KEY:'sk_live_fixture'});
 await assert.rejects(service.start({},{}),{code:'app/backend-unavailable'});
});
