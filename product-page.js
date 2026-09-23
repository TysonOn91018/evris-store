function escapeCatalogHtml(value) { return String(value ?? "").replace(/[&<>\"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" }[character])); }
const products = window.EVRIS_PRODUCTS || [];
const marketSettings = {
  CN: { locale: "zh-CN", prefix: "RMB", rate: 1, decimals: 0 },
  JP: { locale: "ja-JP", currency: "JPY", rate: 21.8, decimals: 0 },
  HK: { locale: "zh-HK", prefix: "HK$", rate: 1.08, decimals: 0 },
  US: { locale: "en-US", currency: "USD", rate: 0.14, decimals: 2 },
  KR: { locale: "ko-KR", currency: "KRW", rate: 191, decimals: 0 },
  TW: { locale: "zh-TW", prefix: "NT$", rate: 4.5, decimals: 0 },
};

if(localStorage.getItem('evrisYenDefault') !== '1') { localStorage.setItem('evrisMarket','JP'); localStorage.setItem('evrisYenDefault','1'); }
let currentMarket = localStorage.getItem("evrisMarket") || "JP";
let currentLanguage = localStorage.getItem("evrisLanguage") || "en";
let cart = JSON.parse(localStorage.getItem("evrisCart") || "[]");
let favorites = JSON.parse(localStorage.getItem("evrisFavorites") || "[]");
const params = new URLSearchParams(window.location.search);
let product = products.find((item) => item.id === params.get("product")) || products[0];

