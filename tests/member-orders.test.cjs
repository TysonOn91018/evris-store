const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
test('member orders isolate accounts, ignore stale responses, sort and show actual payment status',()=>{
 const elements=[];
 function el(){const e={children:[],textContent:'',events:{},append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x},setAttribute(){},addEventListener(k,f){this.events[k]=f}};elements.push(e);return e;}
 const summary=el();let section,auth;const subscriptions=[];
 summary.querySelector=()=>({before(e){section=e}});
 const window={EvrisBackend:{auth:{onAuthStateChange(f){auth=f}},watchMemberOrders(uid,ok,error){subscriptions.push({uid,ok,error});return()=>{}}}};
 vm.runInNewContext(fs.readFileSync('member-orders.js','utf8'),{window,document:{querySelector:s=>s==='#memberSummary'?summary:null,createElement:el},localStorage:{getItem:()=> 'en'},setTimeout:()=>1,clearTimeout(){},Intl,Date});
 const all=e=>e.textContent+' '+e.children.map(all).join(' ');
 auth('',{user:{id:'a'}});
 subscriptions[0].ok([{id:'old',user_id:'a',status:'pending',created_at:{seconds:1},items:[],amount_total:500,currency:'cny'},{id:'new',user_id:'a',status:'paid',created_at:{seconds:2},items:[{product_name:'Pearl',product_slug:'pearl',quantity:2}],amount_total:1000,discount_amount:0,currency:'cny',payment_mode:'test'},{id:'private',user_id:'b',items:[],status:'paid'}]);
 assert.match(all(section),/Payment confirmed/);assert.match(all(section),/Pearl × 2/);assert.doesNotMatch(all(section),/private/);
 const list=section.children[2];assert.match(all(list.children[0]),/new/);
 auth('',{user:{id:'b'}});assert.doesNotMatch(all(section),/Pearl/);
 subscriptions[0].ok([{id:'stale',user_id:'a',items:[]}]);assert.doesNotMatch(all(section),/stale/);
 subscriptions[1].ok([]);assert.match(all(section),/No orders yet/);
 subscriptions[1].error();assert.match(all(section),/Unable to load/);
 auth('',null);assert.equal(section.hidden,true);assert.equal(list.children.length,0);
});
