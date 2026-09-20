(() => {
  const KEY = 'evris-gem-archive-2048-v1';
  const products = { 'citrine-earrings':'citrine-drop-earrings', 'moon-pearl':'moon-pearl-bracelet', 'pearl-chain':'minimal-pearl-chain' };
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
  const tasks = new Map();
  function sync(uid) {
    if (tasks.has(uid)) return tasks.get(uid);
    const work = (async () => {
      const { data, error } = await window.EvrisBackend.auth.getUser();
      if (error || data?.user?.id !== uid) return { error: error || { code:'auth/login-required' }, count:0 };
      let count = 0;
      const coupons = read().coupons;
      for (const coupon of Array.isArray(coupons) ? coupons : []) {
        if (!coupon || coupon.redeemed_at || (coupon.user_id && coupon.user_id !== uid) || coupon.synced) continue;
        const response = await window.EvrisBackend.claimCoupon({
          p_milestone: coupon.milestone, p_product_slug: coupon.storeProductId || products[coupon.rewardId],
        });
        if (response.error) return { error:response.error, count };
        // Merge into the latest device data so another tab's newly earned rewards survive.
        const latest = read();
        const current = (latest.coupons || []).find(item => item.code === coupon.code && (!item.user_id || item.user_id === uid));
        if (current) {
          Object.assign(current, {
            user_id:uid, code:response.data.code, storeProductId:response.data.product_slug,
            amount:response.data.discount_percent, synced:true, redeemed_at:response.data.redeemed_at || null,
          });
          localStorage.setItem(KEY,JSON.stringify(latest));
          if (localStorage.getItem('evrisAppliedGameCoupon') === coupon.code) localStorage.setItem('evrisAppliedGameCoupon',response.data.code);
          document.dispatchEvent(new CustomEvent('evris:coupons-updated'));
        }
        count++;
      }
      return { count, error:null };
    })().catch(error => ({count:0,error})).finally(() => tasks.delete(uid));
    tasks.set(uid,work);
    return work;
  }
  window.EvrisCouponSync = { sync };
})();