const pageText = {
  en: {
    navMembership: "Membership",
    navFeatured: "Featured",
    navShop: "Online Store",
    navArchive: "Stone Archive",
    navStyling: "Styling",
    navStore: "Shop",
    navNews: "News",
    accountLogin: "Login",
    cart: "Cart",
    cartKicker: "Shopping cart",
    cartTitle: "Your items",
    cartEmpty: "Your cart is empty.",
    continueShopping: "Continue shopping",
    subtotal: "Subtotal",
    backToAll: "Back to all item",
    addToCart: "Add to cart",
    added: "Added",
    saveFavorite: "Save favorite",
    savedFavorite: "Saved favorite",
    viewDetail: "View detail",
    detailStone: "Stone",
    detailMaterial: "Material",
    detailStyle: "Style",
    detailShipping: "Shipping",
    detailShippingTextLong: "Ships in 2-4 business days. Gift wrapping is available from cart.",
    relatedItems: "Related items",
    relatedText: "Same mood, easy to compare.",
    allItemsKicker: "All item",
    navNews: "News",
    footerStoreLocation: "Store location",
    footerText: "Accessory online store for calm daily styling. Member points, new arrivals, and gift-ready jewelry.",
    freeShipping: "Free shipping over {amount} / Member points 5%",
    shippingNote: "Shipping is calculated at checkout. Free shipping over {amount}.",
    remove: "Remove",
    categoryBracelet: "Bracelet",
    categoryEarring: "Earrings",
    categoryNecklace: "Necklace",
  },
  zh: {
    navMembership: "會員",
    navFeatured: "精選",
    navShop: "線上商店",
    navArchive: "天然石圖鑑",
    navStyling: "造型",
    navStore: "店舖",
    navNews: "消息",
    accountLogin: "登入",
    cart: "購物車",
    cartKicker: "購物車",
    cartTitle: "你的商品",
    cartEmpty: "購物車暫時沒有商品。",
    continueShopping: "繼續購物",
    subtotal: "小計",
    backToAll: "返回全部商品",
    addToCart: "加入購物車",
    added: "已加入",
    saveFavorite: "收藏",
    savedFavorite: "已收藏",
    viewDetail: "查看詳情",
    detailStone: "天然石",
    detailMaterial: "材質",
    detailStyle: "造型",
    detailShipping: "配送",
    detailShippingTextLong: "2-4 個工作天內出貨，可在購物車選擇禮物包裝。",
    relatedItems: "相關商品",
    relatedText: "同類風格，方便比較。",
    allItemsKicker: "全部商品",
    footerStoreLocation: "店舖位置",
    footerText: "適合安靜日常造型的飾品線上商店。會員積分、新品與禮物飾品。",
    freeShipping: "滿 {amount} 免運費 / 會員積分 5%",
    shippingNote: "運費會於結帳時計算。滿 {amount} 免運費。",
    remove: "移除",
    categoryBracelet: "手鍊",
    categoryEarring: "耳環",
    categoryNecklace: "項鍊",
  },
  ja: {
    navMembership: "会員",
    navFeatured: "特集",
    navShop: "オンラインストア",
    navArchive: "天然石図鑑",
    navStyling: "スタイリング",
    navStore: "店舗",
    navNews: "ニュース",
    accountLogin: "ログイン",
    cart: "カート",
    cartKicker: "ショッピングカート",
    cartTitle: "カート内の商品",
    cartEmpty: "カートは空です。",
    continueShopping: "買い物を続ける",
    subtotal: "小計",
    backToAll: "すべての商品へ戻る",
    addToCart: "カートに入れる",
    added: "追加済み",
    saveFavorite: "お気に入り保存",
    savedFavorite: "保存済み",
    viewDetail: "詳細を見る",
    detailStone: "天然石",
    detailMaterial: "素材",
    detailStyle: "スタイル",
    detailShipping: "配送",
    detailShippingTextLong: "2-4営業日以内に発送。カートでギフト包装を選べます。",
    relatedItems: "関連商品",
    relatedText: "同じムードの商品を比較できます。",
    allItemsKicker: "すべて",
    footerStoreLocation: "店舗情報",
    footerText: "静かな日常スタイリングのためのアクセサリーオンラインストア。会員ポイント、新作、ギフト対応ジュエリー。",
    freeShipping: "{amount} 以上で送料無料 / 会員ポイント 5%",
    shippingNote: "送料はチェックアウト時に計算されます。{amount} 以上で送料無料。",
    remove: "削除",
    categoryBracelet: "ブレスレット",
    categoryEarring: "イヤーアクセ",
    categoryNecklace: "ネックレス",
  },
  ko: {
    navMembership: "멤버십",
    navFeatured: "기획전",
    navShop: "샵",
    navArchive: "천연석 도감",
    navStyling: "스타일링",
    navStore: "스토어",
    navNews: "뉴스",
    accountLogin: "로그인",
    cart: "장바구니",
    cartKicker: "장바구니",
    cartTitle: "담긴 상품",
    cartEmpty: "장바구니가 비어 있습니다.",
    continueShopping: "쇼핑 계속하기",
    subtotal: "소계",
    backToAll: "전체 상품으로",
    addToCart: "장바구니 담기",
    added: "추가됨",
    saveFavorite: "즐겨찾기 저장",
    savedFavorite: "저장됨",
    viewDetail: "상세 보기",
    detailStone: "스톤",
    detailMaterial: "소재",
    detailStyle: "스타일",
    detailShipping: "배송",
    detailShippingTextLong: "영업일 기준 2-4일 내 발송. 장바구니에서 선물 포장을 선택할 수 있습니다.",
    relatedItems: "관련 상품",
    relatedText: "같은 무드로 쉽게 비교해보세요.",
    allItemsKicker: "전체 상품",
    footerStoreLocation: "스토어 위치",
    footerText: "차분한 데일리 스타일링을 위한 액세서리 온라인 스토어. 회원 포인트, 신상품, 선물용 주얼리.",
    freeShipping: "{amount} 이상 무료배송 / 회원 포인트 5%",
    shippingNote: "배송비는 결제 단계에서 계산됩니다. {amount} 이상 무료배송.",
    remove: "삭제",
    categoryBracelet: "팔찌",
    categoryEarring: "귀걸이",
    categoryNecklace: "목걸이",
  },
};

