(() => {
  const catalog = window.EVRIS_PRODUCTS || [];
  const original = catalog.slice();
  const status = window.EvrisCatalog = { state: 'loading' };
  const notify = () => document.dispatchEvent(new CustomEvent('evris:catalog-updated'));
  const timer = setTimeout(() => { status.state = 'unavailable'; notify(); }, 8000);
  window.EvrisBackend.watchProducts(rows => {
    clearTimeout(timer);
    const updated = rows.map(row => {
      const previous = original.find(item => item.id === row.slug);
      const item = previous || { id: row.slug };
      Object.assign(item, { title: row.name, priceValue: row.price, stock: row.stock, is_active: true,
        category: row.category, image: row.image_path, imageAlt: row.name,
        meta: `${row.category} / ${row.material || ''}`, description: row.description || item.description || '',
        material: row.material || item.material || '', style: row.style || item.style || '', live: true });
      return item;
    });
    original.forEach(item => { if (!rows.some(row => row.slug === item.id)) { item.is_active = false; item.stock = 0; } });
    catalog.splice(0, catalog.length, ...updated);
    status.state = 'ready'; notify();
  }, () => { clearTimeout(timer); status.state = 'unavailable'; notify(); });
})();
