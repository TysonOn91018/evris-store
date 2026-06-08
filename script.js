const productDetails = {
  "Citrine Pearl Necklace": {
    description:
      "A delicate silver necklace finished with soft pearl accents and a warm citrine tone for clean daily styling.",
    material: "Silver-tone chain, pearl accent, citrine-color crystal",
    style: "Layer with a white shirt or wear alone with a fine knit.",
  },
  "Citrine Pearl Bracelet": {
    description:
      "A natural-stone bracelet with gentle yellow clarity and pearl shine, made for easy everyday layering.",
    material: "Natural stone beads, freshwater pearl accent, elastic cord",
    style: "Pairs well with denim, ivory cotton, and other slim bracelets.",
  },
  "Citrine Drop Earrings": {
    description:
      "Light drop earrings with a warm crystal finish that adds brightness without feeling heavy.",
    material: "Crystal drop, silver-tone fitting",
    style: "Best with tucked hair, soft tailoring, or a simple camisole.",
  },
  "Baroque Arc Earrings": {
    description:
      "Freshwater pearl earrings with a curved arc silhouette for a quiet statement near the face.",
    material: "Freshwater pearl, silver-tone arc fitting",
    style: "Wear with a clean neckline or a low bun for an elegant line.",
  },
  "Tiger Eye Bracelet": {
    description:
      "A warm tiger-eye stone mix with subtle movement in the beads, balanced by a polished daily shape.",
    material: "Tiger eye stone, stone mix beads, elastic cord",
    style: "Adds depth to black, cream, gray, and brown outfits.",
  },
  "Clear Crystal Bracelet": {
    description:
      "A clear crystal bracelet with pearl details for a bright, minimal accent on the wrist.",
    material: "White crystal, pearl accent, elastic cord",
    style: "Layer with silver jewelry or keep solo for a clean finish.",
  },
  "Green Stone Bracelet": {
    description:
      "A compact green stone bracelet designed to add calm color to everyday looks.",
    material: "Green stone beads, polished spacer details",
    style: "Works especially well with white, navy, soft gray, and linen.",
  },
  "Mix Stone Bracelet": {
    description:
      "A playful color-accent bracelet with mixed stones while keeping the silhouette refined.",
    material: "Mixed natural stone beads, elastic cord",
    style: "Use as the color point with simple shirts or neutral dresses.",
  },
  "Moon Pearl Bracelet": {
    description:
      "A pearl-forward bracelet with a moonlit sheen and a soft, rounded everyday presence.",
    material: "Pearl beads, silver-tone spacer details",
    style: "Beautiful with knitwear, satin, and relaxed evening styling.",
  },
  "Lapis Pearl Bracelet": {
    description:
      "Deep blue lapis tones meet pearl softness for a bracelet with clean contrast and quiet color.",
    material: "Lapis-color stone beads, pearl accent, elastic cord",
    style: "Pairs neatly with denim, navy, white, and silver accessories.",
  },
  "Amber Pearl Bracelet": {
    description:
      "A warm amber-tone bracelet softened by pearl accents for natural, feminine styling.",
    material: "Amber-color stone beads, pearl accent, elastic cord",
    style: "Adds warmth to ivory, charcoal, olive, and casual tailoring.",
  },
  "Minimal Pearl Chain": {
    description:
      "A fine silver bracelet with a minimal pearl detail, made for subtle shine and easy stacking.",
    material: "Fine silver-tone chain, small pearl accent",
    style: "Wear alone for simplicity or stack with natural stone bracelets.",
  },
};

const SUPABASE_URL = "https://mkdxpvqvgezwbixwzbwv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3mfBQM-ZXkRDbBUn4HK5xg_CbMGczw_";
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) || null;

const modal = document.querySelector("#productModal");
const modalImage = document.querySelector("#modalImage");
const modalMeta = document.querySelector("#modalMeta");
const modalTitle = document.querySelector("#modalTitle");
const modalPrice = document.querySelector("#modalPrice");
const modalDescription = document.querySelector("#modalDescription");
const modalStone = document.querySelector("#modalStone");
const modalMaterial = document.querySelector("#modalMaterial");
const modalStyle = document.querySelector("#modalStyle");
const modalReview = document.querySelector("#modalReview");
const reviewList = document.querySelector("#reviewList");
const reviewForm = document.querySelector("#reviewForm");
const reviewMessage = document.querySelector("#reviewMessage");
const modalClose = document.querySelector(".modal-close");
const modalCart = document.querySelector(".modal-cart");
const modalFavorite = document.querySelector(".modal-favorite");
const modalShare = document.querySelector(".modal-share");
const cartCount = document.querySelector("#cartCount");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartSubtotal = document.querySelector("#cartSubtotal");
const checkoutForm = document.querySelector("#checkoutForm");
const checkoutMessage = document.querySelector("#checkoutMessage");
const accountModal = document.querySelector("#accountModal");
const accountForm = document.querySelector("#accountForm");
const accountTitle = document.querySelector("#accountTitle");
const accountSubmit = document.querySelector("#accountSubmit");
const accountMessage = document.querySelector("#accountMessage");
const accountButton = document.querySelector("#accountButton");
const forgotPasswordButton = document.querySelector("#forgotPasswordButton");
const memberSummary = document.querySelector("#memberSummary");
const memberEmail = document.querySelector("#memberEmail");
const logoutButton = document.querySelector("#logoutButton");
const favoriteCount = document.querySelector("#favoriteCount");
const stylePreference = document.querySelector("#stylePreference");
const memberAddressForm = document.querySelector("#memberAddressForm");
const memberAddress = document.querySelector("#memberAddress");
const memberAddressMessage = document.querySelector("#memberAddressMessage");
const newsletterForm = document.querySelector("#newsletterForm");
const newsletterMessage = document.querySelector("#newsletterMessage");
const productSearch = document.querySelector("#productSearch");
const priceFilter = document.querySelector("#priceFilter");
const productResultCount = document.querySelector("#productResultCount");
const marketSelect = document.querySelector("#marketSelect");
const languageSelect = document.querySelector("#languageSelect");
const topMessage = document.querySelector(".top-message");
const shippingNote = document.querySelector("#shippingNote");
const ratingInput = document.querySelector("#ratingInput");
const ratingValue = document.querySelector("#ratingValue");
const starSlider = document.querySelector(".star-slider");
let lastFocusedElement = null;
let activeProduct = null;
let cart = JSON.parse(localStorage.getItem("evrisCart") || "[]");
let member = JSON.parse(localStorage.getItem("evrisMember") || "null");
let favorites = JSON.parse(localStorage.getItem("evrisFavorites") || "[]");
let localReviews = JSON.parse(localStorage.getItem("evrisReviews") || "{}");
let currentCategory = "all";
let accountMode = "login";

const marketSettings = {
  CN: { label: "China", currency: "CNY", locale: "zh-CN", prefix: "RMB", rate: 1, decimals: 0 },
  JP: { label: "Japan", currency: "JPY", locale: "ja-JP", rate: 21.8, decimals: 0 },
  HK: { label: "Hong Kong", currency: "HKD", locale: "zh-HK", prefix: "HK$", rate: 1.08, decimals: 0 },
  US: { label: "United States", currency: "USD", locale: "en-US", rate: 0.14, decimals: 2 },
  KR: { label: "Korea", currency: "KRW", locale: "ko-KR", rate: 191, decimals: 0 },
  TW: { label: "Taiwan", currency: "TWD", locale: "zh-TW", prefix: "NT$", rate: 4.5, decimals: 0 },
};