const marketSelect = document.querySelector("#marketSelect");
const languageSelect = document.querySelector("#languageSelect");
const cartCount = document.querySelector("#cartCount");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartSubtotal = document.querySelector("#cartSubtotal");
const title = document.querySelector("#detailTitle");
const meta = document.querySelector("#detailMeta");
const price = document.querySelector("#detailPrice");
const description = document.querySelector("#detailDescription");
const image = document.querySelector("#detailImage");
const material = document.querySelector("#detailMaterial");
const style = document.querySelector("#detailStyle");
const stone = document.querySelector("#detailStone");
const favoriteButton = document.querySelector("#favoriteButton");
const relatedGrid = document.querySelector("#relatedGrid");

function formatPrice(amount) {
  const market = marketSettings[currentMarket] || marketSettings.CN;
  const value = amount * market.rate;
  const options = {
    maximumFractionDigits: market.decimals,
    minimumFractionDigits: market.decimals,
  };

  if (market.prefix) return `${market.prefix} ${new Intl.NumberFormat(market.locale, options).format(value)}`;
  return new Intl.NumberFormat(market.locale, { ...options, style: "currency", currency: market.currency }).format(value);
}

function t(key) {
  return (pageText[currentLanguage] || pageText.en)[key] || pageText.en[key] || key;
}

function template(key, values = {}) {
  return t(key).replace(/\{(\w+)\}/g, (_match, token) => values[token] ?? "");
}

function updateLocaleText() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelector(".top-message").textContent = template("freeShipping", { amount: formatPrice(599) });
  document.querySelector("[data-i18n='shippingNote']").textContent = template("shippingNote", { amount: formatPrice(599) });
  window.EVRISCoupons?.render();
}

function getStoneMeaning(productItem) {
  const text = `${productItem.title} ${productItem.meta}`.toLowerCase();
  const meanings = {
    en: {
      citrine: "Citrine: positive clarity and warm daily brightness.",
      lapis: "Lapis: quiet focus, deep color, and subtle individuality.",
      tiger: "Tiger eye: natural strength, warm depth, and grounded styling.",
      pearl: "Pearl: soft elegance, daily polish, and timeless femininity.",
      crystal: "Crystal: clean light, transparent mood, and fresh layering.",
      natural: "Natural stone selected for color, texture, and a personal daily mood.",
    },
    zh: {
      citrine: "黃水晶：明亮、清透，為日常造型加入溫暖感。",
      lapis: "青金石：安靜專注，深色調帶來細膩個性。",
      tiger: "虎眼石：自然力量感，適合沉穩的大地色造型。",
      pearl: "珍珠：柔和優雅，讓日常穿搭更完整。",
      crystal: "水晶：清透光澤，適合輕盈疊戴。",
      natural: "天然石：按色彩、質感和每日心情挑選。",
    },
    ja: {
      citrine: "シトリン：前向きな透明感とあたたかな明るさ。",
      lapis: "ラピス：静かな集中、深い色、さりげない個性。",
      tiger: "タイガーアイ：自然な強さと落ち着いた奥行き。",
      pearl: "パール：やわらかな上品さで日常を整える素材。",
      crystal: "クリスタル：透明感のある光と軽やかな重ねづけ。",
      natural: "天然石：色、質感、毎日のムードで選ぶ素材。",
    },
    ko: {
      citrine: "시트린: 긍정적인 투명감과 따뜻한 밝기.",
      lapis: "라피스: 차분한 집중, 깊은 컬러, 은근한 개성.",
      tiger: "타이거 아이: 자연스러운 힘과 안정적인 깊이.",
      pearl: "펄: 부드러운 우아함으로 데일리 룩을 완성합니다.",
      crystal: "크리스털: 맑은 빛과 산뜻한 레이어링.",
      natural: "천연석: 컬러, 질감, 매일의 무드로 선택합니다.",
    },
  };
  const set = meanings[currentLanguage] || meanings.en;
  if (text.includes("citrine")) return set.citrine;
  if (text.includes("lapis") || text.includes("blue")) return set.lapis;
  if (text.includes("tiger")) return set.tiger;
  if (text.includes("pearl")) return set.pearl;
  if (text.includes("crystal")) return set.crystal;
  return set.natural;
}

