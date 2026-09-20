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

let currentMarket = localStorage.getItem("evrisMarket") || "CN";
let currentLanguage = localStorage.getItem("evrisLanguage") || "en";
const initialCategory = new URLSearchParams(window.location.search).get("category");
let currentFilter = ["bracelet", "earring", "necklace"].includes(initialCategory) ? initialCategory : "all";
let cart = JSON.parse(localStorage.getItem("evrisCart") || "[]");

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
    allItemsKicker: "All item",
    allItemsTitle: "All Items",
    allItemsText: "Browse every EVRIS accessory by category, keyword, and price.",
    filterAll: "All",
    filterBracelets: "Bracelets",
    filterEarrings: "Earrings",
    filterNecklaces: "Necklaces",
    searchLabel: "Search",
    sortLabel: "Sort",
    sortFeatured: "Featured",
    sortNewest: "Newest",
    sortLow: "Price low to high",
    sortHigh: "Price high to low",
    addToCart: "Add to cart",
    added: "Added",
    viewDetail: "View detail",
    remove: "Remove",
    categoryBracelet: "Bracelet",
    categoryEarring: "Earrings",
    categoryNecklace: "Necklace",
    itemCount: "{count} item{plural}",
    freeShipping: "Free shipping over {amount} / Member points 5%",
    shippingNote: "Shipping is calculated at checkout. Free shipping over {amount}.",
    searchPlaceholder: "stone, pearl, necklace...",
    footerStoreLocation: "Store location",
    footerText: "Accessory online store for calm daily styling. Member points, new arrivals, and gift-ready jewelry.",
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
    allItemsKicker: "全部商品",
    allItemsTitle: "全部商品",
    allItemsText: "按分類、關鍵詞和價格瀏覽 EVRIS 飾品。",
    filterAll: "全部",
    filterBracelets: "手鍊",
    filterEarrings: "耳環",
    filterNecklaces: "項鍊",
    searchLabel: "搜尋",
    sortLabel: "排序",
    sortFeatured: "推薦",
    sortNewest: "最新",
    sortLow: "價格從低到高",
    sortHigh: "價格從高到低",
    addToCart: "加入購物車",
    added: "已加入",
    viewDetail: "查看詳情",
    remove: "移除",
    categoryBracelet: "手鍊",
    categoryEarring: "耳環",
    categoryNecklace: "項鍊",
    itemCount: "{count} 件商品",
    freeShipping: "滿 {amount} 免運費 / 會員積分 5%",
    shippingNote: "運費會於結帳時計算。滿 {amount} 免運費。",
    searchPlaceholder: "天然石、珍珠、項鍊...",
    footerStoreLocation: "店舖位置",
    footerText: "適合安靜日常造型的飾品線上商店。會員積分、新品與禮物飾品。",
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
    allItemsKicker: "すべて",
    allItemsTitle: "すべての商品",
    allItemsText: "カテゴリ、キーワード、価格で EVRIS アクセサリーを探せます。",
    filterAll: "すべて",
    filterBracelets: "ブレスレット",
    filterEarrings: "イヤーアクセ",
    filterNecklaces: "ネックレス",
    searchLabel: "検索",
    sortLabel: "並び替え",
    sortFeatured: "おすすめ",
    sortNewest: "新着",
    sortLow: "価格が低い順",
    sortHigh: "価格が高い順",
    addToCart: "カートに入れる",
    added: "追加済み",
    viewDetail: "詳細を見る",
    remove: "削除",
    categoryBracelet: "ブレスレット",
    categoryEarring: "イヤーアクセ",
    categoryNecklace: "ネックレス",
    itemCount: "{count} 点",
    freeShipping: "{amount} 以上で送料無料 / 会員ポイント 5%",
    shippingNote: "送料はチェックアウト時に計算されます。{amount} 以上で送料無料。",
    searchPlaceholder: "天然石、パール、ネックレス...",
    footerStoreLocation: "店舗情報",
    footerText: "静かな日常スタイリングのためのアクセサリーオンラインストア。会員ポイント、新作、ギフト対応ジュエリー。",
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
    allItemsKicker: "전체 상품",
    allItemsTitle: "전체 상품",
    allItemsText: "카테고리, 키워드, 가격으로 EVRIS 액세서리를 둘러보세요.",
    filterAll: "전체",
    filterBracelets: "팔찌",
    filterEarrings: "귀걸이",
    filterNecklaces: "목걸이",
    searchLabel: "검색",
    sortLabel: "정렬",
    sortFeatured: "추천",
    sortNewest: "신상품",
    sortLow: "낮은 가격순",
    sortHigh: "높은 가격순",
    addToCart: "장바구니 담기",
    added: "추가됨",
    viewDetail: "상세 보기",
    remove: "삭제",
    categoryBracelet: "팔찌",
    categoryEarring: "귀걸이",
    categoryNecklace: "목걸이",
    itemCount: "{count}개",
    freeShipping: "{amount} 이상 무료배송 / 회원 포인트 5%",
    shippingNote: "배송비는 결제 단계에서 계산됩니다. {amount} 이상 무료배송.",
    searchPlaceholder: "스톤, 진주, 목걸이...",
    footerStoreLocation: "스토어 위치",
    footerText: "차분한 데일리 스타일링을 위한 액세서리 온라인 스토어. 회원 포인트, 신상품, 선물용 주얼리.",
  },
};

