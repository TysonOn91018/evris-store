(() => {
  const copy={
    sold:['This product is sold out.','商品已售完，暫時缺貨。','この商品は売り切れです。','품절된 상품입니다.'],
    limit:['Your cart already contains all remaining stock.','購物車數量已達剩餘庫存上限。','カート内の数量が在庫数に達しています。','장바구니 수량이 남은 재고에 도달했습니다.'],
    loading:['Checking stock. Please try again shortly.','正在查詢庫存，請稍後再試。','在庫を確認中です。少し待ってからお試しください。','재고 확인 중입니다. 잠시 후 다시 시도하세요.'],
    unavailable:['Stock could not be confirmed. Please refresh and retry.','暫時無法確認庫存，請重新整理後再試。','在庫を確認できません。再読み込みしてお試しください。','재고를 확인할 수 없습니다. 새로고침 후 다시 시도하세요.']
  };
  let toast,timer;
  function show(key){
    const index=Math.max(0,['en','zh','ja','ko'].indexOf(localStorage.getItem('evrisLanguage')));
    if(!toast){toast=document.createElement('div');toast.className='stock-toast';toast.setAttribute('role','alert');document.body.append(toast);}
    toast.textContent=copy[key][index];toast.hidden=false;
    clearTimeout(timer);timer=setTimeout(()=>{toast.hidden=true;},4500);
  }
  function check(id,cart){
    const state=window.EvrisCatalog?.state;
    if(state!=='ready'){show(state==='loading'?'loading':'unavailable');return null;}
    const item=(window.EVRIS_PRODUCTS||[]).find(p=>p.id===id);
    if(!item || item.is_active===false){show('sold');return null;}
    if(!Number.isSafeInteger(item.stock)||item.stock<0){show('unavailable');return null;}
    if(item.stock===0){show('sold');return null;}
    const quantity=cart.filter(row=>row.id===id).reduce((sum,row)=>sum+(Number(row.quantity)||0),0);
    if(quantity>=item.stock){show('limit');return null;}
    return item;
  }
  window.EvrisStock={check};
})();