function localizeCategory(category) {
  return t(`category${category.charAt(0).toUpperCase()}${category.slice(1)}`);
}

function localizeMetaDetail(detail) {
  if (currentLanguage === "en") return detail;
  const zhTerms = {
    "Natural stone": "天然石",
    Silver: "銀色",
    Crystal: "水晶",
    "Freshwater pearl": "淡水珍珠",
    "Stone mix": "混合天然石",
    "White crystal": "白水晶",
    "Daily color": "日常色彩",
    "Color accent": "色彩點綴",
    Pearl: "珍珠",
    "Blue stone": "藍色天然石",
    "Warm stone": "暖色天然石",
    "Fine silver": "精緻銀色",
    "Smoky stone": "煙晶色天然石",
    "Teal stone": "青綠色天然石",
    "Lapis silver": "青金石銀色",
  };
  if (currentLanguage === "zh") return zhTerms[detail] || detail;
  return detail;
}

function localizeMeta(productItem) {
  if (currentLanguage === "en") return productItem.meta;
  const [categoryText, detailText] = productItem.meta.split("/").map((part) => part.trim());
  const category = productItem.category || {
    bracelet: "bracelet",
    earring: "earring",
    earrings: "earring",
    necklace: "necklace",
  }[categoryText.toLowerCase()];
  const categoryLabel = category ? localizeCategory(category) : categoryText;
  return `${categoryLabel} / ${localizeMetaDetail(detailText || productItem.meta)}`;
}

function localizeProductCopy(productItem, field) {
  if (productItem.live) return productItem[field];
  if (currentLanguage === "en") return productItem[field];
  const copy = {
    zh: {
      description: `這款 ${productItem.title} 保留 EVRIS 清爽、安靜的日常感，適合單戴或與其他細節飾品疊搭。`,
      material: localizeMetaDetail(productItem.meta.split("/")[1]?.trim() || productItem.meta),
      style: "適合配搭白襯衫、針織、牛仔或簡潔連身裙，作為日常造型的輕盈重點。",
    },
    ja: {
      description: `${productItem.title} は、EVRIS らしい静かな日常感を添えるアクセサリーです。単品でも重ねづけでも使いやすい一点。`,
      material: productItem.meta.split("/")[1]?.trim() || productItem.meta,
      style: "白シャツ、ニット、デニム、シンプルなワンピースに合わせやすいデイリーアクセント。",
    },
    ko: {
      description: `${productItem.title}는 EVRIS다운 차분한 데일리 무드를 더하는 액세서리입니다. 단독 착용과 레이어링 모두에 잘 어울립니다.`,
      material: productItem.meta.split("/")[1]?.trim() || productItem.meta,
      style: "화이트 셔츠, 니트, 데님, 심플한 원피스에 가볍게 포인트로 매치하기 좋습니다.",
    },
  };
  return copy[currentLanguage]?.[field] || productItem[field];
}

function saveCart() {
  localStorage.setItem("evrisCart", JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent("evris:cart-updated"));
}

function updateCartCount() {
  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function addToCart(productItem) {
  productItem = window.EvrisStock.check(productItem?.id, cart);
  if (!productItem) return false;
  const existing = cart.find((item) => item.id === productItem.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...productItem, quantity: 1 });
  saveCart();
  renderCart();
  return true;
}

function renderCart() {
  cartItems.innerHTML = "";
  updateCartCount();

  if (cart.length === 0) {
    cartEmpty.classList.add("is-visible");
    cartSubtotal.textContent = formatPrice(0);
    return;
  }

  cartEmpty.classList.remove("is-visible");
  cart.forEach((item) => {
    const article = document.createElement("article");
    article.className = "cart-item";
    article.innerHTML = `
      <img src="${escapeCatalogHtml(item.image)}" alt="${escapeCatalogHtml(item.imageAlt)}" />
      <div>
        <h3>${escapeCatalogHtml(item.title)}</h3>
        <small>${escapeCatalogHtml(localizeMeta(item))}</small>
        <p>${formatPrice(item.priceValue * item.quantity)}</p>
        <div class="cart-item-actions">
          <button class="qty-button" type="button" data-minus="${escapeCatalogHtml(item.id)}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-button" type="button" data-plus="${escapeCatalogHtml(item.id)}">+</button>
          <button class="remove-button" type="button" data-remove="${escapeCatalogHtml(item.id)}">${t("remove")}</button>
        </div>
      </div>
    `;
    cartItems.append(article);
  });

  cartSubtotal.textContent = formatPrice(cart.reduce((sum, item) => sum + item.priceValue * item.quantity, 0));
}

