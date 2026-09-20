(() => {
  const accountButton = document.querySelector("[data-open-account]");
  if (!accountButton) return;
  const authClient = window.EvrisBackend;

  const copy = {
    en: {
      login: "Login",
      create: "Create account",
      myPage: "My page",
      close: "Close",
      signIn: "Sign in",
      join: "Create account",
      loggedInAs: "Logged in as",
      rank: "Current rank: {rank} / Points: {points} pt",
      favoriteMood: "Favorite mood",
      savedFavorites: "Saved favorites",
      favoriteCount: "{count} items",
      address: "Package address",
      addressPlaceholder: "Add your package delivery address",
      addressHint: "This address will be used automatically at checkout.",
      saveAddress: "Save address",
      addressSaved: "Address saved.",
      addressEmpty: "Please enter a delivery address.",
      logout: "Logout",
      email: "Email",
      password: "Password",
      birthday: "Birthday month",
      selectMonth: "Select month",
      forgot: "Forgot password?",
      memberMessage: "You can manage your saved details and favorites here.",
      welcome: "Welcome back, {email}.",
      created: "Your account is ready, {email}.",
      confirmEmail: "Your account has been created. A verification email has been sent to {email}. Open your inbox (Gmail if you use Gmail) and click the verification link before signing in. If you cannot find it, check your Spam or Junk folder.",
      resetNeedEmail: "Enter your email address first.",
      resetSent: "A password reset link was sent to {email}.",
      unavailable: "Account service is unavailable. Please try again shortly.",
      loggedOut: "You have logged out.",
      genericError: "We could not complete that request. Please try again.",
    },
    zh: {
      login: "登入",
      create: "註冊",
      myPage: "會員中心",
      close: "關閉",
      signIn: "登入",
      join: "建立帳戶",
      loggedInAs: "目前登入帳戶",
      rank: "目前等級：{rank} / 積分：{points} pt",
      favoriteMood: "喜愛風格",
      savedFavorites: "已收藏商品",
      favoriteCount: "{count} 件",
      address: "收貨地址",
      addressPlaceholder: "輸入包裹收貨地址",
      addressHint: "結帳時會自動使用此地址。",
      saveAddress: "儲存地址",
      addressSaved: "地址已儲存。",
      addressEmpty: "請輸入收貨地址。",
      logout: "登出",
      email: "電子郵件",
      password: "密碼",
      birthday: "生日月份",
      selectMonth: "選擇月份",
      forgot: "忘記密碼？",
      memberMessage: "你可以在此管理會員資料與收藏商品。",
      welcome: "歡迎回來，{email}。",
      created: "帳戶已建立，{email}。",
      confirmEmail: "帳戶已建立，驗證電郵已寄送至 {email}。請前往你的電郵信箱（如 Gmail），開啟驗證郵件並按下連結，完成驗證後再登入。如果收件匣找不到，請檢查「垃圾郵件」資料夾。",
      resetNeedEmail: "請先輸入電子郵件。",
      resetSent: "密碼重設連結已寄送至 {email}。",
      unavailable: "會員服務暫時無法使用，請稍後再試。",
      loggedOut: "你已登出。",
      genericError: "目前無法完成操作，請再試一次。",
    },
    ja: {
      login: "ログイン",
      create: "新規登録",
      myPage: "マイページ",
      close: "閉じる",
      signIn: "ログイン",
      join: "新規登録",
      loggedInAs: "ログイン中",
      rank: "現在のランク：{rank} / ポイント：{points} pt",
      favoriteMood: "お気に入りムード",
      savedFavorites: "お気に入り",
      favoriteCount: "{count} 点",
      address: "お届け先住所",
      addressPlaceholder: "お届け先住所を入力",
      addressHint: "チェックアウト時にこの住所を使用します。",
      saveAddress: "住所を保存",
      addressSaved: "住所を保存しました。",
      addressEmpty: "お届け先住所を入力してください。",
      logout: "ログアウト",
      email: "メール",
      password: "パスワード",
      birthday: "誕生月",
      selectMonth: "月を選択",
      forgot: "パスワードを忘れた方",
      memberMessage: "会員情報とお気に入りをここで確認できます。",
      welcome: "おかえりなさい、{email}。",
      created: "アカウントを作成しました：{email}",
      confirmEmail: "アカウントを作成し、{email} に確認メールを送信しました。Gmail などの受信箱を開き、メール内のリンクで認証してからログインしてください。見つからない場合は迷惑メールフォルダもご確認ください。",
      resetNeedEmail: "先にメールアドレスを入力してください。",
      resetSent: "{email} にパスワード再設定リンクを送信しました。",
      unavailable: "会員サービスに接続できません。しばらくしてからお試しください。",
      loggedOut: "ログアウトしました。",
      genericError: "処理を完了できませんでした。もう一度お試しください。",
    },
    ko: {
      login: "로그인",
      create: "회원가입",
      myPage: "마이페이지",
      close: "닫기",
      signIn: "로그인",
      join: "회원가입",
      loggedInAs: "로그인 계정",
      rank: "현재 등급: {rank} / 포인트: {points} pt",
      favoriteMood: "선호 무드",
      savedFavorites: "저장한 상품",
      favoriteCount: "{count}개",
      address: "배송 주소",
      addressPlaceholder: "배송 주소 입력",
      addressHint: "결제 시 이 주소를 자동으로 사용합니다.",
      saveAddress: "주소 저장",
      addressSaved: "주소를 저장했습니다.",
      addressEmpty: "배송 주소를 입력해 주세요.",
      logout: "로그아웃",
      email: "이메일",
      password: "비밀번호",
      birthday: "생일 월",
      selectMonth: "월 선택",
      forgot: "비밀번호를 잊으셨나요?",
      memberMessage: "회원 정보와 저장한 상품을 여기에서 관리할 수 있습니다.",
      welcome: "다시 오신 것을 환영합니다, {email}.",
      created: "계정이 생성되었습니다: {email}",
      confirmEmail: "계정이 생성되었으며 {email}로 인증 이메일을 보냈습니다. Gmail 등 사용 중인 이메일의 받은편지함에서 인증 링크를 누른 후 로그인하세요. 메일이 보이지 않으면 스팸함도 확인해 주세요.",
      resetNeedEmail: "먼저 이메일을 입력해 주세요.",
      resetSent: "{email}로 비밀번호 재설정 링크를 보냈습니다.",
      unavailable: "회원 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      loggedOut: "로그아웃했습니다.",
      genericError: "요청을 완료할 수 없습니다. 다시 시도해 주세요.",
    },
  };

  const modal = document.createElement("div");
  modal.className = "account-modal";
  modal.id = "accountModal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <button class="modal-backdrop" type="button" data-close-account aria-label="Close account form"></button>
    <section class="account-panel" role="dialog" aria-modal="true" aria-labelledby="accountTitle">
      <button class="modal-close" type="button" data-close-account aria-label="Close account form">Close</button>
      <p class="kicker">EVRIS Member</p>
      <h2 id="accountTitle">Sign in</h2>
      <div class="member-summary" id="memberSummary" hidden>
        <p id="loggedInLabel">Logged in as</p>
        <strong id="memberEmail"></strong>
        <span id="memberRank"></span>
        <div class="member-preferences">
          <label>
            <span id="favoriteMoodLabel">Favorite mood</span>
            <select id="stylePreference">
              <option value="Minimal">Minimal</option>
              <option value="Natural stone">Natural stone</option>
              <option value="Pearl classic">Pearl classic</option>
              <option value="Gift styling">Gift styling</option>
            </select>
          </label>
          <div>
            <p id="savedFavoritesLabel">Saved favorites</p>
            <strong id="favoriteCount">0 items</strong>
          </div>
        </div>
        <form class="member-address-form" id="memberAddressForm">
          <label>
            <span id="addressLabel">Package address</span>
            <textarea id="memberAddress" name="shippingAddress" rows="4" autocomplete="shipping street-address"></textarea>
          </label>
          <button class="mini-button" type="submit" id="saveAddressButton">Save address</button>
          <small id="addressHint"></small>
          <p class="form-message" id="memberAddressMessage" role="status"></p>
        </form>
        <button class="mini-button" type="button" id="logoutButton">Logout</button>
      </div>
      <div class="account-tabs" role="tablist" aria-label="Account mode">
        <button class="is-active" type="button" data-account-mode="login" role="tab" aria-selected="true">Login</button>
        <button type="button" data-account-mode="create" role="tab" aria-selected="false">Create account</button>
      </div>
      <form class="account-form" id="accountForm">
        <label>
          <span id="emailLabel">Email</span>
          <input type="email" name="email" autocomplete="email" required />
        </label>
        <label>
          <span id="passwordLabel">Password</span>
          <input type="password" name="password" autocomplete="current-password" minlength="6" required />
        </label>
        <label class="create-only">
          <span id="birthdayLabel">Birthday month</span>
          <select name="birthday"></select>
        </label>
        <button class="cart-button" type="submit" id="accountSubmit">Login</button>
        <button class="forgot-password" type="button" id="forgotPasswordButton">Forgot password?</button>
        <p class="form-message" id="accountMessage" role="status"></p>
      </form>
    </section>
  `;
  document.body.append(modal);

  const accountForm = modal.querySelector("#accountForm");
  const accountTitle = modal.querySelector("#accountTitle");
  const accountSubmit = modal.querySelector("#accountSubmit");
  const accountMessage = modal.querySelector("#accountMessage");
  const memberSummary = modal.querySelector("#memberSummary");
  const memberEmail = modal.querySelector("#memberEmail");
  const memberRank = modal.querySelector("#memberRank");
  const memberAddressForm = modal.querySelector("#memberAddressForm");
  const memberAddress = modal.querySelector("#memberAddress");
  const memberAddressMessage = modal.querySelector("#memberAddressMessage");
  const stylePreference = modal.querySelector("#stylePreference");
  const favoriteCount = modal.querySelector("#favoriteCount");
  const forgotPasswordButton = modal.querySelector("#forgotPasswordButton");
  const logoutButton = modal.querySelector("#logoutButton");
  const birthdaySelect = accountForm.querySelector('[name="birthday"]');
  const passwordInput = accountForm.querySelector('[name="password"]');
  const authFeedback = window.EvrisAuthFeedback;
  authFeedback.setup(accountForm, accountMessage);
  let accountMode = "login";
  let member = null;
  let lastFocusedElement = null;

  function language() {
    const selected = localStorage.getItem("evrisLanguage") || "en";
    return copy[selected] ? selected : "en";
  }

  function text(key, values = {}) {
    return copy[language()][key].replace(/\{(\w+)\}/g, (_match, token) => values[token] ?? "");
  }

  function readLocalMember() {
    try {
      return JSON.parse(localStorage.getItem("evrisMember") || "null");
    } catch (_error) {
      return null;
    }
  }

  function saveMember() {
    if (member) localStorage.setItem("evrisMember", JSON.stringify(member));
    else localStorage.removeItem("evrisMember");
  }

  function getLocalFavoriteCount() {
    try {
      return JSON.parse(localStorage.getItem("evrisFavorites") || "[]").length;
    } catch (_error) {
      return 0;
    }
  }

  async function loadProfile(user) {
    if (!authClient || !user?.id) return null;
    const { data, error } = await authClient.getProfile(user.id);

    if (error) {
      console.warn("Profile load skipped:", error.message);
      return null;
    }
    return data;
  }

  async function createProfile(user, email, birthday) {
    if (!authClient || !user?.id) return null;
    const { error } = await authClient.saveProfile(user.id, {
      email,
      birthday_month: birthday || user.user_metadata?.birthday_month || null,
      rank: "Silver",
      points: 0,
    });
    if (error) console.warn("Profile sync skipped:", error.message);
    return loadProfile(user);
  }

  let sessionRevision = 0;
  function applySession(user) {
    const revision = ++sessionRevision;
    if (!user) {
      member = null;
      saveMember();
      updateMemberUi();
      return;
    }
    // Authentication controls the UI; optional Firestore data must not block it.
    setMemberFromUser(user);
    updateMemberUi();
    void (async () => {
      let profile = await loadProfile(user);
      if (revision !== sessionRevision) return;
      if (!profile) profile = await createProfile(user, user.email, user.user_metadata?.birthday_month);
      if (revision !== sessionRevision || member?.id !== user.id || !profile) return;
      setMemberFromUser(user, profile);
      updateMemberUi();
    })().catch(error => console.warn('Profile sync skipped:', error.code || error.name));
  }

  function setMemberFromUser(user, profile = null) {
    const cached = readLocalMember();
    const sameUserCache = cached?.id === user.id ? cached : null;
    const savedAddress = localStorage.getItem(`evrisShippingAddress:${user.email}`) || "";
    member = {
      id: user.id,
      email: user.email,
      createdAt: user.created_at || new Date().toISOString(),
      birthday: profile?.birthday_month || user.user_metadata?.birthday_month || "",
      shippingAddress: profile?.shipping_address || savedAddress,
      rank: profile?.rank || "Silver",
      points: profile?.points || 0,
      stylePreference: sameUserCache?.stylePreference || "Minimal",
    };
    saveMember();
  }

  function updateBirthdayOptions() {
    const value = birthdaySelect.value;
    const lang = language();
    const monthNames = lang === "en"
      ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      : Array.from({ length: 12 }, (_item, index) => lang === "ko" ? `${index + 1}월` : `${index + 1}月`);
    birthdaySelect.innerHTML = `<option value="">${text("selectMonth")}</option>${monthNames
      .map((name, index) => `<option value="${index + 1}">${name}</option>`)
      .join("")}`;
    birthdaySelect.value = value;
  }

  function updateCopy() {
    modal.querySelector(".modal-close").textContent = text("close");
    modal.querySelector(".modal-close").setAttribute("aria-label", text("close"));
    modal.querySelector(".modal-backdrop").setAttribute("aria-label", text("close"));
    modal.querySelector("#loggedInLabel").textContent = text("loggedInAs");
    modal.querySelector("#favoriteMoodLabel").textContent = text("favoriteMood");
    modal.querySelector("#savedFavoritesLabel").textContent = text("savedFavorites");
    modal.querySelector("#addressLabel").textContent = text("address");
    modal.querySelector("#saveAddressButton").textContent = text("saveAddress");
    modal.querySelector("#addressHint").textContent = text("addressHint");
    modal.querySelector("#emailLabel").textContent = text("email");
    modal.querySelector("#passwordLabel").textContent = text("password");
    modal.querySelector("#birthdayLabel").textContent = text("birthday");
    forgotPasswordButton.textContent = text("forgot");
    logoutButton.textContent = text("logout");
    memberAddress.placeholder = text("addressPlaceholder");
    updateBirthdayOptions();
    setAccountMode(accountMode, { keepMessage: true });
    updateMemberUi();
  }

  function updateMemberUi() {
    const isLoggedIn = Boolean(member);
    accountButton.textContent = isLoggedIn ? text("myPage") : text("login");
    memberSummary.hidden = !isLoggedIn;
    accountForm.hidden = isLoggedIn;
    modal.querySelector(".account-tabs").hidden = isLoggedIn;

    if (!isLoggedIn) return;
    accountTitle.textContent = text("myPage");
    memberEmail.textContent = member.email;
    memberRank.textContent = text("rank", { rank: member.rank, points: member.points });
    memberAddress.value = member.shippingAddress || "";
    stylePreference.value = member.stylePreference || "Minimal";
    favoriteCount.textContent = text("favoriteCount", { count: getLocalFavoriteCount() });
    accountMessage.textContent = text("memberMessage");
  }

  function setAccountMode(mode, options = {}) {
    accountForm.hidePassword?.();
    if (member) return;
    accountMode = mode;
    const isCreate = mode === "create";
    accountTitle.textContent = isCreate ? text("join") : text("signIn");
    accountSubmit.textContent = isCreate ? text("create") : text("login");
    accountForm.classList.toggle("is-create", isCreate);
    forgotPasswordButton.hidden = isCreate;
    passwordInput.autocomplete = isCreate ? "new-password" : "current-password";
    if (!options.keepMessage) accountMessage.textContent = "";
    modal.querySelectorAll("[data-account-mode]").forEach((button) => {
      const isActive = button.dataset.accountMode === mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.textContent = button.dataset.accountMode === "create" ? text("create") : text("login");
    });
  }

  function openAccountModal(mode = "login") {
    lastFocusedElement = document.activeElement;
    if (!member) setAccountMode(mode);
    updateCopy();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    (member ? logoutButton : accountForm.querySelector("input")).focus();
  }

  function closeAccountModal() {
    accountForm.hidePassword?.();
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    lastFocusedElement?.focus();
  }

  accountButton.addEventListener("click", () => openAccountModal("login"));
  modal.querySelectorAll("[data-close-account]").forEach((button) => button.addEventListener("click", closeAccountModal));
  modal.querySelectorAll("[data-account-mode]").forEach((button) => {
    button.addEventListener("click", () => setAccountMode(button.dataset.accountMode));
  });

  accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (accountSubmit.disabled || !authFeedback.validate(accountForm, accountMessage, accountMode)) return;
    if (!authClient) {
      authFeedback.show(accountMessage, "unavailable");
      return;
    }

    const formData = new FormData(accountForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const birthday = String(formData.get("birthday") || "");
    const mode = accountMode;
    accountSubmit.disabled = true;
    authFeedback.show(accountMessage, mode === "create" ? "creating" : "signingIn", false);

    try {
      const result = mode === "create"
        ? await authClient.auth.signUp({ email, password, options: { data: { birthday_month: birthday } } })
        : await authClient.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;

      if (mode === "create" && !result.data.session) {
        await authFeedback.confirmThenLogin(accountForm, accountMessage, email,
          () => setAccountMode("login", { keepMessage: true }),
          () => !member && accountMode === "create" && modal.classList.contains("is-open"));
        return;
      }

      if (!result.data.session || !result.data.user) throw new Error("Missing authenticated session");
      if (result.data.user) {
        applySession(result.data.user);
        accountForm.reset();
      }
    } catch (error) {
      authFeedback.error(accountMessage, error);
    } finally {
      accountSubmit.disabled = false;
    }
  });

  forgotPasswordButton.addEventListener("click", async () => {
    if (forgotPasswordButton.disabled || !authFeedback.validate(accountForm, accountMessage, accountMode, true)) return;
    const email = accountForm.querySelector('[name="email"]').value.trim();
    if (!authClient) {
      authFeedback.show(accountMessage, "unavailable");
      return;
    }
    forgotPasswordButton.disabled = true;
    try {
      const { error } = await authClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/index.html?reset=password`,
      });
      if (error) throw error;
      accountMessage.textContent = text("resetSent", { email });
    } catch (error) {
      authFeedback.error(accountMessage, error);
    } finally {
      forgotPasswordButton.disabled = false;
    }
  });

  logoutButton.addEventListener("click", async () => {
    if (authClient) await authClient.auth.signOut();
    member = null;
    saveMember();
    setAccountMode("login");
    updateMemberUi();
    accountMessage.textContent = text("loggedOut");
    accountForm.querySelector("input").focus();
  });

  memberAddressForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const address = memberAddress.value.trim();
    if (!address) {
      memberAddressMessage.textContent = text("addressEmpty");
      memberAddress.focus();
      return;
    }
    member.shippingAddress = address;
    saveMember();
    localStorage.setItem(`evrisShippingAddress:${member.email}`, address);
    if (authClient && member.id) {
      const { error } = await authClient.saveProfile(member.id, { shipping_address: address });
      if (error) {
        memberAddressMessage.textContent = error.message;
        return;
      }
    }
    memberAddressMessage.textContent = text("addressSaved");
  });

  stylePreference.addEventListener("change", () => {
    if (!member) return;
    member.stylePreference = stylePreference.value;
    saveMember();
  });

  document.querySelector("#languageSelect")?.addEventListener("change", updateCopy);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeAccountModal();
  });

  async function initializeSession() {
    updateCopy();
    if (!authClient) {
      member = null;
      saveMember();
      updateMemberUi();
      return;
    }

    const { data } = await authClient.auth.getSession();
    applySession(data.session?.user || null);
    authClient.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user || null);
    });
  }

  initializeSession();
})();
