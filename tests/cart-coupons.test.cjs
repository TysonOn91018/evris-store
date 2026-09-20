const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
function setup(local = []) {
  const values = new Map([
    ['evrisCart', JSON.stringify([{id:'moon-pearl-bracelet',priceValue:458,quantity:1}])],
    ['evris-gem-archive-2048-v1', JSON.stringify({coupons:local})],
  ]);
  const window = {addEventListener(){}};
  const document = {documentElement:{lang:'zh'},querySelectorAll(){return []},querySelector(){return null},addEventListener(){},dispatchEvent(){}};
  const localStorage = {getItem:key=>values.get(key) || null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  runInNewContext(readFileSync(require('node:path').join(__dirname,'../gem-archive-2048/coupon.js'),'utf8'), {window,document,localStorage,Intl,CustomEvent:class {}});
  return {api:window.EVRISCoupons, values};
}
const reward = {user_id:'alice',code:'alice_256',product_slug:'moon-pearl-bracelet',discount_percent:3,redeemed_at:null};
test('cloud-only matching coupon applies without any device game history',()=>{
 const {api,values}=setup();
 api.setAccountCoupons('alice',[reward],'ready');
 values.set('evrisAppliedGameCoupon',reward.code);
 assert.equal(api.getAppliedDiscount().discount,13.74);
 assert.equal(api.getAppliedDiscount().code,reward.code);
});
test('cloud redemption and account ownership override local coupon copies',()=>{
 const {api,values}=setup([{code:reward.code,kind:'percent',amount:3,storeProductId:reward.product_slug}]);
 for (const row of [{...reward,redeemed_at:'now'}, {...reward,user_id:'bob'}]) {
   api.setAccountCoupons('alice',[row],'ready');values.set('evrisAppliedGameCoupon',reward.code);
   assert.equal(api.getAppliedDiscount().discount,0);
 }
});
test('selection survives loading but is cleared on logout and account switch',()=>{
 const {api,values}=setup(); values.set('evrisAppliedGameCoupon',reward.code);
 api.setAccountCoupons(null,[],'loading');
 api.setAccountCoupons('alice',[],'loading');
 assert.equal(values.get('evrisAppliedGameCoupon'),reward.code);
 assert.equal(api.getAppliedDiscount().discount,0);
 api.setAccountCoupons('alice',[reward],'ready');
 assert.equal(api.getAppliedDiscount().discount,13.74);
 api.setAccountCoupons('bob',[],'loading');
 assert.equal(values.has('evrisAppliedGameCoupon'),false);
 values.set('evrisAppliedGameCoupon',reward.code);
 api.setAccountCoupons(null,[],'signed-out');
 assert.equal(values.has('evrisAppliedGameCoupon'),false);
});
test('nonmatching items, failed loads, and consumed coupons cannot receive discount',()=>{
 const {api,values}=setup();
 api.setAccountCoupons('alice',[reward],'ready');values.set('evrisAppliedGameCoupon',reward.code);
 assert.equal(api.getAppliedDiscount([{id:'other',priceValue:458,quantity:1}]).discount,0);
 api.setAccountCoupons('alice',[],'failed');
 assert.equal(api.getAppliedDiscount().discount,0);
 api.setAccountCoupons('alice',[reward],'ready');values.set('evrisAppliedGameCoupon',reward.code);
 api.consume(reward.code);
 assert.equal(api.getAppliedDiscount().discount,0);
});
