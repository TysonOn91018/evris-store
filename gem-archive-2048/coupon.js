(() => {
  const GAME_STORAGE_KEY = "evris-gem-archive-2048-v1";
  const APPLIED_COUPON_KEY = "evrisAppliedGameCoupon";
  const productByReward = {
    "citrine-earrings": "citrine-drop-earrings",
    "moon-pearl": "moon-pearl-bracelet",
    "pearl-chain": "minimal-pearl-chain",
  };
  const copy = {
    en: {
      choose: "Choose a game coupon",
      empty: "No game coupons yet. Reach 256 in GAME · NATURAL STONE 2048 to unlock one.",
      unavailable: "Add the coupon's specified product to use it.",
      applied: "Applied to {product}: {amount}% OFF",
      discount: "Game coupon discount: −{price}",
      total: "Total after coupon: {price}",
      checkout: "Proceed to checkout",
    },
    zh: {
      choose: "选择游戏商品券",
      empty: "尚无游戏商品券。合成 GAME · 天然石2048 的 256 后即可解锁。",
      unavailable: "将商品券对应的商品加入购物车后即可使用。",
      applied: "已用于 {product}：减免 {amount}%",
      discount: "游戏商品券优惠：−{price}",
      total: "优惠后合计：{price}",
      checkout: "前往结算",
    },
    ja: {
      choose: "ゲームクーポンを選ぶ",
      empty: "ゲームクーポンはまだありません。GAME・天然石2048で256を合成すると解放されます。",
      unavailable: "クーポン対象の商品をカートに入れると利用できます。",
      applied: "{product}に適用：{amount}% OFF",
      discount: "ゲームクーポン割引：−{price}",
      total: "割引後の合計：{price}",
      checkout: "レジへ進む",
    },
    ko: {
      choose: "게임 쿠폰 선택",
      empty: "아직 게임 쿠폰이 없습니다. GAME · 천연석 2048에서 256을 합성하면 받을 수 있어요.",
      unavailable: "쿠폰 대상 상품을 장바구니에 담으면 사용할 수 있어요.",
      applied: "{product}에 적용됨: {amount}% 할인",
      discount: "게임 쿠폰 할인: −{price}",
      total: "할인 후 합계: {price}",
      checkout: "결제하기",
    },
  };

  function language() {
    return localStorage.getItem("evrisLanguage") || document.documentElement.lang.slice(0, 2) || "en";
  }

  function t(key, values = {}) {
    return (copy[language()] || copy.en)[key].replace(/\{(\w+)\}/g, (_match, name) => values[name] ?? "");
  }

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  }

  let accountUid = null;
  let accountState = 'loading';
  let accountCoupons = [];
  const statusCopy = {
    en: { loading: 'Loading account coupons…', failed: 'Could not load coupons. Open My Page and refresh your coupons.', login: 'Sign in to use your account coupons.', pending: 'Device rewards are not synced yet. Open My Page and select Sync coupons.', ready: 'Choose an available coupon for this product.' },
    zh: { loading: '正在載入帳戶優惠券…', failed: '無法載入優惠券，請到會員中心重新整理優惠券。', login: '請登入以使用帳戶優惠券。', pending: '此裝置嘅獎勵尚未同步，請到會員中心按「同步優惠券」。', ready: '請選擇適用於購物車商品嘅優惠券。' },
    ja: { loading: 'アカウントのクーポンを読み込み中…', failed: '読み込めませんでした。マイページでクーポンを更新してください。', login: 'クーポンを使うにはログインしてください。', pending: '端末の報酬は未同期です。マイページでクーポンを同期してください。', ready: '対象商品のクーポンを選んでください。' },
    ko: { loading: '계정 쿠폰을 불러오는 중…', failed: '쿠폰을 불러올 수 없습니다. 마이페이지에서 새로고침하세요.', login: '계정 쿠폰을 사용하려면 로그인하세요.', pending: '기기 보상이 동기화되지 않았습니다. 마이페이지에서 동기화하세요.', ready: '상품에 사용할 쿠폰을 선택하세요.' },
  };
  function statusText(key) { return (statusCopy[language()] || statusCopy.en)[key]; }
  function coupons() {
    if (!accountUid || accountState !== 'ready') return [];
    return accountCoupons.filter(coupon => coupon.user_id === accountUid && !coupon.redeemed_at
      && coupon.code && Number.isFinite(coupon.discount_percent) && coupon.discount_percent > 0 && coupon.discount_percent <= 100)
      .map(coupon => ({ ...coupon, kind: 'percent', amount: coupon.discount_percent, storeProductId: coupon.product_slug }));
  }
  function hasPendingRewards() {
    const game = read(GAME_STORAGE_KEY, {});
    return Array.isArray(game.coupons) && game.coupons.some(coupon => coupon && !coupon.redeemed_at
      && (!coupon.user_id || coupon.user_id === accountUid)
      && !accountCoupons.some(saved => saved.code === coupon.code));
  }
  function setAccountCoupons(uid, rows, state) {
    if ((accountUid && accountUid !== uid) || state === 'signed-out') localStorage.removeItem(APPLIED_COUPON_KEY);
    accountUid = uid;
    accountCoupons = Array.isArray(rows) ? rows : [];
    accountState = state;
    render();
  }

  function cart() {
    return read("evrisCart", []);
  }

  function productId(coupon) {
    return coupon.storeProductId || productByReward[coupon.rewardId] || coupon.rewardId;
  }

  function eligible(coupon, items) {
    return items.some((item) => item.id === productId(coupon));
  }

  function price(amount) {
    const market = localStorage.getItem("evrisMarket") || "CN";
    const settings = {
      CN: ["zh-CN", "RMB", 1, 2], JP: ["ja-JP", "JPY", 21.8, 0], HK: ["zh-HK", "HK$", 1.08, 0],
      US: ["en-US", "USD", 0.14, 2], KR: ["ko-KR", "KRW", 191, 0], TW: ["zh-TW", "NT$", 4.5, 0],
    }[market] || ["zh-CN", "RMB", 1, 0];
    const [locale, currency, rate, digits] = settings;
    const value = amount * rate;
    return ["RMB", "HK$", "NT$"].includes(currency)
      ? `${currency} ${new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value)}`
      : new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
  }

  function getAppliedDiscount(items = cart()) {
    const code = localStorage.getItem(APPLIED_COUPON_KEY);
    const coupon = coupons().find((item) => item.code === code);
    if (!coupon || !eligible(coupon, items)) return { discount: 0, code: null, coupon: null };
    const subtotal = items.filter((item) => item.id === productId(coupon))
      .reduce((total, item) => total + item.priceValue * item.quantity, 0);
    return { coupon, code, discount: Math.round(subtotal * coupon.amount) / 100 };
  }

  function render() {
    const items = cart();
    const saved = localStorage.getItem(APPLIED_COUPON_KEY);
    const all = coupons();
    const current = all.find((coupon) => coupon.code === saved);
    if (saved && accountState === 'ready' && (!current || !eligible(current, items))) localStorage.removeItem(APPLIED_COUPON_KEY);

    document.querySelectorAll("[data-coupon-panel]").forEach((panel) => {
      const select = panel.querySelector("[data-coupon-select]");
      const note = panel.querySelector("[data-coupon-note]");
      const total = panel.querySelector("[data-coupon-total]");
      select.disabled = !accountUid || accountState !== 'ready';
      select.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = t("choose");
      select.append(placeholder);
      all.forEach((coupon) => {
        const option = document.createElement("option");
        option.value = coupon.code;
        option.disabled = !eligible(coupon, items);
        const product = (window.EVRIS_PRODUCTS || []).find(item => item.id === productId(coupon));
        option.textContent = `${product?.title || productId(coupon)} · ${coupon.amount}% OFF · ${coupon.code}`;
        select.append(option);
      });
      const applied = getAppliedDiscount(items);
      select.value = applied.code || "";
      if (accountState === 'loading') note.textContent = statusText('loading');
      else if (!accountUid) note.textContent = statusText('login');
      else if (accountState === 'failed') note.textContent = statusText('failed');
      else if (!all.length) note.textContent = hasPendingRewards() ? statusText('pending') : t("empty");
      else if (applied.coupon) note.textContent = t("applied", { product: (window.EVRIS_PRODUCTS || []).find(item => item.id === productId(applied.coupon))?.title || productId(applied.coupon), amount: applied.coupon.amount });
      else note.textContent = all.some(coupon => eligible(coupon, items)) ? statusText('ready') : t('unavailable');
      const subtotal = items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
      total.textContent = applied.coupon
        ? `${t("discount", { price: price(applied.discount) })}\n${t("total", { price: price(subtotal - applied.discount) })}`
        : "";
      const checkout = panel.parentElement.querySelector(".coupon-checkout-link");
      if (checkout) checkout.textContent = t("checkout");
      select.onchange = () => {
        if (select.value) localStorage.setItem(APPLIED_COUPON_KEY, select.value);
        else localStorage.removeItem(APPLIED_COUPON_KEY);
        render();
      };
    });
  }

  function consume(code) {
    accountCoupons = accountCoupons.filter(coupon => coupon.code !== code);
    const game = read(GAME_STORAGE_KEY, {});
    if (Array.isArray(game.coupons)) {
      game.coupons = game.coupons.filter((coupon) => coupon.code !== code);
      try { localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(game)); } catch { /* Keep checkout usable if storage is blocked. */ }
    }
    localStorage.removeItem(APPLIED_COUPON_KEY);
    document.dispatchEvent(new CustomEvent("evris:coupons-updated"));
    render();
  }

  window.EVRISCoupons = { getAppliedDiscount, consume, render, setAccountCoupons };
  document.addEventListener("evris:cart-updated", render);
  document.addEventListener("evris:coupons-updated", render);
  document.querySelector("#languageSelect")?.addEventListener("change", render);
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-cart]")) window.setTimeout(render, 0);
  }, true);
  window.addEventListener("storage", render);
  render();
})();
