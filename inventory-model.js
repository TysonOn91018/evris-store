(() => {
  function validImagePath(value) {
    if (typeof value !== 'string' || value.length > 1000) return false;
    if (/^assets\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp)$/.test(value) && !value.includes('..')) return true;
    return /^https:\/\/[a-zA-Z0-9][a-zA-Z0-9.-]*\/[-a-zA-Z0-9_~:/?#@!$&()*+,;=%.]+$/.test(value);
  }
  function validate(values) {
    const data = { ...values };
    for (const key of ['name', 'description', 'material', 'style']) {
      data[key] = String(data[key] || '').trim();
      if (data[key].length > (key === 'name' ? 160 : 2000) || /[<>]/.test(data[key])) throw new Error('文字過長或包含 HTML 標籤。');
    }
    if (!data.name) throw new Error('請輸入商品名稱。');
    if (!['bracelet','earring','necklace'].includes(data.category)) throw new Error('請選擇商品分類。');
    if (!Number.isSafeInteger(data.price) || data.price < 0 || data.price > 10000000) throw new Error('價格必須是 0 或以上的整數（RMB）。');
    if (!Number.isSafeInteger(data.stock) || data.stock < 0 || data.stock > 1000000) throw new Error('庫存必須是 0 至 1,000,000 的整數。');
    if (!validImagePath(data.image_path)) throw new Error('請使用 assets/ 圖片路徑或完整 HTTPS 圖片網址。');
    if (typeof data.is_active !== 'boolean') throw new Error('商品狀態不正確。');
    return data;
  }
  window.EvrisInventory = { validate, validImagePath };
})();