function renderDetail() {
  if (!product) return;
  const lang = ['en','zh','ja','ko'].indexOf(currentLanguage);
  const index = lang < 0 ? 0 : lang;
  const state = window.EvrisCatalog?.state || 'loading';
  const stock = document.querySelector('#detailStock');
  const button = document.querySelector('#addDetailCart');
  const unavailable = product.is_active === false;
  const quantity = Number.isInteger(product.stock) ? product.stock : null;
  stock.textContent = state === 'loading' ? ['Checking stock…','正在查詢庫存…','在庫を確認中…','재고 확인 중…'][index]
    : state !== 'ready' || quantity === null ? ['Stock currently unavailable','暫時無法查詢庫存','在庫を確認できません','재고 확인 불가'][index]
    : unavailable ? ['This item is no longer available','此商品已下架','販売を終了しました','판매 종료'][index]
    : quantity === 0 ? ['Out of stock','已售罄','在庫切れ','품절'][index]
    : [`In stock · ${quantity} remaining`, `在庫：剩餘 ${quantity} 件`, `在庫：残り ${quantity} 点`, `재고: ${quantity}개`][index];
  button.disabled = false;
  stock.classList.toggle('is-empty', state === 'ready' && (unavailable || quantity === 0));
  document.title = `${product.title} | EVRIS`;
  image.src = product.image;
  image.alt = product.imageAlt;
  title.textContent = product.title;
  meta.textContent = localizeMeta(product);
  price.textContent = formatPrice(product.priceValue);
  description.textContent = localizeProductCopy(product, "description");
  material.textContent = localizeProductCopy(product, "material");
  style.textContent = localizeProductCopy(product, "style");
  stone.textContent = getStoneMeaning(product);
  favoriteButton.textContent = favorites.some((item) => item.id === product.id) ? t("savedFavorite") : t("saveFavorite");

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  relatedGrid.innerHTML = related
    .map(
      (item) => `
        <article class="product-card">
          <a href="product.html?product=${escapeCatalogHtml(item.id)}">
            <img src="${escapeCatalogHtml(item.image)}" alt="${escapeCatalogHtml(item.imageAlt)}" />
            <span class="hover-label">${t("viewDetail")}</span>
          </a>
          <div class="product-info">
            <div>
              <p>${escapeCatalogHtml(item.title)}</p>
              <small>${escapeCatalogHtml(localizeMeta(item))}</small>
            </div>
            <span>${formatPrice(item.priceValue)}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

document.querySelector("#addDetailCart").addEventListener("click", (event) => {
  if (!addToCart(product)) return;
  event.target.textContent = t("added");
  window.setTimeout(() => {
    event.target.textContent = t("addToCart");
  }, 1000);
});

favoriteButton.addEventListener("click", () => {
  const exists = favorites.some((item) => item.id === product.id);
  favorites = exists ? favorites.filter((item) => item.id !== product.id) : [...favorites, product];
  localStorage.setItem("evrisFavorites", JSON.stringify(favorites));
  window.dispatchEvent(new Event("evris:favorites-updated"));
  renderDetail();
});

marketSelect.addEventListener("change", () => {
  currentMarket = marketSelect.value;
  localStorage.setItem("evrisMarket", currentMarket);
  updateLocaleText();
  renderDetail();
  renderCart();
});

languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  localStorage.setItem("evrisLanguage", currentLanguage);
  updateLocaleText();
  renderDetail();
  renderCart();
});

document.querySelectorAll("[data-open-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    renderCart();
    cartDrawer.classList.add("is-open");
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  });
});

document.querySelectorAll("[data-close-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    cartDrawer.classList.remove("is-open");
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  });
});

cartItems.addEventListener("click", (event) => {
  const plus = event.target.dataset.plus;
  const minus = event.target.dataset.minus;
  const remove = event.target.dataset.remove;
  if (plus) cart = cart.map((item) => (item.id === plus ? { ...item, quantity: item.quantity + 1 } : item));
  if (minus) cart = cart.map((item) => (item.id === minus ? { ...item, quantity: item.quantity - 1 } : item)).filter((item) => item.quantity > 0);
  if (remove) cart = cart.filter((item) => item.id !== remove);
  saveCart();
  renderCart();
});

marketSelect.value = currentMarket;
languageSelect.value = currentLanguage;
updateLocaleText();
renderDetail();
renderCart();

function initCustomDropdowns() {
  const selects = document.querySelectorAll(".locale-controls select");
  selects.forEach(select => {
    // Hide original select
    select.style.display = "none";

    // Create wrapper div
    const dropdown = document.createElement("div");
    dropdown.className = "custom-dropdown";
    dropdown.id = select.id + "Custom";

    // Create trigger button
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "dropdown-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const selectedText = document.createElement("span");
    selectedText.className = "selected-value";
    selectedText.textContent = select.options[select.selectedIndex]?.text || "";

    // SVG Chevron Down
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "chevron");
    svg.setAttribute("width", "8");
    svg.setAttribute("height", "5");
    svg.setAttribute("viewBox", "0 0 10 6");
    svg.setAttribute("fill", "none");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M1 1L5 5L9 1");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);

    trigger.appendChild(selectedText);
    trigger.appendChild(svg);
    dropdown.appendChild(trigger);

    // Create options list
    const list = document.createElement("ul");
    list.className = "dropdown-options";
    list.setAttribute("role", "listbox");

    Array.from(select.options).forEach(opt => {
      const item = document.createElement("li");
      item.setAttribute("role", "option");
      item.setAttribute("data-value", opt.value);
      item.textContent = opt.text;
      if (opt.selected) {
        item.classList.add("is-selected");
      }

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        select.value = opt.value;
        select.dispatchEvent(new Event("change"));
        dropdown.classList.remove("is-active");
        trigger.setAttribute("aria-expanded", "false");
      });

      list.appendChild(item);
    });

    dropdown.appendChild(list);
    select.parentNode.insertBefore(dropdown, select.nextSibling);

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = dropdown.classList.contains("is-active");

      document.querySelectorAll(".custom-dropdown").forEach(d => {
        d.classList.remove("is-active");
        d.querySelector(".dropdown-trigger").setAttribute("aria-expanded", "false");
      });

      if (!isActive) {
        dropdown.classList.add("is-active");
        trigger.setAttribute("aria-expanded", "true");
      }
    });

    // Listen for select changes to keep dropdown value in sync
    select.addEventListener("change", () => {
      selectedText.textContent = select.options[select.selectedIndex]?.text || "";
      list.querySelectorAll("li").forEach(li => {
        if (li.getAttribute("data-value") === select.value) {
          li.classList.add("is-selected");
        } else {
          li.classList.remove("is-selected");
        }
      });
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-dropdown").forEach(d => {
      d.classList.remove("is-active");
      d.querySelector(".dropdown-trigger").setAttribute("aria-expanded", "false");
    });
  });
}

initCustomDropdowns();

document.addEventListener('evris:catalog-updated', () => {
  product = products.find(item => item.id === params.get('product')) || product;
  renderDetail();
});

// Refresh saved cart prices from the current authoritative catalog.
document.addEventListener('evris:catalog-updated', () => {
  if(window.EvrisCatalog?.state !== 'ready') return;
  cart = cart.map(item => {
    const current = window.EVRIS_PRODUCTS.find(product => product.id === item.id);
    return current ? {...item, priceValue:current.priceValue} : item;
  });
  localStorage.setItem('evrisCart',JSON.stringify(cart));
  renderCart();
});
