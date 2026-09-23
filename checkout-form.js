// Product pages keep checkout in their own cart drawer.
(() => {
  const trigger = document.querySelector('.coupon-checkout-link');
  if (!trigger || document.querySelector('#checkoutForm')) return;
  const copy = {
    en: ['Proceed to checkout','Gift option','No gift wrap','Gift wrapping','Gift wrapping + message card','Name','Member email','Address','Continue to test payment','Test payment · JPY · No real charge','Your cart is empty.','Please sign in with a verified account first.','Opening payment…'],
    zh: ['前往結帳','禮物包裝','不需要包裝','禮物包裝','禮物包裝＋心意卡','姓名','會員電郵','地址','前往測試付款','測試付款 · 日元 · 不會扣真錢','購物車內沒有商品。','請先登入已驗證電郵嘅會員帳戶。','正在開啟付款頁…'],
    ja: ['レジへ進む','ギフト設定','ギフト包装なし','ギフト包装','ギフト包装＋メッセージカード','お名前','会員メールアドレス','住所','テスト決済へ進む','テスト決済・日本円・実際の請求はありません','カートに商品がありません。','メール認証済みのアカウントでログインしてください。','決済画面を開いています…'],
    ko: ['결제하기','선물 옵션','포장 없음','선물 포장','선물 포장 + 메시지 카드','이름','회원 이메일','주소','테스트 결제로 이동','테스트 결제 · JPY · 실제 청구 없음','장바구니가 비어 있습니다.','이메일 인증을 완료한 계정으로 로그인해 주세요.','결제 화면 여는 중…']
  };
  const words = () => copy[localStorage.getItem('evrisLanguage')] || copy.en;
  const panel = document.createElement('section');
  panel.id = 'checkout';
  panel.hidden = true;
  panel.innerHTML = `<form class="checkout-form" id="checkoutForm">
    <label><span data-checkout-copy="1"></span><select name="giftOption"><option value="none" data-checkout-copy="2"></option><option value="wrap" data-checkout-copy="3"></option><option value="message" data-checkout-copy="4"></option></select></label>
    <label><span data-checkout-copy="5"></span><input name="name" autocomplete="name" required></label>
    <label><span data-checkout-copy="6"></span><input name="email" type="email" autocomplete="email" readonly required></label>
    <label><span data-checkout-copy="7"></span><textarea name="address" autocomplete="street-address" rows="3" required></textarea></label>
    <small data-checkout-copy="9"></small><button class="cart-button" type="submit"></button>
    </form><p class="form-message" id="checkoutMessage" role="status"></p>`;
  trigger.after(panel);
  const form = panel.querySelector('form');
  const submit = form.querySelector('button');
  const message = panel.querySelector('[role="status"]');
  const backend = window.EvrisBackend;
  let user = null, submitting = false, pending = null;
  function translate() {
    trigger.textContent = words()[0];
    panel.querySelectorAll('[data-checkout-copy]').forEach(node => node.textContent = words()[Number(node.dataset.checkoutCopy)]);
    submit.textContent = words()[submitting ? 12 : 8];
  }
  trigger.setAttribute('href', '#checkout');
  trigger.setAttribute('aria-controls', 'checkout');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', event => {
    event.preventDefault();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.elements.name.focus({ preventScroll: true });
    if (!user) message.textContent = words()[11];
  });
  backend?.auth.onAuthStateChange(async (_event, session) => {
    user = session?.user || null;
    const id = user?.id;
    pending = null;
    form.reset();
    form.elements.email.value = user?.email || '';
    message.textContent = '';
    if (!id) return;
    const { data } = await backend.getProfile(id);
    if (user?.id !== id) return;
    if (form.elements.address.value) return;
    form.elements.address.value = data?.shipping_address || localStorage.getItem(`evrisShippingAddress:${user.email}`) || '';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    if (!user) {
      message.textContent = words()[11];
      document.querySelector('#accountButton')?.click();
      return;
    }
    try {
      const cart = JSON.parse(localStorage.getItem('evrisCart') || '[]');
      if (!cart.length) { message.textContent = words()[10]; return; }
      const coupon = window.EVRISCoupons?.getAppliedDiscount(cart);
      const payload = {
        p_customer_name: form.elements.name.value.trim(), p_customer_email: user.email,
        p_shipping_address: form.elements.address.value.trim(), p_gift_option: form.elements.giftOption.value,
        p_items: cart.map(item => ({ product_slug: item.id, quantity: item.quantity })),
        p_coupon_code: coupon?.code || null
      };
      const fingerprint = JSON.stringify(payload);
      if (pending?.fingerprint !== fingerprint) pending = { fingerprint, request_id: crypto.randomUUID() };
      submitting = true; submit.disabled = true; message.textContent = ''; translate();
      const checkoutUserId = user.id;
      const { data, error } = await backend.placeOrder({ ...payload, request_id: pending.request_id });
      if (user?.id !== checkoutUserId) return;
      if (error) throw error;
      const destination = new URL(data.checkout_url);
      if (destination.protocol !== 'https:' || destination.hostname !== 'checkout.stripe.com') throw new Error('Invalid payment destination');
      window.location.assign(destination.href);
    } catch (error) {
      if (error.code === 'payment/order-closed') pending = null;
      window.EvrisAuthFeedback.error(message, error);
    } finally {
      submitting = false; submit.disabled = false; translate();
    }
  });
  document.querySelector('#languageSelect')?.addEventListener('change', translate);
  translate();
})();