const uiText = {
  en: {
    accountLogin: "Login",
    accountMyPage: "My page",
    accountCreate: "Create",
    accountTitleLogin: "Sign in",
    accountTitleCreate: "Create account",
    accountTitleMember: "Member page",
    cart: "Cart",
    cartKicker: "Shopping cart",
    cartTitle: "Your items",
    cartEmpty: "Your cart is empty.",
    viewMore: "View more",
    joinMember: "Join member",
    addToCart: "Add to cart",
    added: "Added",
    quickView: "Quick view",
    close: "Close",
    continueShopping: "Continue shopping",
    subtotal: "Subtotal",
    checkout: "Checkout",
    remove: "Remove",
    giftOption: "Gift option",
    noGiftWrap: "No gift wrap",
    giftWrap: "Gift wrapping",
    giftMessage: "Gift wrapping + message card",
    name: "Name",
    email: "Email",
    address: "Address",
    password: "Password",
    birthdayMonth: "Birthday month",
    loggedInAs: "Logged in as",
    memberRank: "Current rank: Silver / Points: 0 pt",
    favoriteMood: "Favorite mood",
    moodMinimal: "Minimal",
    moodNaturalStone: "Natural stone",
    moodPearlClassic: "Pearl classic",
    moodGiftStyling: "Gift styling",
    savedFavorites: "Saved favorites",
    logout: "Logout",
    favoriteCount: "{count} item{plural}",
    memberMessage: "You can track orders, save favorites, and use member points at checkout.",
    packageAddress: "Package address",
    packageAddressHint: "This address will be used automatically at checkout.",
    packageAddressPlaceholder: "Add your package delivery address",
    saveAddress: "Save address",
    addressSaved: "Address saved. It will be filled in at checkout.",
    addressEmpty: "Please enter your package delivery address.",
    freeShipping: "Free shipping over {amount} / Member points 5%",
    shippingNote: "Shipping is calculated at checkout. Free shipping over {amount}.",
    searchPlaceholder: "stone, pearl, necklace...",
    forgotPassword: "Forgot password?",
  },
  zh: {
    accountLogin: "登入",
    accountMyPage: "會員中心",
    accountCreate: "建立帳戶",
    accountTitleLogin: "會員登入",
    accountTitleCreate: "建立帳戶",
    accountTitleMember: "會員中心",
    cart: "購物車",
    cartKicker: "購物車",
    cartTitle: "你的商品",
    cartEmpty: "購物車暫時沒有商品。",
    viewMore: "查看更多",
    joinMember: "加入會員",
    addToCart: "加入購物車",
    added: "已加入",
    quickView: "快速查看",
    close: "關閉",
    continueShopping: "繼續購物",
    subtotal: "小計",
    checkout: "結帳",
    remove: "移除",
    giftOption: "禮物包裝",
    noGiftWrap: "不需要禮物包裝",
    giftWrap: "禮物包裝",
    giftMessage: "禮物包裝 + 訊息卡",
    name: "姓名",
    email: "電郵",
    address: "地址",
    password: "密碼",
    birthdayMonth: "生日月份",
    loggedInAs: "登入帳戶",
    memberRank: "目前等級：Silver / 積分：0 pt",
    favoriteMood: "喜歡風格",
    moodMinimal: "簡約",
    moodNaturalStone: "天然石",
    moodPearlClassic: "珍珠經典",
    moodGiftStyling: "禮物造型",
    savedFavorites: "收藏商品",
    logout: "登出",
    favoriteCount: "{count} 件商品",
    memberMessage: "你可以查看訂單、保存收藏，並在結帳時使用會員積分。",
    packageAddress: "收件地址",
    packageAddressHint: "此地址會於結帳時自動填入。",
    packageAddressPlaceholder: "輸入包裹配送地址",
    saveAddress: "保存地址",
    addressSaved: "地址已保存，結帳時會自動填入。",
    addressEmpty: "請輸入包裹配送地址。",
    freeShipping: "滿 {amount} 免運費 / 會員積分 5%",
    shippingNote: "運費會於結帳時計算。滿 {amount} 免運費。",
    searchPlaceholder: "天然石、珍珠、項鍊...",
    forgotPassword: "忘記密碼？",
  },
  ja: {
    accountLogin: "ログイン",
    accountMyPage: "マイページ",
    accountCreate: "新規登録",
    accountTitleLogin: "ログイン",
    accountTitleCreate: "新規登録",
    accountTitleMember: "マイページ",
    cart: "カート",
    cartKicker: "ショッピングカート",
    cartTitle: "カート内の商品",
    cartEmpty: "カートは空です。",
    viewMore: "もっと見る",
    joinMember: "会員登録",
    addToCart: "カートに入れる",
    added: "追加済み",
    quickView: "詳細を見る",
    close: "閉じる",
    continueShopping: "買い物を続ける",
    subtotal: "小計",
    checkout: "チェックアウト",
    remove: "削除",
    giftOption: "ギフト設定",
    noGiftWrap: "ギフト包装なし",
    giftWrap: "ギフト包装",
    giftMessage: "ギフト包装 + メッセージカード",
    name: "お名前",
    email: "メール",
    address: "住所",
    password: "パスワード",
    birthdayMonth: "誕生月",
    loggedInAs: "ログイン中",
    memberRank: "現在のランク：Silver / ポイント：0 pt",
    favoriteMood: "好きなムード",
    moodMinimal: "ミニマル",
    moodNaturalStone: "天然石",
    moodPearlClassic: "パールクラシック",
    moodGiftStyling: "ギフトスタイリング",
    savedFavorites: "お気に入り",
    logout: "ログアウト",
    favoriteCount: "{count} 点",
    memberMessage: "注文確認、お気に入り保存、チェックアウト時のポイント利用ができます。",
    packageAddress: "お届け先住所",
    packageAddressHint: "この住所はチェックアウト時に自動入力されます。",
    packageAddressPlaceholder: "荷物のお届け先住所を入力",
    saveAddress: "住所を保存",
    addressSaved: "住所を保存しました。チェックアウト時に自動入力されます。",
    addressEmpty: "お届け先住所を入力してください。",
    freeShipping: "{amount} 以上で送料無料 / 会員ポイント 5%",
    shippingNote: "送料はチェックアウト時に計算されます。{amount} 以上で送料無料。",
    searchPlaceholder: "天然石、パール、ネックレス...",
    forgotPassword: "パスワードを忘れた方",
  },
  ko: {
    accountLogin: "로그인",
    accountMyPage: "마이페이지",
    accountCreate: "가입",
    accountTitleLogin: "로그인",
    accountTitleCreate: "회원가입",
    accountTitleMember: "마이페이지",
    cart: "장바구니",
    cartKicker: "장바구니",
    cartTitle: "담긴 상품",
    cartEmpty: "장바구니가 비어 있습니다.",
    viewMore: "더 보기",
    joinMember: "회원가입",
    addToCart: "장바구니 담기",
    added: "추가됨",
    quickView: "빠른 보기",
    close: "닫기",
    continueShopping: "쇼핑 계속하기",
    subtotal: "소계",
    checkout: "결제하기",
    remove: "삭제",
    giftOption: "선물 옵션",
    noGiftWrap: "선물 포장 없음",
    giftWrap: "선물 포장",
    giftMessage: "선물 포장 + 메시지 카드",
    name: "이름",
    email: "이메일",
    address: "주소",
    password: "비밀번호",
    birthdayMonth: "생일 월",
    loggedInAs: "로그인 계정",
    memberRank: "현재 등급: Silver / 포인트: 0 pt",
    favoriteMood: "선호 무드",
    moodMinimal: "미니멀",
    moodNaturalStone: "내추럴 스톤",
    moodPearlClassic: "펄 클래식",
    moodGiftStyling: "선물 스타일링",
    savedFavorites: "저장한 상품",
    logout: "로그아웃",
    favoriteCount: "{count}개",
    memberMessage: "주문 확인, 즐겨찾기 저장, 결제 시 포인트 사용이 가능합니다.",
    packageAddress: "배송 주소",
    packageAddressHint: "이 주소는 결제 시 자동으로 입력됩니다.",
    packageAddressPlaceholder: "패키지를 받을 배송 주소를 입력하세요",
    saveAddress: "주소 저장",
    addressSaved: "주소가 저장되었습니다. 결제 시 자동 입력됩니다.",
    addressEmpty: "배송 주소를 입력해주세요.",
    freeShipping: "{amount} 이상 무료배송 / 회원 포인트 5%",
    shippingNote: "배송비는 결제 단계에서 계산됩니다. {amount} 이상 무료배송.",
    searchPlaceholder: "스톤, 진주, 목걸이...",
    forgotPassword: "비밀번호 찾기",
  },
};

