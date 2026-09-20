/* Shared, user-facing authentication feedback for every store page. */
(() => {
  const messages = {
    showPassword: ['Show password', '顯示密碼', 'パスワードを表示', '비밀번호 표시'],
    hidePassword: ['Hide password', '隱藏密碼', 'パスワードを隠す', '비밀번호 숨기기'],
    signingIn: ['Signing in…', '正在登入…', 'ログイン中…', '로그인 중…'],
    creating: ['Creating your account and sending a verification email… Please wait.', '正在建立帳戶並寄出驗證電郵，請稍候…', 'アカウントを作成し、確認メールを送信しています。しばらくお待ちください…', '계정을 만들고 인증 이메일을 보내고 있습니다. 잠시 기다려 주세요…'],
    resend: ['Resend verification email', '重新寄出驗證電郵', '確認メールを再送信', '인증 이메일 다시 보내기'],
    verificationSent: ['If this account needs verification, a new verification email has been sent. Check your inbox and spam folder.', '如帳戶尚未驗證，新的驗證電郵已寄出。請檢查收件匣及垃圾郵件資料夾。', '未確認のアカウントには確認メールを再送しました。受信箱と迷惑メールをご確認ください。', '인증이 필요한 계정에 인증 이메일을 다시 보냈습니다. 받은편지함과 스팸함을 확인하세요.'],
    firebaseConfig: ['Firebase is not connected yet. The store needs to add its Firebase web configuration.', 'Firebase 尚未連接，商店需要先填寫 Firebase 網站設定。', 'Firebase は未接続です。店舗側で Firebase のウェブ設定が必要です。', 'Firebase가 아직 연결되지 않았습니다. 매장에서 웹 설정을 추가해야 합니다.'],
    permission: ['This operation is not permitted. Please sign in again. If it continues, contact the store to check its database permissions.', '未獲授權完成操作，請重新登入；如持續出現，請聯絡商店檢查資料庫權限。', '操作が許可されていません。再ログインし、解決しない場合は店舗にお問い合わせください。', '허용되지 않은 작업입니다. 다시 로그인하고 계속되면 매장에 문의하세요.'],
    loginRequired: ['Please sign in with a verified email account to continue.', '請先使用已驗證電郵的帳戶登入，再繼續操作。', '確認済みメールのアカウントでログインしてください。', '이메일 인증을 마친 계정으로 로그인하세요.'],
    checkoutUnavailable: ['Order processing is not connected yet. Your cart has been kept; no order was placed. Please contact the store.', '訂單服務尚未連接，購物車已保留，未有提交訂單。請聯絡商店。', '注文サービスは未接続です。注文は確定していません。カートは保持されています。', '주문 서비스가 아직 연결되지 않았습니다. 주문되지 않았으며 장바구니는 유지됩니다.'],
    stock: ['An item is unavailable or has insufficient stock. Please update your cart and try again.', '商品未能供應或庫存不足，請更新購物車後再試。', '在庫不足または販売終了の商品があります。カートを更新してください。', '상품을 구매할 수 없거나 재고가 부족합니다. 장바구니를 수정하세요.'],
    coupon: ['This coupon is invalid, already used, or does not match the items in your cart.', '優惠券無效、已使用，或不適用於購物車內商品。', 'クーポンが無効、使用済み、または対象商品がありません。', '쿠폰이 유효하지 않거나 이미 사용되었거나 적용 상품이 없습니다.'],
    emailRequired: ['Enter your email address.', '請輸入電子郵件地址。', 'メールアドレスを入力してください。', '이메일 주소를 입력해 주세요.'],
    emailInvalid: ['Email format is invalid. Use a complete address, e.g. name@example.com.', '電子郵件格式不正確，請輸入完整地址，例如 name@example.com。', 'メール形式が正しくありません。例：name@example.com', '이메일 형식이 올바르지 않습니다. 예: name@example.com'],
    passwordRequired: ['Enter your password.', '請輸入密碼。', 'パスワードを入力してください。', '비밀번호를 입력해 주세요.'],
    passwordShort: ['Your new password must contain at least 6 characters.', '新密碼最少需要 6 個字元。', '新しいパスワードは6文字以上で入力してください。', '새 비밀번호는 6자 이상이어야 합니다.'],
    network: ['Cannot connect to the sign-in server. Your email and password could not be checked. Check your internet connection and try again. If this continues, contact the store to check its sign-in service.', '無法連接登入伺服器，尚未能驗證你的電郵及密碼。請檢查網絡後重試；如持續出現，請聯絡商店檢查登入服務。', 'ログインサーバーに接続できず、メールとパスワードを確認できませんでした。通信環境を確認して再試行し、解決しない場合は店舗にお問い合わせください。', '로그인 서버에 연결할 수 없어 이메일과 비밀번호를 확인하지 못했습니다. 인터넷 연결을 확인하고 다시 시도하세요. 계속되면 매장에 문의하세요.'],
    unavailable: ['The sign-in component did not load. Refresh the page and try again. If this continues, contact the store.', '登入元件未能載入，請重新整理頁面後再試；如持續出現，請聯絡商店。', 'ログイン機能を読み込めませんでした。ページを更新し、解決しない場合は店舗にお問い合わせください。', '로그인 기능을 불러오지 못했습니다. 새로고침 후 다시 시도하고 계속되면 매장에 문의하세요.'],
    credentials: ['The email and password do not match. Check both fields or use “Forgot password?”. The server does not indicate which one is incorrect.', '電郵與密碼不相符。請核對兩個欄位，或使用「忘記密碼？」。伺服器未有指出是哪一項錯誤。', 'メールとパスワードが一致しません。両方を確認するか、パスワード再設定をご利用ください。サーバーはどちらが違うかを通知しません。', '이메일과 비밀번호가 일치하지 않습니다. 두 항목을 확인하거나 비밀번호 재설정을 이용하세요. 서버는 어느 항목이 틀렸는지 알려주지 않습니다.'],
    unconfirmed: ['Your email has not been verified. Open the verification link in your registration email, including your spam folder, then sign in again.', '電郵尚未驗證。請到收件匣或垃圾郵件資料夾開啟註冊確認信，按驗證連結後再登入。', 'メールが未確認です。受信箱や迷惑メール内の登録確認リンクを開いてからログインしてください。', '이메일 인증이 필요합니다. 받은편지함이나 스팸함의 가입 확인 링크를 연 후 로그인하세요.'],
    rate: ['Too many attempts. Wait a few minutes before trying again.', '嘗試次數過多，請等候幾分鐘後再試。', '試行回数が多すぎます。数分後に再試行してください。', '요청이 너무 많습니다. 몇 분 후 다시 시도하세요.'],
    weak: ['The new password does not meet the security requirements. Use a longer password with upper- and lowercase letters, numbers and symbols.', '新密碼未符合安全要求，請使用更長並包含大小寫字母、數字及符號的密碼。', '新しいパスワードが安全要件を満たしていません。大文字・小文字・数字・記号を含む長いものにしてください。', '새 비밀번호가 보안 요건을 충족하지 않습니다. 대소문자, 숫자, 기호를 포함해 더 길게 설정하세요.'],
    existing: ['This account is already registered. Try signing in or resetting your password.', '此帳戶已註冊，請嘗試登入或重設密碼。', '登録済みのアカウントです。ログインまたはパスワード再設定をご利用ください。', '이미 등록된 계정입니다. 로그인 또는 비밀번호 재설정을 이용하세요.'],
    config: ['The store’s sign-in service is not configured correctly. Contact the store; changing your password will not fix this.', '商店登入服務設定有誤，請聯絡商店處理；更改密碼無法解決此問題。', '店舗のログインサービスの設定に問題があります。店舗にお問い合わせください。', '매장의 로그인 서비스 설정에 문제가 있습니다. 매장에 문의하세요.'],
    server: ['The sign-in service is temporarily unavailable. Try again later; your credentials could not be verified.', '登入服務暫時無法使用，未能驗證帳戶資料，請稍後再試。', 'ログインサービスが一時的に利用できず、認証できませんでした。後で再試行してください。', '로그인 서비스를 일시적으로 사용할 수 없어 인증하지 못했습니다. 나중에 다시 시도하세요.'],
    generic: ['The request could not be completed. Try again. If it continues, contact the store.', '未能完成操作，請再試一次；如持續出現，請聯絡商店。', '処理を完了できませんでした。再試行し、解決しない場合は店舗にお問い合わせください。', '요청을 완료하지 못했습니다. 다시 시도하고 계속되면 매장에 문의하세요.'],
    confirm: ['Your account has been created. A confirmation email has been sent to your email address. Open your inbox (Gmail if you use Gmail) and click the verification link before signing in. If you cannot find it, check your Spam or Junk folder.', '帳戶已建立，驗證電郵已寄出。請前往你的電郵信箱（如 Gmail），開啟驗證郵件並按下連結，完成驗證後再登入。如果收件匣找不到，請檢查「垃圾郵件」資料夾。', 'アカウントを作成し、確認メールを送信しました。Gmail などの受信箱を開き、メール内のリンクで認証してからログインしてください。見つからない場合は迷惑メールフォルダもご確認ください。', '계정이 생성되었으며 인증 이메일을 보냈습니다. Gmail 등 사용 중인 이메일의 받은편지함에서 인증 링크를 누른 후 로그인하세요. 메일이 보이지 않으면 스팸함도 확인해 주세요.'],
  };
  function text(key) {
    const index = Math.max(0, ['en', 'zh', 'ja', 'ko'].indexOf(localStorage.getItem('evrisLanguage')));
    return messages[key][index];
  }
  function classify(error) {
    const code = error?.code || '';
    const message = (error?.message || '').toLowerCase();
    const firebaseCodes = {
      'app/not-configured': 'firebaseConfig', 'app/backend-unavailable': 'checkoutUnavailable',
      'auth/invalid-credential': 'credentials', 'auth/wrong-password': 'credentials', 'auth/user-not-found': 'credentials',
      'auth/invalid-email': 'emailInvalid', 'auth/missing-password': 'passwordRequired',
      'auth/email-already-in-use': 'existing', 'auth/weak-password': 'weak',
      'auth/unverified-email': 'unconfirmed', 'auth/network-request-failed': 'network',
      'auth/too-many-requests': 'rate', 'auth/operation-not-allowed': 'config',
      'auth/invalid-api-key': 'config', 'auth/configuration-not-found': 'config',
      'auth/unauthorized-domain': 'config', 'auth/login-required': 'loginRequired',
      'auth/user-disabled': 'permission', 'permission-denied': 'permission',
      'unavailable': 'network', 'resource-exhausted': 'rate', 'order/out-of-stock': 'stock',
      'order/invalid-coupon': 'coupon',
    };
    if (firebaseCodes[code]) return firebaseCodes[code];
    if (error?.name === 'AuthRetryableFetchError' || /failed to fetch|fetch failed|networkerror|network request failed|load failed|timeout|timed out/.test(message)) return 'network';
    if (code === 'invalid_credentials' || message.includes('invalid login credentials')) return 'credentials';
    if (code === 'email_not_confirmed' || message.includes('email not confirmed')) return 'unconfirmed';
    if (error?.status === 429 || code.startsWith('over_')) return 'rate';
    if (code === 'weak_password') return 'weak';
    if (['email_address_invalid', 'validation_failed'].includes(code) && /email/.test(message)) return 'emailInvalid';
    if (['user_already_exists', 'email_exists'].includes(code)) return 'existing';
    if (/invalid api key|invalid apikey/.test(message) || code === 'signup_disabled') return 'config';
    if (error?.status >= 500) return 'server';
    return 'generic';
  }
  function show(message, key, error = true) {
    message.textContent = text(key);
    message.classList.toggle('is-error', error);
    message.setAttribute('role', error ? 'alert' : 'status');
    if (key === 'confirm') message.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    if (message.resendButton) {
      message.resendButton.hidden = key !== 'unconfirmed';
      message.resendButton.textContent = text('resend');
    }
  }
  function setup(form, message) {
    form.noValidate = true;
    const password = form.querySelector('[name="password"]');
    if (typeof document !== 'undefined' && password && !form.hidePassword) {
      const label = password.closest('label')?.querySelector('span');
      if (label) {
        if (!label.id) label.id = `${form.id}-password-label`;
        password.setAttribute('aria-labelledby', label.id);
      }
      const wrapper = document.createElement('span');
      wrapper.className = 'password-field';
      password.before(wrapper);
      wrapper.append(password);
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'password-toggle';
      toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="password-eye-slash" d="m3 3 18 18"/></svg>';
      function updateToggle() {
        const visible = password.type === 'text';
        toggle.setAttribute('aria-label', text(visible ? 'hidePassword' : 'showPassword'));
        toggle.title = text(visible ? 'hidePassword' : 'showPassword');
        toggle.setAttribute('aria-pressed', String(visible));
      }
      form.hidePassword = () => { password.type = 'password'; updateToggle(); };
      toggle.addEventListener('click', () => {
        password.type = password.type === 'password' ? 'text' : 'password';
        updateToggle();
      });
      form.addEventListener('reset', form.hidePassword);
      document.querySelector('#languageSelect')?.addEventListener('change', updateToggle);
      wrapper.append(toggle);
      updateToggle();
    }
    if (typeof document !== 'undefined' && window.EvrisBackend) {
      const resend = document.createElement('button');
      resend.type = 'button'; resend.className = 'forgot-password'; resend.hidden = true;
      resend.textContent = text('resend');
      message.after(resend); message.resendButton = resend;
      resend.addEventListener('click', async () => {
        if (resend.disabled || !validate(form, message, 'login')) return;
        resend.disabled = true;
        try {
          const response = await window.EvrisBackend.auth.resendVerification({
            email: form.querySelector('[name="email"]').value.trim(),
            password: form.querySelector('[name="password"]').value,
          });
          if (response.error) show(message, classify(response.error));
          else show(message, 'verificationSent', false);
        } finally { resend.disabled = false; }
      });
    }
    form.querySelectorAll('input').forEach(input => {
      input.setAttribute('aria-describedby', message.id);
      input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
    });
  }
  async function confirmThenLogin(form, message, email, onLogin, isActive) {
    form.reset();
    form.querySelector('[name="email"]').value = email;
    form.querySelector('[name="password"]').value = '';
    show(message, 'confirm', false);
    const reminder = message.textContent;
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Do not interrupt someone who closed the panel or chose another mode.
    if (!isActive() || message.textContent !== reminder) return;
    onLogin();
    show(message, 'confirm', false);
    form.querySelector('[name="password"]').focus();
  }
  function validate(form, message, mode, emailOnly = false) {
    const email = form.querySelector('[name="email"]');
    const password = form.querySelector('[name="password"]');
    [email, password].forEach(input => input.removeAttribute('aria-invalid'));
    email.value = email.value.trim();
    let key, field;
    if (!email.value) { key = 'emailRequired'; field = email; }
    else if (!email.validity.valid) { key = 'emailInvalid'; field = email; }
    else if (!emailOnly && !password.value) { key = 'passwordRequired'; field = password; }
    else if (!emailOnly && mode === 'create' && password.value.length < 6) { key = 'passwordShort'; field = password; }
    if (key) { show(message, key); field.setAttribute('aria-invalid', 'true'); field.focus(); return false; }
    message.textContent = '';
    message.classList.remove('is-error');
    message.setAttribute('role', 'status');
    return true;
  }
  window.EvrisAuthFeedback = { text, classify, show, setup, validate, confirmThenLogin, error(message, error) { show(message, classify(error)); } };
})();
