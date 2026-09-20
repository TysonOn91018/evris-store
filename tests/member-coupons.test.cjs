const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {runInNewContext}=require('node:vm');
const path=require('node:path');
const window={};
runInNewContext(readFileSync(path.join(__dirname,'../member-coupons.js'),'utf8'),{window});
const merge=window.EvrisMemberCouponsModel.mergeCoupons;
test('only signed-in user coupons appear, with correct redeemed status',()=>{
 const rows=merge('alice',[
  {user_id:'alice',code:'used',discount_percent:5,product_slug:'moon-pearl-bracelet',redeemed_at:{seconds:1}},
  {user_id:'bob',code:'private',discount_percent:10},
  {user_id:'alice',code:'available',discount_percent:3,product_slug:'citrine-drop-earrings'},
 ],[]);
 assert.deepEqual(Array.from(rows,item=>[item.code,item.status]),[['available','available'],['used','used']]);
});
test('server status wins over duplicate device coupon and used coupons remain used',()=>{
 const rows=merge('alice',[{user_id:'alice',code:'same',discount_percent:5,redeemed_at:'now'}],[{code:'same',kind:'percent',amount:100}]);
 assert.equal(rows.length,1); assert.equal(rows[0].status,'used'); assert.equal(rows[0].amount,5);
});
test('legacy device rewards are pending and rewards owned by another account are excluded',()=>{
 const rows=merge('alice',[],[
  {code:'local',kind:'percent',amount:5,rewardId:'moon-pearl'},
  {code:'other',kind:'percent',amount:10,user_id:'bob'},
  null,{code:'bad',kind:'percent',amount:'invalid'},
 ]);
 assert.equal(rows.length,1); assert.equal(rows[0].status,'pending'); assert.equal(rows[0].product,'moon-pearl-bracelet');
});
test('local duplicates do not create additional rewards',()=>{
 const coupon={code:'local',kind:'percent',amount:5};
 assert.equal(merge('alice',[],[coupon,coupon]).length,1);
});