const extraUiText = {
  en: {
    navAllItem: "All item",
    navMembership: "Membership",
    navFeatured: "Featured",
    navShop: "Shop",
    navStyling: "Styling",
    navStore: "Store",
    navNews: "News",
    heroKicker: "Online store / daily accessory edit",
    heroTitle: "The New Collection",
    heroText:
      "Pearl, stone, and silver accessories selected for calm everyday styling. Minimal shapes, soft shine, and gift-ready pieces for every day.",
    issueNote: "New items / Quiet luxury edit",
    stripShipping: "Free shipping over {amount}",
    stripPoints: "Member points on every order",
    stripGift: "Gift wrapping available",
    stripReturn: "7-day return support",
    catPierce: "Pierce",
    catNecklace: "Necklace",
    catRing: "Ring",
    catEyewear: "Eyewear",
    catEarring: "Earring",
    catOther: "Other",
    catEarSleeve: "Ear sleeve",
    catBracelet: "Bracelet",
    newKicker: "New Collection",
    newTitle: "Jewelry made easy for daily styling.",
    featureMeta: "Bracelet / Natural stone",
    featureText: "A soft blue stone bracelet made for ivory shirts, denim, and quiet summer styling.",
    collectionLead: "EVRIS edits wearable art pieces with EC clarity: easy to browse, easy to compare, easy to buy.",
    collectionText:
      "Pearl jewelry, natural stone bracelets, delicate earrings, and minimal necklaces are organized by mood, category, and daily styling use.",
    memberTitle: "More ways to enjoy choosing.",
    memberText:
      "Create an EVRIS account to save favorites, earn points, track orders, and receive early access to quiet-luxury drops.",
    benefitPointsTitle: "5% point back",
    benefitPointsText: "Earn points with every purchase and use them from the next order.",
    benefitBirthdayTitle: "Birthday coupon",
    benefitBirthdayText: "Receive a seasonal coupon and styling edit during your birthday month.",
    benefitRankTitle: "Rank benefits",
    benefitRankText: "Silver, Gold, and Muse ranks unlock early sales and limited gift wrapping.",
    stylingKicker: "Recommended Styling",
    stylingTitle: "Soft presence, quiet space.",
    stylingText:
      "Pair a slim necklace with an oversized shirt, layer one pearl bracelet with a natural stone piece, or keep the ear line delicate with a single drop.",
    styleNoteIvory: "Ivory cotton",
    styleNoteGray: "Soft gray knit",
    styleNoteSilver: "Silver line",
    styleNoteStone: "Natural stone accent",
    featuredKicker: "Featured",
    featuredSmall: "Special contents",
    storyNovelty: "Novelty fair",
    storyLayer: "Layer to define",
    storyMinimalism: "Intense minimalism",
    rankingKicker: "Ranking",
    shopTitle: "Shop EVRIS accessories",
    filterAll: "All",
    filterBracelets: "Bracelets",
    filterEarrings: "Earrings",
    filterNecklaces: "Necklaces",
    searchLabel: "Search",
    priceLabel: "Price",
    priceAll: "All price",
    priceEntry: "Entry under {amount}",
    priceStandard: "Standard {from}-{to}",
    pricePremium: "Premium over {amount}",
    itemCount: "{count} item{plural}",
    materialKicker: "Surgical stainless",
    materialTitle: "Daily jewelry made for lasting wear.",
    materialText: "Water-friendly shine, soft silhouettes, and accessories designed for repeat styling from morning to night.",
    stoneKicker: "Stone dictionary",
    stoneSmall: "Choose by meaning, color, and daily mood.",
    stoneCitrineTitle: "Positive clarity",
    stoneCitrineText: "Warm yellow tone for confidence, brightness, and a light daily accent.",
    stoneLapisTitle: "Quiet focus",
    stoneLapisText: "Deep blue for calm styling, denim looks, and personal expression.",
    stonePearlTitle: "Soft elegance",
    stonePearlText: "A classic material that makes simple outfits feel finished.",
    stoneTigerTitle: "Natural strength",
    stoneTigerText: "Earthy depth for black, ivory, and soft gray coordinate looks.",
    coordinateKicker: "Staff coordinate",
    coordinateSmall: "Introducing EVRIS store staff styling",
    storeSmall: "Shop list",
    infoLabel: "Information",
    newsOne: "New arrival collection is now available.",
    newsTwo: "Novelty fair starts this weekend.",
    newsThree: "Member points campaign has been updated.",
    newsFour: "Store styling archive is open.",
    newsletterKicker: "News letter",
    newsletterText: "Receive new arrivals, campaigns, and styling notes.",
    newsletterPlaceholder: "EMAIL",
    send: "Send",
    footerStoreLocation: "Store location",
    footerText: "Accessory online store for calm daily styling. Member points, new arrivals, and gift-ready jewelry.",
    detailStone: "Stone",
    detailMaterial: "Material",
    detailStyle: "Style",
    detailShipping: "Shipping",
    detailShippingText: "Ships in 2-4 business days",
    reviewKicker: "Review",
    rating: "Rating",
    comment: "Comment",
    commentPlaceholder: "Write your styling note...",
    postComment: "Post comment",
    saveFavorite: "Save favorite",
    savedFavorite: "Saved",
    share: "Share",
    metaNecklaceSilver: "Necklace / Silver",
    metaBraceletStone: "Bracelet / Natural stone",
    metaEarringsCrystal: "Earrings / Crystal",
    metaEarringsPearl: "Earrings / Freshwater pearl",
    metaBraceletMix: "Bracelet / Stone mix",
    metaBraceletCrystal: "Bracelet / White crystal",
    metaBraceletColor: "Bracelet / Daily color",
    metaBraceletAccent: "Bracelet / Color accent",
    metaBraceletPearl: "Bracelet / Pearl",
    metaBraceletBlue: "Bracelet / Blue stone",
    metaBraceletWarm: "Bracelet / Warm stone",
    metaBraceletSilver: "Bracelet / Fine silver",
    copied: "Copied",
    noComments: "No comments yet. Be the first to share a styling note.",
    reviewPosted: "Comment posted. Thank you for sharing your styling note.",
    cartNeedItem: "Please add an item before checkout.",
    orderReceived: "Order received. We will email your confirmation shortly.",
    newsletterThanks: "Thank you. You are subscribed to EVRIS news.",
    resetNeedEmail: "Please enter your email first, then click Forgot password.",
    resetNeedsConnection: "Password reset needs Supabase connection.",
    resetSent: "Password reset email sent to {email}. Please check your inbox.",
    loggedOut: "You have logged out.",
  },
  zh: {
    navAllItem: "全部商品",
    navMembership: "會員",
    navFeatured: "精選",
    navShop: "商店",
    navStyling: "造型",
    navStore: "店舖",
    navNews: "消息",
    heroKicker: "線上商店 / 日常飾品選物",
    heroTitle: "全新系列",
    heroText: "以珍珠、天然石與銀色線條，打造適合日常配搭的柔和飾品。",
    issueNote: "新商品 / 靜奢選物",
    stripShipping: "滿 {amount} 免運費",
    stripPoints: "每次購買累積會員積分",
    stripGift: "提供禮物包裝",
    stripReturn: "7 日退換支援",
    catPierce: "耳針",
    catNecklace: "項鍊",
    catRing: "戒指",
    catEyewear: "眼鏡",
    catEarring: "耳環",
    catOther: "其他",
    catEarSleeve: "耳套",
    catBracelet: "手鍊",
    newKicker: "全新系列",
    newTitle: "為日常造型而選的飾品。",
    featureMeta: "手鍊 / 天然石",
    featureText: "柔和藍色天然石手鍊，適合白襯衫、牛仔與夏日造型。",
    collectionLead: "EVRIS 以清晰易逛的 EC 體驗，編輯日常可佩戴的藝術飾品。",
    collectionText: "珍珠、天然石手鍊、精緻耳環與極簡項鍊，按風格與日常用途整理。",
    memberTitle: "越購買，越享受選物。",
    memberText: "建立 EVRIS 帳戶可保存收藏、累積積分、追蹤訂單並優先收到新品資訊。",
    benefitPointsTitle: "5% 積分回贈",
    benefitPointsText: "每次購買都可累積積分，下次訂單即可使用。",
    benefitBirthdayTitle: "生日優惠券",
    benefitBirthdayText: "生日月份可收到季節優惠與造型推薦。",
    benefitRankTitle: "會員等級福利",
    benefitRankText: "Silver、Gold、Muse 等級可解鎖早鳥折扣與限定包裝。",
    stylingKicker: "推薦造型",
    stylingTitle: "柔和存在感，安靜留白。",
    stylingText: "以細項鍊配寬鬆襯衫，或以珍珠手鍊疊戴天然石，營造不浮誇的細節。",
    styleNoteIvory: "象牙白棉質",
    styleNoteGray: "柔灰針織",
    styleNoteSilver: "銀色線條",
    styleNoteStone: "天然石點綴",
    featuredKicker: "精選",
    featuredSmall: "特別內容",
    storyNovelty: "贈品活動",
    storyLayer: "層次配搭",
    storyMinimalism: "強烈極簡",
    rankingKicker: "人氣排行",
    shopTitle: "選購 EVRIS 飾品",
    filterAll: "全部",
    filterBracelets: "手鍊",
    filterEarrings: "耳環",
    filterNecklaces: "項鍊",
    searchLabel: "搜尋",
    priceLabel: "價格",
    priceAll: "全部價格",
    priceEntry: "{amount} 以下",
    priceStandard: "{from}-{to}",
    pricePremium: "{amount} 以上",
    itemCount: "{count} 件商品",
    materialKicker: "醫療級不鏽鋼",
    materialTitle: "為長時間日常佩戴而設計。",
    materialText: "親水光澤、柔和輪廓，從早到晚都容易重複配搭。",
    stoneKicker: "天然石字典",
    stoneSmall: "按寓意、色彩與每日心情挑選。",
    stoneCitrineTitle: "明亮正向",
    stoneCitrineText: "溫暖黃色調，帶來自信、明亮與輕盈點綴。",
    stoneLapisTitle: "安靜專注",
    stoneLapisText: "深藍色適合冷靜造型、牛仔與個性表達。",
    stonePearlTitle: "柔和優雅",
    stonePearlText: "經典材質，讓簡約穿搭更完整。",
    stoneTigerTitle: "自然力量",
    stoneTigerText: "大地色深度，適合黑、象牙白與柔灰配搭。",
    coordinateKicker: "店員造型",
    coordinateSmall: "EVRIS 店員配搭介紹",
    storeSmall: "店舖列表",
    infoLabel: "通知",
    newsOne: "新品系列已上架。",
    newsTwo: "贈品活動將於本週末開始。",
    newsThree: "會員積分活動已更新。",
    newsFour: "店舖造型檔案已公開。",
    newsletterKicker: "電子報",
    newsletterText: "接收新品、活動與造型筆記。",
    newsletterPlaceholder: "電郵",
    send: "送出",
    footerStoreLocation: "店舖位置",
    footerText: "適合安靜日常造型的飾品線上商店。會員積分、新品與禮物飾品。",
    detailStone: "天然石",
    detailMaterial: "材質",
    detailStyle: "造型",
    detailShipping: "配送",
    detailShippingText: "2-4 個工作天內出貨",
    reviewKicker: "評價",
    rating: "評分",
    comment: "留言",
    commentPlaceholder: "寫下你的配搭心得...",
    postComment: "發佈留言",
    saveFavorite: "收藏",
    savedFavorite: "已收藏",
    share: "分享",
    metaNecklaceSilver: "項鍊 / 銀色",
    metaBraceletStone: "手鍊 / 天然石",
    metaEarringsCrystal: "耳環 / 水晶",
    metaEarringsPearl: "耳環 / 淡水珍珠",
    metaBraceletMix: "手鍊 / 混合天然石",
    metaBraceletCrystal: "手鍊 / 白水晶",
    metaBraceletColor: "手鍊 / 日常色彩",
    metaBraceletAccent: "手鍊 / 色彩點綴",
    metaBraceletPearl: "手鍊 / 珍珠",
    metaBraceletBlue: "手鍊 / 藍色天然石",
    metaBraceletWarm: "手鍊 / 暖色天然石",
    metaBraceletSilver: "手鍊 / 精緻銀色",
    copied: "已複製",
    noComments: "暫時沒有留言。成為第一個分享配搭心得的人。",
    reviewPosted: "留言已發佈，多謝你的配搭分享。",
    cartNeedItem: "請先加入商品再結帳。",
    orderReceived: "訂單已收到。我們會稍後以電郵確認。",
    newsletterThanks: "謝謝，你已訂閱 EVRIS 消息。",
    resetNeedEmail: "請先輸入電郵，再按忘記密碼。",
    resetNeedsConnection: "重設密碼需要 Supabase 連線。",
    resetSent: "重設密碼電郵已發送到 {email}，請查看收件箱。",
    loggedOut: "你已登出。",
  },
  ja: {
    navAllItem: "すべて",
    navMembership: "会員",
    navFeatured: "特集",
    navShop: "ショップ",
    navStyling: "スタイリング",
    navStore: "店舗",
    navNews: "ニュース",
    heroKicker: "オンラインストア / デイリーアクセサリー",
    heroTitle: "ニューコレクション",
    heroText: "パール、天然石、シルバーの輝きを日常に。やわらかな存在感のアクセサリー。",
    issueNote: "新作 / クワイエットラグジュアリー",
    stripShipping: "{amount} 以上で送料無料",
    stripPoints: "お買い物ごとに会員ポイント",
    stripGift: "ギフトラッピング対応",
    stripReturn: "7日間返品サポート",
    catPierce: "ピアス",
    catNecklace: "ネックレス",
    catRing: "リング",
    catEyewear: "アイウェア",
    catEarring: "イヤリング",
    catOther: "その他",
    catEarSleeve: "イヤーカフ",
    catBracelet: "ブレスレット",
    newKicker: "ニューコレクション",
    newTitle: "毎日のスタイリングに寄り添うジュエリー。",
    featureMeta: "ブレスレット / 天然石",
    featureText: "白シャツやデニム、夏の装いに合うやわらかなブルーの天然石ブレスレット。",
    collectionLead: "EVRIS は、選びやすく比べやすい EC 体験で日常のアートピースを編集します。",
    collectionText: "パール、天然石ブレスレット、繊細なイヤーアクセ、ミニマルネックレスをムード別に提案。",
    memberTitle: "選ぶほど、もっと楽しく。",
    memberText: "EVRIS 会員になると、お気に入り保存、ポイント、注文確認、新作先行情報が利用できます。",
    benefitPointsTitle: "5% ポイント還元",
    benefitPointsText: "購入ごとにポイントが貯まり、次回のお買い物から使えます。",
    benefitBirthdayTitle: "バースデークーポン",
    benefitBirthdayText: "誕生月に季節のクーポンとスタイリング提案をお届けします。",
    benefitRankTitle: "ランク特典",
    benefitRankText: "Silver、Gold、Muse ランクで先行セールや限定ラッピングが利用できます。",
    stylingKicker: "おすすめスタイリング",
    stylingTitle: "やわらかな存在感、凛とした余白。",
    stylingText: "細いネックレスをオーバーシャツに合わせたり、パールと天然石を重ねてさりげない個性に。",
    styleNoteIvory: "アイボリーコットン",
    styleNoteGray: "ソフトグレーニット",
    styleNoteSilver: "シルバーライン",
    styleNoteStone: "天然石アクセント",
    featuredKicker: "特集",
    featuredSmall: "スペシャルコンテンツ",
    storyNovelty: "ノベルティフェア",
    storyLayer: "重ねて整える",
    storyMinimalism: "強いミニマル",
    rankingKicker: "ランキング",
    shopTitle: "EVRIS アクセサリーを探す",
    filterAll: "すべて",
    filterBracelets: "ブレスレット",
    filterEarrings: "イヤーアクセ",
    filterNecklaces: "ネックレス",
    searchLabel: "検索",
    priceLabel: "価格",
    priceAll: "すべての価格",
    priceEntry: "{amount} 未満",
    priceStandard: "{from}-{to}",
    pricePremium: "{amount} 以上",
    itemCount: "{count} 点",
    materialKicker: "サージカルステンレス",
    materialTitle: "毎日に長く寄り添うジュエリー。",
    materialText: "水に強い輝き、やわらかなシルエット、朝から夜まで使いやすいアクセサリー。",
    stoneKicker: "天然石辞典",
    stoneSmall: "意味、色、毎日のムードで選ぶ。",
    stoneCitrineTitle: "前向きな透明感",
    stoneCitrineText: "自信と明るさを添える、あたたかなイエロートーン。",
    stoneLapisTitle: "静かな集中",
    stoneLapisText: "深いブルーは落ち着いた装い、デニム、個性表現に。",
    stonePearlTitle: "やわらかな上品さ",
    stonePearlText: "シンプルな服をきちんと仕上げるクラシック素材。",
    stoneTigerTitle: "自然な強さ",
    stoneTigerText: "黒、アイボリー、ソフトグレーに合うアースカラーの奥行き。",
    coordinateKicker: "スタッフコーディネート",
    coordinateSmall: "EVRIS スタッフスタイリングを紹介",
    storeSmall: "ショップリスト",
    infoLabel: "お知らせ",
    newsOne: "新作コレクションが入荷しました。",
    newsTwo: "ノベルティフェアは今週末スタート。",
    newsThree: "会員ポイントキャンペーンを更新しました。",
    newsFour: "店舗スタイリングアーカイブを公開しました。",
    newsletterKicker: "ニュースレター",
    newsletterText: "新作、キャンペーン、スタイリングノートをお届けします。",
    newsletterPlaceholder: "メール",
    send: "送信",
    footerStoreLocation: "店舗情報",
    footerText: "静かな日常スタイリングのためのアクセサリーオンラインストア。会員ポイント、新作、ギフト対応ジュエリー。",
    detailStone: "天然石",
    detailMaterial: "素材",
    detailStyle: "スタイル",
    detailShipping: "配送",
    detailShippingText: "2-4営業日以内に発送",
    reviewKicker: "レビュー",
    rating: "評価",
    comment: "コメント",
    commentPlaceholder: "スタイリングメモを書く...",
    postComment: "コメントを投稿",
    saveFavorite: "お気に入り保存",
    savedFavorite: "保存済み",
    share: "共有",
    metaNecklaceSilver: "ネックレス / シルバー",
    metaBraceletStone: "ブレスレット / 天然石",
    metaEarringsCrystal: "イヤーアクセ / クリスタル",
    metaEarringsPearl: "イヤーアクセ / 淡水パール",
    metaBraceletMix: "ブレスレット / ストーンミックス",
    metaBraceletCrystal: "ブレスレット / ホワイトクリスタル",
    metaBraceletColor: "ブレスレット / デイリーカラー",
    metaBraceletAccent: "ブレスレット / カラーアクセント",
    metaBraceletPearl: "ブレスレット / パール",
    metaBraceletBlue: "ブレスレット / ブルーストーン",
    metaBraceletWarm: "ブレスレット / ウォームストーン",
    metaBraceletSilver: "ブレスレット / ファインシルバー",
    copied: "コピーしました",
    noComments: "まだコメントはありません。最初のスタイリングメモを投稿しましょう。",
    reviewPosted: "コメントを投稿しました。スタイリングメモをありがとうございます。",
    cartNeedItem: "チェックアウト前に商品を追加してください。",
    orderReceived: "注文を受け付けました。確認メールをお送りします。",
    newsletterThanks: "ありがとうございます。EVRIS ニュースに登録されました。",
    resetNeedEmail: "先にメールアドレスを入力してから、パスワード再設定を押してください。",
    resetNeedsConnection: "パスワード再設定には Supabase 接続が必要です。",
    resetSent: "{email} にパスワード再設定メールを送信しました。受信箱をご確認ください。",
    loggedOut: "ログアウトしました。",
  },
  ko: {
    navAllItem: "전체",
    navMembership: "멤버십",
    navFeatured: "기획전",
    navShop: "샵",
    navStyling: "스타일링",
    navStore: "스토어",
    navNews: "뉴스",
    heroKicker: "온라인 스토어 / 데일리 액세서리",
    heroTitle: "뉴 컬렉션",
    heroText: "진주, 천연석, 실버 포인트로 매일 착용하기 좋은 액세서리를 제안합니다.",
    issueNote: "신상품 / 조용한 럭셔리",
    stripShipping: "{amount} 이상 무료배송",
    stripPoints: "주문마다 회원 포인트 적립",
    stripGift: "선물 포장 가능",
    stripReturn: "7일 반품 지원",
    catPierce: "피어스",
    catNecklace: "목걸이",
    catRing: "반지",
    catEyewear: "아이웨어",
    catEarring: "귀걸이",
    catOther: "기타",
    catEarSleeve: "이어커프",
    catBracelet: "팔찌",
    newKicker: "뉴 컬렉션",
    newTitle: "데일리 스타일링을 위한 주얼리.",
    featureMeta: "팔찌 / 천연석",
    featureText: "아이보리 셔츠, 데님, 여름 스타일링에 어울리는 부드러운 블루 스톤 팔찌.",
    collectionLead: "EVRIS는 보기 쉽고 비교하기 쉬운 EC 경험으로 매일 착용할 수 있는 아트 피스를 큐레이션합니다.",
    collectionText: "진주, 천연석 팔찌, 섬세한 귀걸이, 미니멀 목걸이를 무드와 용도별로 구성했습니다.",
    memberTitle: "고를수록 더 즐거운 멤버십.",
    memberText: "EVRIS 계정으로 즐겨찾기 저장, 포인트 적립, 주문 조회, 신상품 선공개를 이용하세요.",
    benefitPointsTitle: "5% 포인트 적립",
    benefitPointsText: "구매마다 포인트를 적립하고 다음 주문부터 사용할 수 있습니다.",
    benefitBirthdayTitle: "생일 쿠폰",
    benefitBirthdayText: "생일 월에 시즌 쿠폰과 스타일링 제안을 받을 수 있습니다.",
    benefitRankTitle: "등급 혜택",
    benefitRankText: "Silver, Gold, Muse 등급별 선세일과 한정 포장을 제공합니다.",
    stylingKicker: "추천 스타일링",
    stylingTitle: "부드러운 존재감, 차분한 여백.",
    stylingText: "얇은 목걸이를 오버셔츠에 매치하거나, 진주와 천연석 팔찌를 레이어링해보세요.",
    styleNoteIvory: "아이보리 코튼",
    styleNoteGray: "소프트 그레이 니트",
    styleNoteSilver: "실버 라인",
    styleNoteStone: "천연석 포인트",
    featuredKicker: "기획전",
    featuredSmall: "스페셜 콘텐츠",
    storyNovelty: "노벨티 페어",
    storyLayer: "레이어 스타일",
    storyMinimalism: "강한 미니멀리즘",
    rankingKicker: "랭킹",
    shopTitle: "EVRIS 액세서리 쇼핑",
    filterAll: "전체",
    filterBracelets: "팔찌",
    filterEarrings: "귀걸이",
    filterNecklaces: "목걸이",
    searchLabel: "검색",
    priceLabel: "가격",
    priceAll: "전체 가격",
    priceEntry: "{amount} 미만",
    priceStandard: "{from}-{to}",
    pricePremium: "{amount} 이상",
    itemCount: "{count}개",
    materialKicker: "서지컬 스테인리스",
    materialTitle: "오래 착용하기 좋은 데일리 주얼리.",
    materialText: "물에 강한 광택, 부드러운 실루엣, 아침부터 밤까지 반복 착용하기 좋은 액세서리.",
    stoneKicker: "스톤 딕셔너리",
    stoneSmall: "의미, 색감, 데일리 무드로 선택하세요.",
    stoneCitrineTitle: "긍정적인 선명함",
    stoneCitrineText: "자신감과 밝음을 더하는 따뜻한 옐로 톤.",
    stoneLapisTitle: "차분한 집중",
    stoneLapisText: "딥 블루는 차분한 스타일링, 데님, 개성 표현에 잘 어울립니다.",
    stonePearlTitle: "부드러운 우아함",
    stonePearlText: "심플한 옷차림을 완성해주는 클래식 소재.",
    stoneTigerTitle: "자연스러운 힘",
    stoneTigerText: "블랙, 아이보리, 소프트 그레이에 어울리는 어스 톤의 깊이.",
    coordinateKicker: "스태프 코디네이트",
    coordinateSmall: "EVRIS 스토어 스태프 스타일링 소개",
    storeSmall: "샵 리스트",
    infoLabel: "안내",
    newsOne: "신상품 컬렉션이 입고되었습니다.",
    newsTwo: "노벨티 페어가 이번 주말 시작됩니다.",
    newsThree: "회원 포인트 캠페인이 업데이트되었습니다.",
    newsFour: "스토어 스타일링 아카이브가 공개되었습니다.",
    newsletterKicker: "뉴스레터",
    newsletterText: "신상품, 캠페인, 스타일링 노트를 받아보세요.",
    newsletterPlaceholder: "이메일",
    send: "보내기",
    footerStoreLocation: "스토어 위치",
    footerText: "차분한 데일리 스타일링을 위한 액세서리 온라인 스토어. 회원 포인트, 신상품, 선물용 주얼리.",
    detailStone: "스톤",
    detailMaterial: "소재",
    detailStyle: "스타일",
    detailShipping: "배송",
    detailShippingText: "영업일 기준 2-4일 내 발송",
    reviewKicker: "리뷰",
    rating: "평점",
    comment: "댓글",
    commentPlaceholder: "스타일링 메모를 남겨주세요...",
    postComment: "댓글 작성",
    saveFavorite: "즐겨찾기 저장",
    savedFavorite: "저장됨",
    share: "공유",
    metaNecklaceSilver: "목걸이 / 실버",
    metaBraceletStone: "팔찌 / 천연석",
    metaEarringsCrystal: "귀걸이 / 크리스털",
    metaEarringsPearl: "귀걸이 / 담수진주",
    metaBraceletMix: "팔찌 / 스톤 믹스",
    metaBraceletCrystal: "팔찌 / 화이트 크리스털",
    metaBraceletColor: "팔찌 / 데일리 컬러",
    metaBraceletAccent: "팔찌 / 컬러 포인트",
    metaBraceletPearl: "팔찌 / 진주",
    metaBraceletBlue: "팔찌 / 블루 스톤",
    metaBraceletWarm: "팔찌 / 웜 스톤",
    metaBraceletSilver: "팔찌 / 파인 실버",
    copied: "복사됨",
    noComments: "아직 댓글이 없습니다. 첫 스타일링 메모를 남겨보세요.",
    reviewPosted: "댓글이 게시되었습니다. 스타일링 메모를 공유해 주셔서 감사합니다.",
    cartNeedItem: "결제 전에 상품을 추가해주세요.",
    orderReceived: "주문이 접수되었습니다. 확인 이메일을 보내드리겠습니다.",
    newsletterThanks: "감사합니다. EVRIS 뉴스 구독이 완료되었습니다.",
    resetNeedEmail: "먼저 이메일을 입력한 뒤 비밀번호 찾기를 눌러주세요.",
    resetNeedsConnection: "비밀번호 재설정에는 Supabase 연결이 필요합니다.",
    resetSent: "{email}로 비밀번호 재설정 이메일을 보냈습니다. 받은 편지함을 확인해주세요.",
    loggedOut: "로그아웃되었습니다.",
  },
};

