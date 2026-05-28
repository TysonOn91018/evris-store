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
const newsletterForm = document.querySelector("#newsletterForm");
const newsletterMessage = document.querySelector("#newsletterMessage");
const productSearch = document.querySelector("#productSearch");
const priceFilter = document.querySelector("#priceFilter");
const productResultCount = document.querySelector("#productResultCount");
let lastFocusedElement = null;
let activeProduct = null;
let cart = JSON.parse(localStorage.getItem("evrisCart") || "[]");
let member = JSON.parse(localStorage.getItem("evrisMember") || "null");
let favorites = JSON.parse(localStorage.getItem("evrisFavorites") || "[]");
let localReviews = JSON.parse(localStorage.getItem("evrisReviews") || "{}");
let currentCategory = "all";
let accountMode = "login";

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
  member = {
    id: user.id,
    email: user.email,
    createdAt: user.created_at || new Date().toISOString(),
    birthday: extra.birthday || user.user_metadata?.birthday_month || "",
  };
  saveMember();
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

function saveLocalReviews() {
  localStorage.setItem("evrisReviews", JSON.stringify(localReviews));
}

function renderReviews(productId, reviews = []) {
  reviewList.innerHTML = "";

  if (reviews.length === 0) {
    reviewList.innerHTML = "<p>No comments yet. Be the first to share a styling note.</p>";
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
  favoriteCount.textContent = `${favorites.length} item${favorites.length === 1 ? "" : "s"}`;
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
  return `RMB ${amount}`;
}

function getProductFromCard(card) {
  const title = card.querySelector(".product-info p").textContent.trim();
  const meta = card.querySelector(".product-info small").textContent.trim();
  const price = card.querySelector(".product-info span").textContent.trim();
  const image = card.querySelector("img");

  return {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title,
    meta,
    price,
    priceValue: parsePrice(price),
    image: image.src,
    imageAlt: image.alt,
  };
}

function getFeatureProduct() {
  return {
    id: "aqua-pearl-bracelet",
    title: "Aqua Pearl Bracelet",
    meta: "Bracelet / Natural stone",
    price: "RMB 538",
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

function saveMember() {
  if (member) {
    localStorage.setItem("evrisMember", JSON.stringify(member));
  } else {
    localStorage.removeItem("evrisMember");
  }
}

function updateMemberUi() {
  const isLoggedIn = Boolean(member);
  accountButton.textContent = isLoggedIn ? "My page" : "Login";
  memberSummary.hidden = !isLoggedIn;
  accountForm.hidden = isLoggedIn;
  document.querySelector(".account-tabs").hidden = isLoggedIn;

  if (isLoggedIn) {
    accountTitle.textContent = "Member page";
    memberEmail.textContent = member.email;
    if (member.stylePreference) {
      stylePreference.value = member.stylePreference;
    }
    updateFavoriteCount();
    accountMessage.textContent = "You can track orders, save favorites, and use member points at checkout.";
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
    cartSubtotal.textContent = "RMB 0";
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
          <button class="remove-button" type="button" data-cart-remove="${item.id}">Remove</button>
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
  modalFavorite.textContent = favorites.some((item) => item.id === product.id) ? "Saved" : "Save favorite";
  reviewForm.reset();
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
    button.textContent = "Added";
    window.setTimeout(() => {
      button.textContent = "Add to cart";
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
  modalCart.textContent = "Added";
  window.setTimeout(() => {
    modalCart.textContent = "Add to cart";
  }, 1200);
});

modalFavorite.addEventListener("click", () => {
  if (!activeProduct) return;
  modalFavorite.textContent = toggleFavorite(activeProduct) ? "Saved" : "Save favorite";
});

modalShare.addEventListener("click", async () => {
  if (!activeProduct) return;
  const shareText = `${activeProduct.title} - EVRIS`;
  const shareUrl = window.location.href.split("#")[0] + "#shop";

  if (navigator.share) {
    await navigator.share({ title: shareText, text: shareText, url: shareUrl });
  } else {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    modalShare.textContent = "Copied";
    window.setTimeout(() => {
      modalShare.textContent = "Share";
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

  reviewMessage.textContent = "Comment posted. Thank you for sharing your styling note.";
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
    checkoutMessage.textContent = "Please add an item before checkout.";
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

  checkoutMessage.textContent = "Order received. We will email your confirmation shortly.";
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

function setAccountMode(mode) {
  if (member) return;
  accountMode = mode;
  const isCreate = accountMode === "create";
  accountTitle.textContent = isCreate ? "Create account" : "Sign in";
  accountSubmit.textContent = isCreate ? "Create account" : "Login";
  accountForm.classList.toggle("is-create", isCreate);
  forgotPasswordButton.hidden = isCreate;
  accountMessage.textContent = "";
  document.querySelectorAll("[data-account-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.accountMode === accountMode);
  });
}

document.querySelectorAll("[data-open-account]").forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.textContent.toLowerCase().includes("create") ? "create" : "login";
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
        await supabaseClient.from("profiles").upsert({
          id: result.data.user.id,
          email,
          birthday_month: birthday || null,
          rank: "Silver",
          points: 0,
        });
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
    accountMessage.textContent = "Please enter your email first, then click Forgot password.";
    emailInput.focus();
    return;
  }

  if (!supabaseClient) {
    accountMessage.textContent = "Password reset needs Supabase connection.";
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}?reset=password`,
  });

  if (error) {
    accountMessage.textContent = getSupabaseErrorMessage(error);
    return;
  }

  accountMessage.textContent = `Password reset email sent to ${email}. Please check your inbox.`;
});

logoutButton.addEventListener("click", async () => {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  member = null;
  saveMember();
  setAccountMode("login");
  updateMemberUi();
  accountMessage.textContent = "You have logged out.";
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

  newsletterMessage.textContent = "Thank you. You are subscribed to EVRIS news.";
  newsletterForm.reset();
});

document.querySelectorAll(".filters button").forEach((button) => {
  button.addEventListener("click", () => {
    currentCategory = button.textContent.trim().toLowerCase();
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
    const price = parsePrice(card.querySelector(".product-info span").textContent);
    const categoryOk = currentCategory === "all" || meta.includes(currentCategory.slice(0, -1));
    const queryOk = !query || title.includes(query) || meta.includes(query);
    const priceOk =
      priceMode === "all" ||
      (priceMode === "entry" && price < 300) ||
      (priceMode === "standard" && price >= 300 && price <= 500) ||
      (priceMode === "premium" && price > 500);

    card.hidden = !(categoryOk && queryOk && priceOk);
    if (!card.hidden) visibleCount += 1;
  });

  productResultCount.textContent = `${visibleCount} item${visibleCount === 1 ? "" : "s"}`;
}

productSearch.addEventListener("input", applyProductFilters);
priceFilter.addEventListener("change", applyProductFilters);

stylePreference.addEventListener("change", () => {
  if (!member) return;
  member.stylePreference = stylePreference.value;
  saveMember();
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

renderCart();
updateMemberUi();
updateFavoriteCount();
applyProductFilters();

async function initSupabaseSession() {
  if (!supabaseClient) return;

  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) {
    setMemberFromUser(data.session.user);
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
