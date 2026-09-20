(() => {
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
    if (!/^assets\/[a-zA-Z0-9_./-]+\.(jpg|jpeg|png|webp)$/.test(data.image_path) || data.image_path.includes('..')) throw new Error('圖片請使用 assets/ 內的 JPG、PNG 或 WebP 路徑。');
    if (typeof data.is_active !== 'boolean') throw new Error('商品狀態不正確。');
    return data;
  }
  window.EvrisInventory = { validate };
})();