Object.entries(extraUiText).forEach(([language, entries]) => {
  Object.assign(uiText[language], entries);
});

let currentMarket = localStorage.getItem("evrisMarket") || "CN";
let currentLanguage = localStorage.getItem("evrisLanguage") || "en";

function getSupabaseErrorMessage(error) {
  if (error?.message === "Invalid login credentials") {
    return "Login failed: this email is not registered yet, the password is incorrect, or the account email has not been confirmed. Please try Create account or Forgot password.";
  }

  if (error?.message?.toLowerCase().includes("email not confirmed")) {
    return "Please confirm your email first. Check the confirmation email from Supabase.";
  }

  return error?.message || "Supabase connection failed. Please check the database setup.";
}

function setMemberFromUser(user, extra = {}) {
  const savedAddress = localStorage.getItem(`evrisShippingAddress:${user.email}`) || "";
  member = {
    id: user.id,
    email: user.email,
    createdAt: user.created_at || new Date().toISOString(),
    birthday: extra.birthday || user.user_metadata?.birthday_month || "",
    shippingAddress: extra.shippingAddress || savedAddress,
  };
  saveMember();
}

async function saveProfileToSupabase(user, email, birthday) {
  if (!supabaseClient || !user?.id) return null;

  const { error } = await supabaseClient.from("profiles").upsert({
    id: user.id,
    email,
    birthday_month: birthday || null,
    shipping_address: member?.shippingAddress || null,
    rank: "Silver",
    points: 0,
  });

  if (error) {
    console.warn("Profile sync skipped:", error.message);
  }

  return error;
}

