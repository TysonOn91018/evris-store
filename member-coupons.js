(() => {
  const rewards = { 'citrine-earrings':'citrine-drop-earrings', 'moon-pearl':'moon-pearl-bracelet', 'pearl-chain':'minimal-pearl-chain' };
  function mergeCoupons(uid, saved, local) {
    const known = new Set();
    const rows = saved.filter(item => item.user_id === uid && item.code && Number.isFinite(item.discount_percent)).map(item => {
      known.add(item.code);
      return { code:item.code, product:item.product_slug, amount:item.discount_percent, status:item.redeemed_at ? 'used':'available' };
    });
    for (const item of local) {
      if (!item || (item.user_id && item.user_id !== uid) || known.has(item.code) || !item.code || item.kind !== 'percent' || !Number.isFinite(item.amount)) continue;
      known.add(item.code);
      rows.push({ code:item.code, product:item.storeProductId || rewards[item.rewardId], amount:item.amount, status:'pending' });
    }
    const rank = {available:0,pending:1,used:2};
    return rows.sort((a,b) => rank[a.status] - rank[b.status] || a.code.localeCompare(b.code));
  }
  window.EvrisMemberCouponsModel = { mergeCoupons };
  if (typeof document === 'undefined') return;
  const summary = document.querySelector('#memberSummary');
  if (!summary || !window.EvrisBackend) return;
  const copy = {
    title:['My coupons','我的優惠券','マイクーポン','내 쿠폰'],
    loading:['Loading coupons…','正在載入優惠券…','クーポンを読み込み中…','쿠폰을 불러오는 중…'],
    empty:['No coupons saved to your account yet.','你嘅帳戶暫時未有優惠券。','保存済みのクーポンはありません。','저장된 쿠폰이 없습니다.'],
    available:['Available','可使用','利用可能','사용 가능'],
    used:['Used','已使用','使用済み','사용 완료'],
    pending:['On this device · not synced','此裝置記錄 · 未同步','この端末のみ・未同期','이 기기에만 저장 · 미동기화'],
    note:['These game rewards are saved on this device. Click “Sync coupons” to save them to your signed-in account.', '呢啲遊戲券目前保存在此裝置。按「同步優惠券」，即可儲存到目前登入嘅帳戶。', 'この端末に保存された報酬です。「クーポンを同期」でログイン中のアカウントに保存できます。', '이 기기에 저장된 보상입니다. 쿠폰 동기화를 눌러 로그인한 계정에 저장하세요.'],
    sync:['Sync coupons','同步優惠券','クーポンを同期','쿠폰 동기화'],
    syncing:['Syncing coupons…','正在同步優惠券…','同期中…','동기화 중…'],
    synced:['Coupons synced to your account.','優惠券已同步到你嘅帳戶。','アカウントに同期しました。','계정에 동기화했습니다.'],
    syncRules:['Coupon sync is blocked by database permissions. The store needs to publish the updated coupon rules. Your device rewards are still saved.', '優惠券同步被資料庫權限阻擋，店家需要發布最新優惠券規則。你嘅裝置獎勵仍然保留。', '権限により同期できません。店舗が最新のルールを公開する必要があります。端末の報酬は保持されています。', '권한으로 동기화할 수 없습니다. 매장에서 최신 규칙을 게시해야 합니다. 기기 보상은 유지됩니다.'],
    syncFailed:['Sync failed. Your device rewards are still saved. Check your connection and try again.', '同步失敗，你嘅裝置獎勵仍然保留。請檢查連線後重試。', '同期できませんでした。報酬は端末に保存されています。通信を確認して再試行してください。', '동기화하지 못했습니다. 보상은 유지됩니다. 연결을 확인하고 다시 시도하세요.'],
    failed:['Could not load account coupons. Please retry. Device records below are not a confirmed account balance.', '暫時無法載入帳戶優惠券，請重試。下方裝置記錄並非已確認嘅帳戶優惠券。', 'クーポンを読み込めません。再試行してください。端末内の記録は確認済みの残高ではありません。', '계정 쿠폰을 불러오지 못했습니다. 다시 시도하세요. 기기 기록은 확인된 계정 쿠폰이 아닙니다.'],
    retry:['Refresh','重新整理','更新','새로고침'],
    game:['Play / sync game rewards','前往遊戲／同步獎勵','ゲームで獲得・同期','게임 보상 받기 / 동기화'],
    product:['View eligible product','查看適用商品','対象商品を見る','대상 상품 보기'],
    off:['{amount}% OFF','減免 {amount}%','{amount}% OFF','{amount}% 할인'],
  };
  function t(key, amount) {
    const lang = Math.max(0,['en','zh','ja','ko'].indexOf(localStorage.getItem('evrisLanguage')));
    return copy[key][lang].replace('{amount}',amount ?? '');
  }
  const section = document.createElement('section'); section.className = 'member-coupons';
  section.setAttribute('aria-labelledby','memberCouponsTitle');
  const header = document.createElement('div'); header.className = 'member-coupons-heading';
  const heading = document.createElement('h3'); heading.id = 'memberCouponsTitle';
  const refresh = document.createElement('button'); refresh.type = 'button'; refresh.className = 'mini-button';
  header.append(heading,refresh);
  const message = document.createElement('p'); message.className = 'member-coupons-message'; message.setAttribute('role','status');
  const list = document.createElement('div'); list.className = 'member-coupon-list';
  const note = document.createElement('p'); note.className = 'member-coupons-note';
  const game = document.createElement('a'); game.href = 'gem-archive-2048/index.html'; game.className = 'member-coupons-game';
  const syncButton = document.createElement('button'); syncButton.type = 'button'; syncButton.className = 'mini-button';
  const syncMessage = document.createElement('p'); syncMessage.className = 'member-coupons-message'; syncMessage.setAttribute('role','status');
  section.append(header,message,list,note,syncButton,syncMessage,game);
  const logout = summary.querySelector('#logoutButton');
  if (logout) logout.before(section); else summary.append(section);
  let uid = null, saved = [], state = 'loading', unsubscribe, timer, revision = 0;
  let syncState = null, syncing = false;
  function localCoupons() {
    try { const data = JSON.parse(localStorage.getItem('evris-gem-archive-2048-v1') || '{}'); return Array.isArray(data.coupons) ? data.coupons : []; }
    catch { return []; }
  }
  function render() {
    window.EVRISCoupons?.setAccountCoupons(uid, saved, state);
    section.hidden = !uid;
    syncButton.textContent = t(syncing ? 'syncing' : 'sync');
    syncButton.disabled = syncing;
    syncMessage.textContent = syncState ? t(syncState) : '';
    list.replaceChildren();
    heading.textContent = t('title'); refresh.textContent = t('retry'); game.textContent = t('game');
    if (!uid) { message.textContent = ''; note.textContent = ''; return; }
    const rows = mergeCoupons(uid,saved,localCoupons());
    message.textContent = state === 'loading' ? t('loading') : state === 'failed' ? t('failed') : !rows.length ? t('empty') : '';
    syncButton.hidden = !rows.some(item => item.status === 'pending');
    note.hidden = syncButton.hidden; note.textContent = t('note');
    for (const item of rows) {
      const card = document.createElement('article'); card.className = `member-coupon member-coupon--${item.status}`;
      const top = document.createElement('div'); top.className = 'member-coupon-top';
      const discount = document.createElement('strong'); discount.textContent = t('off',item.amount);
      const status = document.createElement('span'); status.textContent = t(item.status); top.append(discount,status);
      const product = document.createElement('p');
      product.textContent = (window.EVRIS_PRODUCTS || []).find(product => product.id === item.product)?.title || item.product || '';
      const code = document.createElement('code'); code.textContent = item.code;
      card.append(top,product,code);
      if (item.status === 'available' && /^[a-z0-9-]+$/.test(item.product || '')) {
        const link = document.createElement('a'); link.href = `product.html?product=${encodeURIComponent(item.product)}`; link.textContent = t('product'); card.append(link);
      }
      list.append(card);
    }
  }
  function load() {
    const current = ++revision;
    unsubscribe?.(); clearTimeout(timer); saved = []; state = uid ? 'loading' : 'signed-out'; render();
    if (!uid) return;
    timer = setTimeout(() => { if (current === revision) { state = 'failed'; render(); } },8000);
    unsubscribe = window.EvrisBackend.watchMemberCoupons(uid, rows => {
      if (current !== revision) return;
      clearTimeout(timer); saved = rows; state = 'ready'; render();
    }, () => { if (current !== revision) return; clearTimeout(timer); saved = []; state = 'failed'; render(); });
  }
  syncButton.addEventListener('click', async () => {
    if (syncing || !uid) return;
    const account = uid;
    syncing = true; syncState = null; render();
    const response = await window.EvrisCouponSync.sync(account);
    if (uid !== account) return;
    syncing = false;
    syncState = response.error ? response.error.code === 'permission-denied' ? 'syncRules' : 'syncFailed' : 'synced';
    if (!response.error) load(); else render();
  });
  refresh.addEventListener('click',load);
  window.EvrisBackend.auth.onAuthStateChange((_event,session) => { uid = session?.user.id || null; syncState = null; syncing = false; load(); });
  document.querySelector('#languageSelect')?.addEventListener('change',render);
  document.addEventListener('evris:catalog-updated',render);
  document.addEventListener('evris:coupons-updated',render);
  window.addEventListener('storage',event => { if (event.key === 'evris-gem-archive-2048-v1') render(); });
  render();
})();
