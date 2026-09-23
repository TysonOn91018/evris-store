const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function harness(stock=0){
 let toast,hide;
 const item={id:'aqua-pearl-bracelet',stock,is_active:true,priceValue:538};
 const window={EvrisCatalog:{state:'ready'},EVRIS_PRODUCTS:[item]};
 const context={window,document:{createElement:()=>({setAttribute(){}}),body:{append(e){toast=e;}}},localStorage:{getItem:()=> 'zh'},setTimeout:f=>(hide=f,1),clearTimeout(){}};
 vm.runInNewContext(fs.readFileSync('stock-feedback.js','utf8'),context);
 return {window,context,item,get toast(){return toast},hide:()=>hide()};
}
test('sold-out clicks show notification repeatedly and auto-hide',()=>{
 const h=harness();assert.equal(h.window.EvrisStock.check(h.item.id,[]),null);assert.match(h.toast.textContent,/已售完/);h.hide();assert.equal(h.toast.hidden,true);h.window.EvrisStock.check(h.item.id,[]);assert.equal(h.toast.hidden,false);
});
test('unknown stock is distinct from sold out and quantity cannot exceed inventory',()=>{
 const h=harness(2);h.window.EvrisCatalog.state='loading';assert.equal(h.window.EvrisStock.check(h.item.id,[]),null);assert.match(h.toast.textContent,/查詢/);
 h.window.EvrisCatalog.state='ready';assert.equal(h.window.EvrisStock.check(h.item.id,[{id:h.item.id,quantity:2}]),null);assert.match(h.toast.textContent,/上限/);assert.equal(h.window.EvrisStock.check(h.item.id,[]),h.item);
});
for(const file of ['script.js','products-page.js','product-page.js'])test(`${file}: sold out never mutates cart, available item adds once`,()=>{
 const h=harness();const cart=[];let saves=0;
 Object.assign(h.context,{cart,checkoutMessage:{},saveCart(){saves++},renderCart(){}});
 const source=fs.readFileSync(file,'utf8');const start=source.indexOf('function addToCart('),end=source.indexOf('\nfunction ',start+1);
 vm.runInNewContext(source.slice(start,end),h.context);
 assert.equal(h.context.addToCart(h.item),false);assert.equal(cart.length,0);assert.equal(saves,0);
 h.item.stock=1;assert.equal(h.context.addToCart(h.item),true);assert.equal(cart[0].quantity,1);assert.equal(h.context.addToCart(h.item),false);assert.equal(cart[0].quantity,1);
});