function getStoneMeaning(title, meta) {
  const text = `${title} ${meta}`.toLowerCase();
  if (text.includes("citrine")) return "Citrine: positive clarity, brightness, and casual confidence.";
  if (text.includes("lapis") || text.includes("blue")) return "Lapis: quiet focus, deep color, and subtle individuality.";
  if (text.includes("tiger")) return "Tiger eye: natural strength, warm depth, and grounded styling.";
  if (text.includes("pearl")) return "Pearl: soft elegance, daily polish, and timeless femininity.";
  if (text.includes("crystal")) return "Crystal: clean light, transparent mood, and fresh layering.";
  return "Natural stone: selected for color, texture, and a personal daily mood.";
}

function getReviewText(title) {
  if (title.includes("Necklace")) return "4.8 / 5 - Loved for easy layering with shirts and knits.";
  if (title.includes("Earrings")) return "4.7 / 5 - Light to wear and quietly eye-catching.";
  return "4.9 / 5 - Popular for daily styling and gift orders.";
}

function formatStars(rating) {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, 5 - rating);
}

function updateRatingControl() {
  const rating = Number(ratingInput.value);
  const percent = (rating / 5) * 100;
  starSlider.style.setProperty("--rating-percent", `${percent}%`);
  ratingValue.textContent = `${rating}.0`;
}

