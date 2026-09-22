(() => {
  const texts={
    en:{note:'TEST PAYMENT — no real charge. Checkout settles in CNY (RMB); other currencies are estimates. Test delivery and gift wrapping are free.',login:'Sign in to check your test order.',pending:'Payment is awaiting confirmation. Your cart is kept.',paid:'Test payment confirmed. Order {id}. Inventory updated.',mail:' Confirmation email has been sent.',queued:' Confirmation email is queued.',review:'Test payment received, but this order needs store review. Please keep order {id}.',expired:'Checkout expired. No payment was completed; your cart is kept.',failed:'Unable to confirm payment. Your cart is kept. Please retry.',check:'Check payment status',button:'Continue to test payment'},
    zh:{note:'測試付款：不扣真錢。以 CNY（人民幣）結算，其他貨幣為參考換算。測試訂單運費及禮物包裝免費。',login:'請登入以確認測試訂單。',pending:'正在等候付款確認，購物車會保留。',paid:'測試付款已確認。訂單 {id}。庫存已更新。',mail:' 確認電郵已寄出。',queued:' 確認電郵正等候寄出。',review:'已收到測試付款，但訂單需要店家確認。請保留訂單編號 {id}。',expired:'付款頁已逾期，未完成付款，購物車已保留。',failed:'暫時無法確認付款，購物車已保留，請重試。',check:'查看付款狀態',button:'前往測試付款'},
    ja:{note:'テスト決済：実際の請求はありません。決済通貨はCNY（人民元）です。他の通貨は参考換算です。テスト注文の送料と包装は無料です。',login:'ログインしてテスト注文を確認してください。',pending:'決済の確認待ちです。カートは保持されています。',paid:'テスト決済を確認しました。注文 {id}。在庫を更新しました。',mail:' 確認メールを送信しました。',queued:' 確認メールは送信待ちです。',review:'テスト決済を受け付けましたが、店舗による確認が必要です。注文番号 {id} を保管してください。',expired:'決済ページの期限が切れました。決済は未完了で、カートは保持されています。',failed:'決済を確認できません。カートは保持されています。再試行してください。',check:'決済状況を確認',button:'テスト決済へ進む'},
    ko:{note:'테스트 결제: 실제 청구 없음. CNY(위안)로 결제하며 다른 통화는 참고용입니다. 테스트 배송 및 포장은 무료입니다.',login:'로그인하여 테스트 주문을 확인하세요.',pending:'결제 확인 대기 중입니다. 장바구니는 유지됩니다.',paid:'테스트 결제 확인 완료. 주문 {id}. 재고가 업데이트되었습니다.',mail:' 확인 이메일을 보냈습니다.',queued:' 확인 이메일 전송 대기 중입니다.',review:'테스트 결제가 접수되었으나 매장 확인이 필요합니다. 주문 번호 {id}를 보관하세요.',expired:'결제 페이지가 만료되었습니다. 결제되지 않았으며 장바구니는 유지됩니다.',failed:'결제를 확인할 수 없습니다. 장바구니는 유지됩니다. 다시 시도하세요.',check:'결제 상태 확인',button:'테스트 결제로 이동'}
  };
  const feedback={en:{checking:'Checking…',checked:'Status refreshed',loginAction:'Sign in',close:'Close'},zh:{checking:'查詢中…',checked:'狀態已更新',loginAction:'登入帳戶',close:'關閉'},ja:{checking:'確認中…',checked:'更新しました',loginAction:'ログイン',close:'閉じる'},ko:{checking:'확인 중…',checked:'상태 업데이트 완료',loginAction:'로그인',close:'닫기'}};
  for(const lang of Object.keys(texts)) Object.assign(texts[lang],feedback[lang]);
  const t=key=>(texts[localStorage.getItem('evrisLanguage')]||texts.en)[key];
  const form=document.querySelector('#checkoutForm'); if(!form)return;
  const note=document.createElement('p'); note.className='form-message';form.prepend(note);
  const params=new URLSearchParams(location.search),id=params.get('order');
  let panel,message,button,closeButton,last=null,user=null,busy=false,checked=false,hideTimer;
  function scheduleHide(){
    clearTimeout(hideTimer);
    if(last?.status==='paid' && !busy) hideTimer=setTimeout(()=>{panel.hidden=true;},8000);
  }
  function positionPanel(){
    const bottom=document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0;
    panel?.style.setProperty('--payment-top',`${Math.max(0,bottom)+12}px`);
  }
  function render(){
    note.textContent=t('note');form.querySelector('[type="submit"]').textContent=t('button');
    if(!panel)return;
    button.textContent=t(busy?'checking':!user?'loginAction':checked?'checked':'check');
    closeButton.textContent=t('close');
    const key=!user?'login':last?.status==='paid'?'paid':last?.status==='payment_review'?'review':last?.status==='expired'?'expired':last?.error?'failed':'pending';
    message.textContent=t(key).replace('{id}',id)+(key==='paid'?t(last.email_status==='sent'?'mail':'queued'):'');
  }
  async function check(){
    if(busy)return;
    if(!user){document.querySelector('#accountButton')?.click();return;}
    clearTimeout(hideTimer);panel.hidden=false;busy=true;checked=false;button.disabled=true;render();
    try {
      const account = user.id;
      const {data,error}=await window.EvrisBackend.orderStatus({order_id:id,cancel:params.get('payment')==='cancel'});
      if (user?.id !== account) return;
      last=error?{error:true}:data;
      if(data?.status==='paid') {
        // Remove only purchased quantities, once. Keep later additions to the cart.
        const marker=`evris-paid-${user.id}-${id}`;
        if(!localStorage.getItem(marker)) {
          const existing=JSON.parse(localStorage.getItem('evrisCart') || '[]');
          const remaining=existing.map(item=>({...item,quantity:item.quantity-(data.items.find(row=>row.product_slug===item.id)?.quantity || 0)})).filter(item=>item.quantity>0);
          localStorage.setItem('evrisCart',JSON.stringify(remaining));
          localStorage.setItem(marker,'1');
          if(data.coupon_code) window.EVRISCoupons?.consume(data.coupon_code);
          window.dispatchEvent(new CustomEvent('evris:payment-cart-updated'));
        }
      }
    } catch {last={error:true};}
    finally {busy=false;checked=!last?.error;button.disabled=false;render();scheduleHide();}
  }
  if(id && ['return','cancel'].includes(params.get('payment'))) {
    panel=document.createElement('section');panel.className='payment-status';
    message=document.createElement('p');message.setAttribute('role','status');
    button=document.createElement('button');button.type='button';button.className='mini-button';button.addEventListener('click',check);
    closeButton=document.createElement('button');closeButton.type='button';closeButton.className='mini-button';
    closeButton.addEventListener('click',()=>{clearTimeout(hideTimer);panel.hidden=true;});
    const actions=document.createElement('div');actions.className='payment-status-actions';actions.append(button,closeButton);
    panel.append(message,actions);document.body.append(panel);positionPanel();
    window.addEventListener('resize',positionPanel);window.addEventListener('scroll',positionPanel,{passive:true});
    panel.addEventListener('mouseenter',()=>clearTimeout(hideTimer));panel.addEventListener('mouseleave',scheduleHide);
    panel.addEventListener('focusin',()=>clearTimeout(hideTimer));panel.addEventListener('focusout',scheduleHide);
    window.EvrisBackend.auth.onAuthStateChange((_event,session)=>{user=session?.user || null;last=null;checked=false;render();if(user)check();});
  }
  document.querySelector('#languageSelect')?.addEventListener('change',render);
  window.addEventListener('evris:cart-updated',render);
  render();
})();
