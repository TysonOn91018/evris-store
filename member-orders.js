(() => {
  const summary=document.querySelector('#memberSummary');
  if(!summary || !window.EvrisBackend)return;
  const copy={
    title:['My orders','我的訂單','注文履歴','내 주문'],
    refresh:['Refresh','重新整理','更新','새로고침'],
    loading:['Loading orders…','正在載入訂單…','注文を読み込み中…','주문을 불러오는 중…'],
    empty:['No orders yet.','暫時未有訂單。','注文はまだありません。','주문이 없습니다.'],
    error:['Unable to load orders. Please refresh to retry.','暫時無法載入訂單，請按重新整理重試。','注文を読み込めません。更新して再試行してください。','주문을 불러올 수 없습니다. 다시 시도하세요.'],
    test:['Test order · no real charge','測試訂單・不扣真錢','テスト注文・実際の請求なし','테스트 주문 · 실제 청구 없음'],
    paid:['Payment confirmed','付款已確認','決済確認済み','결제 확인 완료'],
    pending:['Awaiting payment confirmation','等候付款確認','決済確認待ち','결제 확인 대기'],
    draft:['Checkout not completed','尚未完成結帳','チェックアウト未完了','결제 절차 미완료'],
    expired:['Checkout expired / cancelled','付款頁已逾期／已取消','決済期限切れ・キャンセル','결제 만료 / 취소'],
    payment_review:['Payment received · store review required','已收款・待店家確認','決済受付済み・店舗確認待ち','결제 접수 · 매장 확인 필요'],
    unknown:['Status unavailable','狀態未能確認','状態を確認できません','상태 확인 불가'],
    details:['Order details','訂單詳情','注文詳細','주문 상세'],
    order:['Order number','訂單編號','注文番号','주문 번호'],
    total:['Order total','訂單總額','注文合計','주문 합계'],
    address:['Delivery address','收貨地址','配送先住所','배송 주소'],
    discount:['Discount','折扣','割引','할인'],
    demo:['Test orders do not include actual shipping.','測試訂單不會實際出貨。','テスト注文は実際には発送されません。','테스트 주문은 실제로 배송되지 않습니다.']
  };
  const language=()=>Math.max(0,['en','zh','ja','ko'].indexOf(localStorage.getItem('evrisLanguage')));
  const t=key=>(copy[key]||copy.unknown)[language()];
  const locale=()=>['en-US','zh-Hant','ja-JP','ko-KR'][language()];
  function node(tag,text,className){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;}
  const section=node('section',null,'member-orders');section.setAttribute('aria-labelledby','memberOrdersTitle');
  const heading=node('h3');heading.id='memberOrdersTitle';
  const refresh=node('button',null,'mini-button');refresh.type='button';
  const header=node('div',null,'member-coupons-heading');header.append(heading,refresh);
  const message=node('p');message.setAttribute('role','status');
  const list=node('div',null,'member-order-list');section.append(header,message,list);
  summary.querySelector('#logoutButton')?.before(section);
  let uid=null,rows=[],state='ready',revision=0,unsubscribe,timer;
  const millis=value=>value?.toMillis?.() || (Number(value?.seconds)||0)*1000;
  function money(amount,currency){
    if(!Number.isFinite(amount))return '—';
    try{return new Intl.NumberFormat(locale(),{style:'currency',currency:(currency||'cny').toUpperCase()}).format(amount/(currency?.toLowerCase()==='jpy'?1:100));}catch{return '—';}
  }
  function render(){
    section.hidden=!uid;heading.textContent=t('title');refresh.textContent=t(state==='loading'?'loading':'refresh');
    refresh.disabled=state==='loading';list.replaceChildren();
    message.textContent=!uid?'':state==='loading'?t('loading'):state==='error'?t('error'):rows.length?'':t('empty');
    for(const order of rows){
      const card=node('article',null,'member-order');
      const top=node('div',null,'member-order-top');
      const date=millis(order.created_at);top.append(node('span',date?new Date(date).toLocaleString(locale()):'—'),node('strong',t(order.status)));
      card.append(top);
      if(order.payment_mode==='test')card.append(node('p',t('test'),'member-order-test'));
      const items=node('ul');
      for(const item of order.items||[]){
        const row=node('li');const title=`${item.product_name||item.product_slug||'—'} × ${item.quantity}`;
        if(/^[a-z0-9-]+$/.test(item.product_slug||'')){const link=node('a',title);link.href=`product.html?product=${encodeURIComponent(item.product_slug)}`;row.append(link);}else row.textContent=title;
        items.append(row);
      }
      card.append(items,node('p',`${t('total')}: ${money(order.amount_total,order.currency)}`));
      const details=node('details');details.append(node('summary',t('details')),node('p',`${t('order')}: ${order.id}`),node('p',`${t('discount')}: ${money(order.discount_amount,order.currency)}`));
      if(order.shipping_address)details.append(node('p',`${t('address')}: ${order.shipping_address}`));
      if(order.payment_mode==='test')details.append(node('p',t('demo')));
      card.append(details);list.append(card);
    }
  }
  function load(){
    const current=++revision,account=uid;
    unsubscribe?.();clearTimeout(timer);rows=[];state=uid?'loading':'ready';render();if(!uid)return;
    timer=setTimeout(()=>{if(current===revision){state='error';render();}},10000);
    unsubscribe=window.EvrisBackend.watchMemberOrders(account,data=>{
      if(current!==revision)return;clearTimeout(timer);
      rows=data.filter(order=>order.user_id===account).sort((a,b)=>millis(b.created_at)-millis(a.created_at));state='ready';render();
    },()=>{if(current!==revision)return;clearTimeout(timer);rows=[];state='error';render();});
  }
  refresh.addEventListener('click',load);
  window.EvrisBackend.auth.onAuthStateChange((_event,session)=>{uid=session?.user.id||null;load();});
  document.querySelector('#languageSelect')?.addEventListener('change',render);
  render();
})();