function saveLocalReviews() {
  localStorage.setItem("evrisReviews", JSON.stringify(localReviews));
}

function renderReviews(productId, reviews = []) {
  reviewList.innerHTML = "";

  if (reviews.length === 0) {
    reviewList.innerHTML = `<p>${t("noComments")}</p>`;
    return;
  }

  reviews.forEach((review) => {
    const article = document.createElement("article");
    article.className = "review-item";
    article.innerHTML = `
      <span>${formatStars(Number(review.rating))}</span>
      <p>${review.comment}</p>
      <small>${review.user_email || "EVRIS member"}</small>
    `;
    reviewList.append(article);
  });
}

async function loadReviews(productId) {
  reviewMessage.textContent = "";
  const fallbackReviews = localReviews[productId] || [];

  if (!supabaseClient) {
    renderReviews(productId, fallbackReviews);
    return;
  }

  const { data, error } = await supabaseClient
    .from("reviews")
    .select("rating, comment, user_email, created_at")
    .eq("product_slug", productId)
    .order("created_at", { ascending: false });

  if (error) {
    renderReviews(productId, fallbackReviews);
    reviewMessage.textContent = getSupabaseErrorMessage(error);
    return;
  }

  renderReviews(productId, data || []);
}

function saveFavorites() {
  localStorage.setItem("evrisFavorites", JSON.stringify(favorites));
}

function updateFavoriteCount() {
  favoriteCount.textContent = formatTemplate("favoriteCount", {
    count: favorites.length,
    plural: favorites.length === 1 ? "" : "s",
  });
}

async function saveFavoriteToSupabase(product) {
  if (!supabaseClient || !member?.id) return;

  await supabaseClient.from("favorites").upsert(
    {
      user_id: member.id,
      product_slug: product.id,
      product_name: product.title,
      image_url: product.image,
    },
    { onConflict: "user_id,product_slug" },
  );
}

function toggleFavorite(product) {
  const exists = favorites.some((item) => item.id === product.id);
  favorites = exists ? favorites.filter((item) => item.id !== product.id) : [...favorites, product];
  saveFavorites();
  updateFavoriteCount();
  saveFavoriteToSupabase(product);
  return !exists;
}

function parsePrice(priceText) {
  return Number(priceText.replace(/[^\d]/g, ""));
}

function formatPrice(amount) {
  const market = marketSettings[currentMarket] || marketSettings.CN;
  const converted = amount * market.rate;
  const decimals = market.decimals ?? 2;

  if (market.prefix) {
    return `${market.prefix} ${new Intl.NumberFormat(market.locale, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(converted)}`;
  }

  return new Intl.NumberFormat(market.locale, {
    style: "currency",
    currency: market.currency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(converted);
}

function t(key) {
  return (uiText[currentLanguage] || uiText.en)[key] || uiText.en[key] || key;
}

function formatTemplate(key, values = {}) {
  return t(key).replace(/\{(\w+)\}/g, (_match, token) => values[token] ?? "");
}

function updateStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
}

function updatePriceFilterLabels() {
  const priceLabels = {
    all: t("priceAll"),
    entry: formatTemplate("priceEntry", { amount: formatPrice(300) }),
    standard: formatTemplate("priceStandard", { from: formatPrice(300), to: formatPrice(500) }),
    premium: formatTemplate("pricePremium", { amount: formatPrice(500) }),
  };

  priceFilter.querySelectorAll("option").forEach((option) => {
    option.textContent = priceLabels[option.value] || option.textContent;
  });
}

function updateProductResultCount(count) {
  productResultCount.textContent = formatTemplate("itemCount", {
    count,
    plural: count === 1 ? "" : "s",
  });
}

function getBasePriceFromElement(element) {
  if (!element.dataset.basePrice) {
    element.dataset.basePrice = String(parsePrice(element.textContent));
  }
  return Number(element.dataset.basePrice);
}

function initializeBasePrices() {
  document.querySelectorAll(".product-info span").forEach(getBasePriceFromElement);
  document.querySelectorAll(".buy-row strong").forEach(getBasePriceFromElement);
}

function updateDisplayedPrices() {
  document.querySelectorAll(".product-info span").forEach((priceElement) => {
    priceElement.textContent = formatPrice(getBasePriceFromElement(priceElement));
  });

  document.querySelectorAll(".buy-row strong").forEach((priceElement) => {
    priceElement.textContent = formatPrice(getBasePriceFromElement(priceElement));
  });

  if (activeProduct) {
    modalPrice.textContent = formatPrice(activeProduct.priceValue);
  }

  renderCart();
  applyProductFilters();
}

function getProductFromCard(card) {
  const title = card.querySelector(".product-info p").textContent.trim();
  const meta = card.querySelector(".product-info small").textContent.trim();
  const priceElement = card.querySelector(".product-info span");
  const priceValue = getBasePriceFromElement(priceElement);
  const image = card.querySelector("img");

  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title,
    meta,
    price: formatPrice(priceValue),
    priceValue,
    image: image.src,
    imageAlt: image.alt,
  };
}

function getFeatureProduct() {
  return {
    id: "aqua-pearl-bracelet",
    title: "Aqua Pearl Bracelet",
    meta: "Bracelet / Natural stone",
    price: formatPrice(538),
    priceValue: 538,
    image: new URL("assets/products/clean/aqua-pearl-bracelet.jpg", window.location.href).href,
    imageAlt: "Aqua stone and pearl bracelet",
  };
}

