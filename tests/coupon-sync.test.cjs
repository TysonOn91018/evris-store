const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const path = require('node:path');
const read = file => readFileSync(path.join(__dirname, '..', file), 'utf8');
function backendHarness() {
  const rows = new Map();
  const window = { EVRIS_FIREBASE_CONFIG: { apiKey:'test',authDomain:'test',projectId:'test',appId:'test' } };
  const modules = {
    'firebase-app.js': { initializeApp: () => ({}) },
    'firebase-auth.js': { getAuth: () => ({ currentUser:{uid:'alice',emailVerified:true},authStateReady:async()=>{} }) },
    'firebase-firestore.js': {
      getFirestore:()=>({}), doc:(_db,collection,id)=>`${collection}/${id}`,serverTimestamp:()=> 'now',
      runTransaction:async(_db,task)=> {
        const writes=[];
        const value=await task({
          get:async ref=>{assert.equal(writes.length,0);return {exists:()=>rows.has(ref),data:()=>rows.get(ref)};},
          set:(ref,data)=>writes.push([ref,data]),
        });
        writes.forEach(([key,data])=>rows.set(key,data));return value;
      },
    },
  };
  runInNewContext(read('firebase-backend.js').replaceAll('import(`${sdkRoot}','mockImport(`${sdkRoot}'),{
    window,setTimeout,clearTimeout,mockImport:async url=>modules[url.split('/').at(-1)],
  });
  return {api:window.EvrisBackend,rows};
}
test('direct Firebase claim uses fixed discount and creates matching claim and coupon once',async()=>{
 const {api,rows}=backendHarness();
 const input={p_milestone:256,p_product_slug:'moon-pearl-bracelet',discount_percent:100,p_code:'fake'};
 const first=await api.claimCoupon(input);
 assert.equal(first.error,null);assert.equal(first.data.discount_percent,3);assert.equal(first.data.code,'alice_256');
 assert.equal(rows.size,2);
 rows.set('game_coupons/alice_256',{...first.data,redeemed_at:'later'});
 const repeat=await api.claimCoupon(input);
 assert.equal(repeat.data.redeemed_at,'later');assert.equal(rows.size,2);
});
test('claim rejects unsupported tiers and products without writes',async()=>{
 const {api,rows}=backendHarness();
 for(const input of [{p_milestone:1,p_product_slug:'moon-pearl-bracelet'},{p_milestone:256,p_product_slug:'arbitrary'}]) {
  assert.equal((await api.claimCoupon(input)).error.code,'order/invalid-coupon');
 }
 assert.equal(rows.size,0);
});
function syncHarness(error=null) {
 const key='evris-gem-archive-2048-v1';
 const store=new Map([[key,JSON.stringify({score:512,coupons:[{code:'local',rewardId:'moon-pearl',kind:'percent',amount:3,milestone:256},{code:'other',user_id:'bob',milestone:512}]})]]);
 let calls=0;
 const window={EvrisBackend:{auth:{getUser:async()=>({data:{user:{id:'alice'}}})},claimCoupon:async()=>{
  calls++;
  const latest=JSON.parse(store.get(key));latest.score=1024;store.set(key,JSON.stringify(latest));
  return error?{error}:{data:{code:'alice_256',product_slug:'moon-pearl-bracelet',discount_percent:3,redeemed_at:null}};
 }}};
 runInNewContext(read('coupon-sync.js'),{window,localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},document:{dispatchEvent(){}},CustomEvent:class{}});
 return {sync:window.EvrisCouponSync.sync,store,key,calls:()=>calls};
}
test('sync preserves unrelated device changes, binds ownership, and does not issue again',async()=>{
 const h=syncHarness();assert.equal((await h.sync('alice')).count,1);
 const state=JSON.parse(h.store.get(h.key));
 assert.equal(state.score,1024);assert.equal(state.coupons[0].code,'alice_256');assert.equal(state.coupons[0].user_id,'alice');assert.equal(state.coupons[0].synced,true);assert.equal(state.coupons[1].code,'other');
 await h.sync('alice');assert.equal(h.calls(),1);
});
test('rules failure keeps original reward and reports actionable error',async()=>{
 const h=syncHarness({code:'permission-denied'});
 assert.equal((await h.sync('alice')).error.code,'permission-denied');
 const coupon=JSON.parse(h.store.get(h.key)).coupons[0];assert.equal(coupon.code,'local');assert.equal(coupon.synced,undefined);
});
