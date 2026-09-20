const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const path = require('node:path');
function harness(config, response) {
 const window = {EVRIS_CLOUDINARY_CONFIG:config};
 const calls = [];
 const context = {window,FormData:class {append(...args){(this.fields ||= []).push(args)}},fetch:async(...args)=>{calls.push(args);return response}};
 for (const name of ['inventory-model.js','product-image-upload.js']) runInNewContext(readFileSync(path.join(__dirname,'..',name),'utf8'),context);
 return {api:window.EvrisImageUpload,calls};
}
const file = {type:'image/jpeg',size:1024};
const config = {cloudName:'store',uploadPreset:'products'};
test('image uploads reject missing configuration, unsupported files and oversized files before network calls',async()=>{
 const {api,calls}=harness({});
 await assert.rejects(api.upload(file),/Cloudinary/);
 for(const bad of [{type:'image/svg+xml',size:100},{type:'image/jpeg',size:0},{type:'image/png',size:6*1024*1024}]) assert.throws(()=>api.validateFile(bad));
 assert.equal(calls.length,0);
});
test('unsigned upload sends only file and preset and accepts a secure URL in the configured cloud',async()=>{
 const url='https://res.cloudinary.com/store/image/upload/v1/item.jpg';
 const {api,calls}=harness(config,{ok:true,json:async()=>({secure_url:url})});
 assert.equal(await api.upload(file),url);
 assert.equal(calls[0][0],'https://api.cloudinary.com/v1_1/store/image/upload');
 assert.deepEqual(calls[0][1].body.fields,[['file',file],['upload_preset','products']]);
});
test('upload errors and unexpected remote URLs never become product image paths',async()=>{
 for(const response of [{ok:false,json:async()=>({})},{ok:true,json:async()=>({secure_url:'https://attacker.example/image.jpg'})},{ok:true,json:async()=>({secure_url:'http://res.cloudinary.com/store/image/upload/a.jpg'})}]) {
  const {api}=harness(config,response); await assert.rejects(api.upload(file));
 }
});
