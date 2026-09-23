const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(){
 const node=()=>({value:'',textContent:'',listeners:{},setAttribute(){},addEventListener(k,f){this.listeners[k]=f},focus(){},scrollIntoView(){}});
 const trigger=node(),button=node(),message=node(),language=node();
 const form=node();form.elements=Object.fromEntries(['name','email','address','giftOption'].map(k=>[k,node()]));form.reset=()=>{};
 const panel=node();panel.querySelector=s=>s==='form'?form:message;panel.querySelectorAll=()=>[];form.querySelector=()=>button;trigger.after=()=>{};
 let auth,redirect,requests=[],uuid=0;
 const backend={auth:{onAuthStateChange:f=>auth=f},getProfile:async()=>({data:null}),placeOrder:async p=>{requests.push(p);return {error:new Error('offline')}}};
 const storage={evrisLanguage:'en',evrisCart:JSON.stringify([{id:'amber',quantity:2}])};
 const context={document:{querySelector:s=>s==='.coupon-checkout-link'?trigger:s==='#languageSelect'?language:null,createElement:()=>panel},localStorage:{getItem:k=>storage[k]},crypto:{randomUUID:()=>`id-${++uuid}`},URL,window:{EvrisBackend:backend,EvrisAuthFeedback:{error:(n,e)=>n.textContent=e.message},location:{assign:u=>redirect=u}}};
 vm.runInNewContext(fs.readFileSync('checkout-form.js','utf8'),context);
 return {trigger,panel,form,message,button,backend,requests,auth:()=>auth,redirect:()=>redirect};
}
const event=()=>({preventDefault(){this.prevented=true}});
test('checkout expands in place without navigating to homepage',()=>{const h=setup(),e=event();h.trigger.listeners.click(e);assert.equal(e.prevented,true);assert.equal(h.panel.hidden,false);assert.equal(h.redirect(),undefined)});
test('checkout requires authenticated member and retains idempotency on retry',async()=>{
 const h=setup();await h.form.listeners.submit(event());assert.equal(h.requests.length,0);
 await h.auth()('SIGNED_IN',{user:{id:'one',email:'member@example.com'}});
 h.form.elements.name.value='Name';h.form.elements.address.value='Address';h.form.elements.giftOption.value='none';
 await h.form.listeners.submit(event());await h.form.listeners.submit(event());
 assert.equal(h.requests.length,2);assert.equal(h.requests[0].request_id,h.requests[1].request_id);
 assert.equal(h.requests[0].p_customer_email,'member@example.com');assert.equal(h.requests[0].p_items[0].quantity,2);
 assert.equal(h.button.disabled,false);assert.equal(h.redirect(),undefined);
});
test('payment navigation only accepts HTTPS Stripe checkout',async()=>{
 const h=setup();await h.auth()('SIGNED_IN',{user:{id:'one',email:'member@example.com'}});
 h.backend.placeOrder=async()=>({data:{checkout_url:'https://example.com/fake'}});
 await h.form.listeners.submit(event());assert.equal(h.redirect(),undefined);
 h.backend.placeOrder=async()=>({data:{checkout_url:'https://checkout.stripe.com/c/pay/test'}});
 await h.form.listeners.submit(event());assert.equal(h.redirect(),'https://checkout.stripe.com/c/pay/test');
});
