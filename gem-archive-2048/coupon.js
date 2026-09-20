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

  function coupons() {
    const game = read(GAME_STORAGE_KEY, {});
    return Array.isArray(game.coupons) ? game.coupons.filter((coupon) => (
      coupon && !coupon.redeemed_at && coupon.kind === "percent" && Number.isFinite(coupon.amount) && coupon.code
    )) : [];
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
      CN: ["zh-CN", "RMB", 1, 0], JP: ["ja-JP", "JPY", 21.8, 0], HK: ["zh-HK", "HK$", 1.08, 0],
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
    if (saved && (!current || !eligible(current, items))) localStorage.removeItem(APPLIED_COUPON_KEY);

    document.querySelectorAll("[data-coupon-panel]").forEach((panel) => {
      const select = panel.querySelector("[data-coupon-select]");
      const note = panel.querySelector("[data-coupon-note]");
      const total = panel.querySelector("[data-coupon-total]");
      select.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = t("choose");
      select.append(placeholder);
      all.forEach((coupon) => {
        const option = document.createElement("option");
        option.value = coupon.code;
        option.disabled = !eligible(coupon, items);
        option.textContent = `${coupon.code} · ${coupon.amount}% OFF`;
        select.append(option);
      });
      const applied = getAppliedDiscount(items);
      select.value = applied.code || "";
      if (!all.length) note.textContent = t("empty");
      else if (applied.coupon) note.textContent = t("applied", { product: productId(applied.coupon), amount: applied.coupon.amount });
      else note.textContent = t("unavailable");
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
    const game = read(GAME_STORAGE_KEY, {});
    if (Array.isArray(game.coupons)) {
      game.coupons = game.coupons.filter((coupon) => coupon.code !== code);
      try { localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(game)); } catch { /* Keep checkout usable if storage is blocked. */ }
    }
    localStorage.removeItem(APPLIED_COUPON_KEY);
    document.dispatchEvent(new CustomEvent("evris:coupons-updated"));
    render();
  }

  window.EVRISCoupons = { getAppliedDiscount, consume, render };
  document.addEventListener("evris:cart-updated", render);
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-cart]")) window.setTimeout(render, 0);
  }, true);
  window.addEventListener("storage", render);
  render();
})();
