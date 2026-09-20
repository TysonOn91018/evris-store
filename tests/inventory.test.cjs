const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const path = require('node:path');
const read = file => readFileSync(path.join(__dirname,'..',file),'utf8');
const valid = {name:'Test bracelet',category:'bracelet',price:358,stock:10,image_path:'assets/products/test.jpg',description:'Test',material:'Pearl',style:'Daily',is_active:true};
function harness(email='fatchan2019@gmail.com', prior={...valid,slug:'test-product',revision:1}) {
  const window = {EVRIS_FIREBASE_CONFIG:{apiKey:'test',authDomain:'test',projectId:'test',appId:'test'}};
  let saved;
  const context = {window,setTimeout,clearTimeout};
  runInNewContext(read('inventory-model.js'),context);
  const user = {email,emailVerified:true,getIdTokenResult:async()=>({claims:{}})};
  const modules = {
    'firebase-app.js':{initializeApp:()=>({})},
    'firebase-auth.js':{getAuth:()=>({currentUser:user,authStateReady:async()=>{}})},
    'firebase-firestore.js':{getFirestore:()=>({}),doc:()=>({}),serverTimestamp:()=> 'now',runTransaction:async(_db,fn)=>fn({get:async()=>({exists:()=>Boolean(prior),data:()=>prior}),set:(_ref,value)=>{saved=value;}})},
  };
  context.mockImport = async url=>modules[url.split('/').at(-1)];
  runInNewContext(read('firebase-backend.js').replaceAll('import(`${sdkRoot}','mockImport(`${sdkRoot}'),context);
  return {window,api:window.EvrisBackend,saved:()=>saved};
}
test('inventory rejects negative stock, fractional price and unsafe image paths',()=>{
  const {window}=harness();
  for(const change of [{stock:-1},{price:1.5},{image_path:'javascript:alert(1)'},{name:'<img src=x>'}]) assert.throws(()=>window.EvrisInventory.validate({...valid,...change}));
});
test('ordinary customers cannot invoke inventory updates',async()=>{
  const h=harness('customer@example.com');
  const response=await h.api.saveInventory('test-product',valid,{stock:10,revision:1});
  assert.equal(response.error.code,'permission-denied'); assert.equal(h.saved(),undefined);
});
test('restocking adds to latest stock after concurrent sales',async()=>{
  const h=harness(undefined,{...valid,stock:7,revision:1});
  const response=await h.api.saveInventory('test-product',valid,{stock:10,revision:1},5);
  assert.equal(response.error,null); assert.equal(h.saved().stock,12); assert.equal(h.saved().revision,2);
});
test('absolute stock edits and stale product edits fail rather than overwrite concurrent changes',async()=>{
  const h=harness(undefined,{...valid,stock:7,revision:2});
  const response=await h.api.saveInventory('test-product',valid,{stock:10,revision:1});
  assert.equal(response.error.code,'inventory/conflict'); assert.equal(h.saved(),undefined);
  const second=harness(undefined,{...valid,stock:7,revision:1});
  assert.equal((await second.api.saveInventory('test-product',valid,{stock:10,revision:1})).error.code,'inventory/conflict');
});

test('product images accept HTTPS storage URLs while rejecting executable and local file URLs',()=>{
 const {window}=harness();
 for(const image_path of ['https://res.cloudinary.com/store/image/upload/v1/item.jpg','https://firebasestorage.googleapis.com/v0/b/store/o/images%2Fitem.jpg?alt=media&token=abc']) {
  assert.equal(window.EvrisInventory.validate({...valid,image_path}).image_path,image_path);
 }
 for(const image_path of ['http://example.com/item.jpg','file:///tmp/item.jpg','data:image/png;base64,abc','https://user:password@example.com/a.jpg','https://example.com/a\" onerror=alert(1)','https://example.com/'+ 'a'.repeat(1001)]) {
  assert.throws(()=>window.EvrisInventory.validate({...valid,image_path}));
 }
});
