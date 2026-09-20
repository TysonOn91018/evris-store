(() => {
  const count = document.querySelector('#favoriteCount');
  if (!count) return;
  const list = document.createElement('ul');
  list.className = 'member-favorites-list';
  count.after(list);
  const copy = {
    en: ['{n} items', 'No saved products yet.', 'View details'],
    zh: ['{n} 件商品', '暫時未有收藏商品。', '查看商品詳情'],
    ja: ['{n} 点', 'お気に入りの商品はまだありません。', '商品詳細を見る'],
    ko: ['{n}개', '저장한 상품이 없습니다.', '상품 상세 보기'],
  };
  function render() {
    let saved = [];
    try {
      const value = JSON.parse(localStorage.getItem('evrisFavorites') || '[]');
      if (Array.isArray(value)) saved = value.filter(item => item && typeof item.id === 'string' && item.id);
    } catch { /* Treat invalid local data as an empty list. */ }
    saved = [...new Map(saved.map(item => [item.id, item])).values()];
    const words = copy[localStorage.getItem('evrisLanguage')] || copy.en;
    count.textContent = words[0].replace('{n}', saved.length);
    list.replaceChildren();
    if (!saved.length) {
      const empty = document.createElement('li');
      empty.className = 'member-favorites-empty';
      empty.textContent = words[1];
      list.append(empty);
      return;
    }
    for (const savedProduct of saved) {
      const product = (window.EVRIS_PRODUCTS || []).find(item => item.id === savedProduct.id) || savedProduct;
      const row = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'member-favorite-link';
      link.href = `product.html?product=${encodeURIComponent(product.id)}`;
      if (product.image) {
        const url = new URL(product.image, location.href);
        if (['http:', 'https:'].includes(url.protocol)) {
          const image = document.createElement('img');
          image.src = url.href;
          image.alt = '';
          image.loading = 'lazy';
          image.addEventListener('error', () => image.remove(), { once: true });
          link.append(image);
        }
      }
      const details = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = product.title || product.id;
      const hint = document.createElement('span');
      hint.textContent = `${words[2]} →`;
      details.append(title, hint);
      link.append(details);
      row.append(link);
      list.append(row);
    }
  }
  window.addEventListener('evris:favorites-updated', render);
  window.addEventListener('evris:catalog-updated', render);
  window.addEventListener('storage', event => {
    if (!event.key || ['evrisFavorites', 'evrisLanguage'].includes(event.key)) render();
  });
  document.querySelector('#languageSelect')?.addEventListener('change', render);
  // Both account implementations refresh their existing count when opening.
  const summary = document.querySelector('#memberSummary');
  if (summary) new MutationObserver(render).observe(summary, { attributes: true, attributeFilter: ['hidden'] });
  render();
})();