const grid = document.querySelector("#catalogGrid");
const count = document.querySelector("#catalogCount");
const search = document.querySelector("#catalogSearch");
const sort = document.querySelector("#catalogSort");
const marketSelect = document.querySelector("#marketSelect");
const languageSelect = document.querySelector("#languageSelect");
const cartCount = document.querySelector("#cartCount");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartSubtotal = document.querySelector("#cartSubtotal");

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
  search.placeholder = t("searchPlaceholder");
  window.EVRISCoupons?.render();
  syncCustomDropdown(sort);
}

function syncCustomDropdown(select) {
  const dropdown = document.querySelector(`#${select.id}Custom`);
  if (!dropdown) return;

  const options = Array.from(select.options);
  dropdown.querySelector(".selected-value").textContent = options[select.selectedIndex]?.text || "";
  dropdown.querySelectorAll(".dropdown-options li").forEach((item) => {
    const option = options.find((candidate) => candidate.value === item.dataset.value);
    if (option) item.textContent = option.text;
    item.classList.toggle("is-selected", item.dataset.value === select.value);
  });
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

function localizeMeta(product) {
  if (currentLanguage === "en") return product.meta;
  const [categoryText, detailText] = product.meta.split("/").map((part) => part.trim());
  const category = product.category || {
    bracelet: "bracelet",
    earring: "earring",
    earrings: "earring",
    necklace: "necklace",
  }[categoryText.toLowerCase()];
  const categoryLabel = category ? localizeCategory(category) : categoryText;
  return `${categoryLabel} / ${localizeMetaDetail(detailText || product.meta)}`;
}

function saveCart() {
  localStorage.setItem("evrisCart", JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent("evris:cart-updated"));
}

function updateCartCount() {
  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function addToCart(product) {
  if (!product || window.EvrisCatalog?.state !== "ready" || !product.stock || (cart.find(item => item.id === product.id)?.quantity || 0) >= product.stock) return false;
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
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

  const subtotal = cart.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
  cartSubtotal.textContent = formatPrice(subtotal);
}

function getVisibleProducts() {
  const query = search.value.trim().toLowerCase();
  let visible = products.filter((product) => {
    const categoryOk = currentFilter === "all" || product.category === currentFilter;
    const queryOk = !query || `${escapeCatalogHtml(product.title)} ${product.meta} ${product.description}`.toLowerCase().includes(query);
    return categoryOk && queryOk;
  });

  if (sort.value === "price-asc") visible = [...visible].sort((a, b) => a.priceValue - b.priceValue);
  if (sort.value === "price-desc") visible = [...visible].sort((a, b) => b.priceValue - a.priceValue);
  if (sort.value === "new") visible = [...visible].reverse();
  return visible;
}

function renderProducts() {
  const visible = getVisibleProducts();
  grid.innerHTML = visible
    .map(
      (product) => `
        <article class="product-card catalog-card" data-id="${escapeCatalogHtml(product.id)}">
          <a href="product.html?product=${escapeCatalogHtml(product.id)}" aria-label="View ${escapeCatalogHtml(product.title)}">
            <img src="${escapeCatalogHtml(product.image)}" alt="${escapeCatalogHtml(product.imageAlt)}" />
            <span class="hover-label">${t("viewDetail")}</span>
          </a>
          <div class="product-info">
            <div>
              <p>${escapeCatalogHtml(product.title)}</p>
              <small>${escapeCatalogHtml(localizeMeta(product))}</small>
            </div>
            <span>${formatPrice(product.priceValue)}</span>
          </div>
          <button type="button" class="cart-button" ${window.EvrisCatalog?.state !== "ready" || !product.stock ? "disabled" : ""} data-add="${escapeCatalogHtml(product.id)}">${t("addToCart")}</button>
        </article>
      `,
    )
    .join("");
  count.textContent = template("itemCount", {
    count: visible.length,
    plural: visible.length === 1 ? "" : "s",
  });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
    renderProducts();
  });
});

grid.addEventListener("click", (event) => {
  const productId = event.target.dataset.add;
  if (!productId) return;
  const product = products.find((item) => item.id === productId);
  if (!addToCart(product)) return;
  event.target.textContent = t("added");
  window.setTimeout(() => {
    event.target.textContent = t("addToCart");
  }, 900);
});

search.addEventListener("input", renderProducts);
sort.addEventListener("change", renderProducts);
marketSelect.addEventListener("change", () => {
  currentMarket = marketSelect.value;
  localStorage.setItem("evrisMarket", currentMarket);
  updateLocaleText();
  renderProducts();
  renderCart();
});

languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  localStorage.setItem("evrisLanguage", currentLanguage);
  updateLocaleText();
  renderProducts();
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
document.querySelectorAll("[data-filter]").forEach((item) => {
  item.classList.toggle("is-active", item.dataset.filter === currentFilter);
});
updateLocaleText();
renderProducts();
renderCart();

function initCustomDropdowns() {
  const selects = document.querySelectorAll(".locale-controls select, #catalogSort");
  selects.forEach(select => {
    // Hide original select
    select.style.display = "none";

    // Create wrapper div
    const dropdown = document.createElement("div");
    dropdown.className = "custom-dropdown";
    if (select.id === "catalogSort") dropdown.classList.add("catalog-sort-dropdown");
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

document.addEventListener('evris:catalog-updated', renderProducts);