function saveCart() {
  localStorage.setItem("evrisCart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = count;
}

function updateLocaleText() {
  const freeShippingAmount = formatPrice(599);
  document.documentElement.lang = currentLanguage;
  updateStaticTranslations();
  updatePriceFilterLabels();
  topMessage.textContent = formatTemplate("freeShipping", { amount: freeShippingAmount });
  document.querySelector("[data-i18n='stripShipping']").textContent = formatTemplate("stripShipping", {
    amount: freeShippingAmount,
  });
  shippingNote.textContent = formatTemplate("shippingNote", { amount: freeShippingAmount });
  productSearch.placeholder = t("searchPlaceholder");
  document.querySelector("#newsletterForm input").placeholder = t("newsletterPlaceholder");
  reviewForm.querySelector("textarea").placeholder = t("commentPlaceholder");
  memberAddress.placeholder = t("packageAddressPlaceholder");
  forgotPasswordButton.textContent = t("forgotPassword");

  document.querySelectorAll(".hero-actions .button.primary").forEach((button) => {
    button.textContent = t("viewMore");
  });

  document.querySelectorAll("[data-open-account]").forEach((button) => {
    if (button.id !== "accountButton") {
      const text = button.textContent.trim().toLowerCase();
      if (text.includes("join") || text.includes("会員") || text.includes("會員") || text.includes("회원")) {
        button.textContent = t("joinMember");
      }
    }
  });

  document.querySelectorAll(".hover-label").forEach((label) => {
    label.textContent = t("quickView");
  });

  document.querySelectorAll(".product-card .cart-button").forEach((button) => {
    if (button.textContent.trim().toLowerCase() !== t("added").toLowerCase()) {
      button.textContent = t("addToCart");
    }
  });

  if (!member) {
    accountButton.textContent = t("accountLogin");
  }

  if (activeProduct) {
    modalFavorite.textContent = favorites.some((item) => item.id === activeProduct.id) ? t("savedFavorite") : t("saveFavorite");
  }

  document.querySelector('[data-open-cart]').firstChild.textContent = `${t("cart")} `;
  setAccountMode(accountMode, { keepMessage: true });
  updateFavoriteCount();
}

function applyMemberAddressToCheckout() {
  const checkoutAddress = checkoutForm.querySelector('textarea[name="address"]');
  if (member?.shippingAddress && !checkoutAddress.value.trim()) {
    checkoutAddress.value = member.shippingAddress;
  }
}

async function saveMemberAddress(address) {
  if (!member) return;

  member.shippingAddress = address;
  saveMember();
  localStorage.setItem(`evrisShippingAddress:${member.email}`, address);

  if (supabaseClient && member.id) {
    const { error } = await supabaseClient
      .from("profiles")
      .update({ shipping_address: address })
      .eq("id", member.id);

    if (error) {
      console.warn("Address sync skipped:", error.message);
    }
  }
}

function applyLocaleSettings() {
  localStorage.setItem("evrisMarket", currentMarket);
  localStorage.setItem("evrisLanguage", currentLanguage);
  marketSelect.value = currentMarket;
  languageSelect.value = currentLanguage;
  updateLocaleText();
  updateDisplayedPrices();
}

function saveMember() {
  if (member) {
    localStorage.setItem("evrisMember", JSON.stringify(member));
  } else {
    localStorage.removeItem("evrisMember");
  }
}

function updateMemberUi() {
  const isLoggedIn = Boolean(member);
  accountButton.textContent = isLoggedIn ? t("accountMyPage") : t("accountLogin");
  memberSummary.hidden = !isLoggedIn;
  accountForm.hidden = isLoggedIn;
  document.querySelector(".account-tabs").hidden = isLoggedIn;

  if (isLoggedIn) {
    accountTitle.textContent = t("accountTitleMember");
    memberEmail.textContent = member.email;
    memberAddress.value = member.shippingAddress || localStorage.getItem(`evrisShippingAddress:${member.email}`) || "";
    if (member.stylePreference) {
      stylePreference.value = member.stylePreference;
    }
    updateFavoriteCount();
    accountMessage.textContent = t("memberMessage");
  } else {
    accountForm.hidden = false;
    document.querySelector(".account-tabs").hidden = false;
    if (!accountModal.classList.contains("is-open")) {
      accountMessage.textContent = "";
    }
  }
}

function renderCart() {
  cartItems.innerHTML = "";
  updateCartCount();

  if (cart.length === 0) {
    cartEmpty.classList.add("is-visible");
    cartSubtotal.textContent = formatPrice(0);
    checkoutForm.hidden = true;
    return;
  }

  cartEmpty.classList.remove("is-visible");
  checkoutForm.hidden = false;

  cart.forEach((item) => {
    const cartItem = document.createElement("article");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.imageAlt}" />
      <div>
        <h3>${item.title}</h3>
        <small>${item.meta}</small>
        <p>${formatPrice(item.priceValue * item.quantity)}</p>
        <div class="cart-item-actions">
          <button class="qty-button" type="button" data-cart-minus="${item.id}" aria-label="Decrease ${item.title} quantity">-</button>
          <span>${item.quantity}</span>
          <button class="qty-button" type="button" data-cart-plus="${item.id}" aria-label="Increase ${item.title} quantity">+</button>
          <button class="remove-button" type="button" data-cart-remove="${item.id}">${t("remove")}</button>
        </div>
      </div>
    `;
    cartItems.append(cartItem);
  });

  const subtotal = cart.reduce((total, item) => total + item.priceValue * item.quantity, 0);
  cartSubtotal.textContent = formatPrice(subtotal);
}

function addToCart(product) {
  checkoutMessage.textContent = "";
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function changeCartQuantity(productId, change) {
  cart = cart
    .map((item) => (item.id === productId ? { ...item, quantity: item.quantity + change } : item))
    .filter((item) => item.quantity > 0);
  saveCart();
  renderCart();
}

function openCartDrawer() {
  lastFocusedElement = document.activeElement;
  renderCart();
  applyMemberAddressToCheckout();
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  cartDrawer.querySelector("[data-close-cart]").focus();
}

function closeCartDrawer() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function openProductModal(card) {
  const product = getProductFromCard(card);
  const details = productDetails[product.title] || {
    description: "A selected EVRIS accessory for calm daily styling and easy gifting.",
    material: product.meta,
    style: "Match with your favorite daily basics.",
  };

  activeProduct = product;
  lastFocusedElement = document.activeElement;
  modalImage.src = product.image;
  modalImage.alt = product.imageAlt;
  modalMeta.textContent = product.meta;
  modalTitle.textContent = product.title;
  modalPrice.textContent = product.price;
  modalDescription.textContent = details.description;
  modalStone.textContent = details.stone || getStoneMeaning(product.title, product.meta);
  modalMaterial.textContent = details.material;
  modalStyle.textContent = details.style;
  modalReview.textContent = details.review || getReviewText(product.title);
  modalFavorite.textContent = favorites.some((item) => item.id === product.id) ? t("savedFavorite") : t("saveFavorite");
  reviewForm.reset();
  updateRatingControl();
  loadReviews(product.id);

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose.focus();
}

function closeProductModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

document.querySelectorAll(".product-card a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openProductModal(link.closest(".product-card"));
  });
});

document.querySelectorAll(".product-card .cart-button").forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(getProductFromCard(button.closest(".product-card")));
    button.textContent = t("added");
    window.setTimeout(() => {
      button.textContent = t("addToCart");
    }, 900);
  });
});

document.querySelector(".feature-card .mini-button").addEventListener("click", (event) => {
  event.preventDefault();
  addToCart(getFeatureProduct());
  openCartDrawer();
});

modalCart.addEventListener("click", () => {
  if (!activeProduct) return;
  addToCart(activeProduct);
  modalCart.textContent = t("added");
  window.setTimeout(() => {
    modalCart.textContent = t("addToCart");
  }, 1200);
});

modalFavorite.addEventListener("click", () => {
  if (!activeProduct) return;
  modalFavorite.textContent = toggleFavorite(activeProduct) ? t("savedFavorite") : t("saveFavorite");
});

modalShare.addEventListener("click", async () => {
  if (!activeProduct) return;
  const shareText = `${activeProduct.title} - EVRIS`;
  const shareUrl = window.location.href.split("#")[0] + "#shop";

  if (navigator.share) {
    await navigator.share({ title: shareText, text: shareText, url: shareUrl });
  } else {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    modalShare.textContent = t("copied");
    window.setTimeout(() => {
      modalShare.textContent = t("share");
    }, 1000);
  }
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeProduct) return;

  const formData = new FormData(reviewForm);
  const review = {
    product_slug: activeProduct.id,
    user_email: member?.email || "guest",
    rating: Number(formData.get("rating")),
    comment: formData.get("comment").trim(),
  };

  if (supabaseClient) {
    const { error } = await supabaseClient.from("reviews").insert(review);
    if (error) {
      reviewMessage.textContent = getSupabaseErrorMessage(error);
      return;
    }
  } else {
    localReviews[activeProduct.id] = [review, ...(localReviews[activeProduct.id] || [])];
    saveLocalReviews();
  }

  reviewMessage.textContent = t("reviewPosted");
  reviewForm.reset();
  loadReviews(activeProduct.id);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeProductModal);
});

document.querySelectorAll("[data-open-cart]").forEach((button) => {
  button.addEventListener("click", openCartDrawer);
});

document.querySelectorAll("[data-close-cart]").forEach((button) => {
  button.addEventListener("click", closeCartDrawer);
});

cartItems.addEventListener("click", (event) => {
  const plusId = event.target.dataset.cartPlus;
  const minusId = event.target.dataset.cartMinus;
  const removeId = event.target.dataset.cartRemove;

  if (plusId) changeCartQuantity(plusId, 1);
  if (minusId) changeCartQuantity(minusId, -1);
  if (removeId) {
    cart = cart.filter((item) => item.id !== removeId);
    saveCart();
    renderCart();
  }
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  checkoutMessage.textContent = "";

  if (cart.length === 0) {
    checkoutMessage.textContent = t("cartNeedItem");
    return;
  }

  submitOrder(new FormData(checkoutForm));
});

async function submitOrder(formData) {
  const subtotal = cart.reduce((total, item) => total + item.priceValue * item.quantity, 0);

  if (supabaseClient) {
    try {
      const orderId = crypto.randomUUID();
      const { error: orderError } = await supabaseClient.from("orders").insert({
        id: orderId,
        user_id: member?.id || null,
        customer_name: formData.get("name"),
        customer_email: formData.get("email"),
        shipping_address: formData.get("address"),
        gift_option: formData.get("giftOption"),
        subtotal,
        status: "received",
      });

      if (orderError) throw orderError;

      const { error: itemError } = await supabaseClient.from("order_items").insert(
        cart.map((item) => ({
          order_id: orderId,
          product_slug: item.id,
          product_name: item.title,
          unit_price: item.priceValue,
          quantity: item.quantity,
          image_url: item.image,
        })),
      );

      if (itemError) throw itemError;
    } catch (error) {
      checkoutMessage.textContent = getSupabaseErrorMessage(error);
      return;
    }
  }

  checkoutMessage.textContent = t("orderReceived");
  checkoutForm.reset();
  cart = [];
  saveCart();
  renderCart();
}

function openAccountModal(mode = "login") {
  lastFocusedElement = document.activeElement;
  if (!member) {
    setAccountMode(mode);
  }
  updateMemberUi();
  accountModal.classList.add("is-open");
  accountModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  const focusTarget = member ? logoutButton : accountModal.querySelector("input");
  focusTarget.focus();
}

function closeAccountModal() {
  accountModal.classList.remove("is-open");
  accountModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function setAccountMode(mode, options = {}) {
  if (member) return;
  accountMode = mode;
  const isCreate = accountMode === "create";
  accountTitle.textContent = isCreate ? t("accountTitleCreate") : t("accountTitleLogin");
  accountSubmit.textContent = isCreate ? t("accountCreate") : t("accountLogin");
  accountForm.classList.toggle("is-create", isCreate);
  forgotPasswordButton.hidden = isCreate;
  if (!options.keepMessage) {
    accountMessage.textContent = "";
  }
  document.querySelectorAll("[data-account-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.accountMode === accountMode);
  });
}

document.querySelectorAll("[data-open-account]").forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.accountOpenMode || (button.textContent.toLowerCase().includes("create") ? "create" : "login");
    openAccountModal(mode);
  });
});

document.querySelectorAll("[data-close-account]").forEach((button) => {
  button.addEventListener("click", closeAccountModal);
});

document.querySelectorAll("[data-account-mode]").forEach((button) => {
  button.addEventListener("click", () => setAccountMode(button.dataset.accountMode));
});

accountForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(accountForm);
  const email = formData.get("email");
  const password = formData.get("password");
  const birthday = formData.get("birthday") || "";

  if (supabaseClient) {
    try {
      const result =
        accountMode === "create"
          ? await supabaseClient.auth.signUp({
              email,
              password,
              options: { data: { birthday_month: birthday } },
            })
          : await supabaseClient.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;
      if (result.data.user) {
        setMemberFromUser(result.data.user, { birthday });
        await saveProfileToSupabase(result.data.user, email, birthday);
      }
    } catch (error) {
      accountMessage.textContent = getSupabaseErrorMessage(error);
      return;
    }
  } else {
    member = {
      email,
      createdAt: new Date().toISOString(),
      birthday,
    };
    saveMember();
  }

  updateMemberUi();
  accountMessage.textContent =
    accountMode === "create" ? `Welcome to EVRIS Member, ${email}. Your account is ready.` : `Welcome back, ${email}.`;
  accountForm.reset();
});

forgotPasswordButton.addEventListener("click", async () => {
  const emailInput = accountForm.querySelector('input[name="email"]');
  const email = emailInput.value.trim();

  if (!email) {
    accountMessage.textContent = t("resetNeedEmail");
    emailInput.focus();
    return;
  }

  if (!supabaseClient) {
    accountMessage.textContent = t("resetNeedsConnection");
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}?reset=password`,
  });

  if (error) {
    accountMessage.textContent = getSupabaseErrorMessage(error);
    return;
  }

  accountMessage.textContent = formatTemplate("resetSent", { email });
});

logoutButton.addEventListener("click", async () => {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  member = null;
  saveMember();
  setAccountMode("login");
  updateMemberUi();
  accountMessage.textContent = t("loggedOut");
  accountForm.querySelector("input").focus();
});

newsletterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = newsletterForm.querySelector("input").value.trim();

  if (supabaseClient) {
    const { error } = await supabaseClient.from("newsletter_subscribers").upsert({ email }, { onConflict: "email" });

    if (error) {
      newsletterMessage.textContent = getSupabaseErrorMessage(error);
      return;
    }
  }

  newsletterMessage.textContent = t("newsletterThanks");
  newsletterForm.reset();
});

document.querySelectorAll(".filters button").forEach((button) => {
  button.addEventListener("click", () => {
    currentCategory = button.dataset.filter || "all";
    document.querySelectorAll(".filters button").forEach((filter) => {
      filter.classList.toggle("is-active", filter === button);
    });
    applyProductFilters();
  });
});

function applyProductFilters() {
  const query = productSearch.value.trim().toLowerCase();
  const priceMode = priceFilter.value;
  let visibleCount = 0;

  document.querySelectorAll(".product-card").forEach((card) => {
    const title = card.querySelector(".product-info p").textContent.toLowerCase();
    const meta = card.querySelector(".product-info small").textContent.toLowerCase();
    const price = getBasePriceFromElement(card.querySelector(".product-info span"));
    const category = card.dataset.category || "";
    const categoryOk = currentCategory === "all" || category === currentCategory.slice(0, -1);
    const queryOk = !query || title.includes(query) || meta.includes(query);
    const priceOk =
      priceMode === "all" ||
      (priceMode === "entry" && price < 300) ||
      (priceMode === "standard" && price >= 300 && price <= 500) ||
      (priceMode === "premium" && price > 500);

    card.hidden = !(categoryOk && queryOk && priceOk);
    if (!card.hidden) visibleCount += 1;
  });

  updateProductResultCount(visibleCount);
}

productSearch.addEventListener("input", applyProductFilters);
priceFilter.addEventListener("change", applyProductFilters);

marketSelect.addEventListener("change", () => {
  currentMarket = marketSelect.value;
  applyLocaleSettings();
});

languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  applyLocaleSettings();
  updateMemberUi();
});

ratingInput.addEventListener("input", updateRatingControl);

stylePreference.addEventListener("change", () => {
  if (!member) return;
  member.stylePreference = stylePreference.value;
  saveMember();
});

memberAddressForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const address = memberAddress.value.trim();

  if (!address) {
    memberAddressMessage.textContent = t("addressEmpty");
    memberAddress.focus();
    return;
  }

  await saveMemberAddress(address);
  applyMemberAddressToCheckout();
  memberAddressMessage.textContent = t("addressSaved");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeProductModal();
  }
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) {
    closeCartDrawer();
  }
  if (event.key === "Escape" && accountModal.classList.contains("is-open")) {
    closeAccountModal();
  }
});

initializeBasePrices();
updateRatingControl();
applyLocaleSettings();
updateMemberUi();
updateFavoriteCount();

async function initSupabaseSession() {
  if (!supabaseClient) return;

  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) {
    setMemberFromUser(data.session.user);
  } else {
    member = null;
    saveMember();
    setAccountMode("login");
    updateMemberUi();
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setMemberFromUser(session.user);
    } else {
      member = null;
      saveMember();
    }
    updateMemberUi();
  });
}

initSupabaseSession();
