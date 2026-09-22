(() => {
  const api = window.EvrisBackend;
  const $ = selector => document.querySelector(selector);
  const form = $('#adminAuthForm');
  const authMessage = $('#adminAuthMessage');
  const feedback = window.EvrisAuthFeedback;
  feedback.setup(form, authMessage);
  let inventory = [], editing = null, generation = 0;
  function report(error) {
    if (error?.code === 'inventory/timeout') return '庫存連線逾時，請確認 Firestore 資料庫及規則已啟用，再按重新載入。';
    if (error?.code === 'inventory/conflict') return '商品或庫存剛剛有更新。請關閉編輯、重新載入後再修改，避免覆蓋新資料。';
    if (error?.code === 'permission-denied') return '未獲授權。請確認店家帳戶及 Firestore 管理規則已設定。';
    return error?.code ? feedback.text(feedback.classify(error)) : error.message;
  }
  async function load() {
    const revision = generation;
    $('#inventoryMessage').textContent = '正在載入商品…';
    const { data, error } = await api.listInventory();
    if (revision !== generation) return;
    if (error) { $('#inventoryMessage').textContent = report(error); return; }
    inventory = data;
    $('#inventoryMessage').textContent = '';
    render();
  }
  function render() {
    $('#totalProducts').textContent = inventory.length;
    $('#activeProducts').textContent = inventory.filter(item => item.is_active).length;
    $('#totalStock').textContent = inventory.reduce((sum,item) => sum + (item.stock || 0), 0);
    $('#emptyProducts').textContent = inventory.filter(item => item.stock === 0).length;
    $('#inventoryEmpty').hidden = inventory.length > 0;
    const query = $('#inventorySearch').value.toLowerCase();
    $('#inventoryRows').replaceChildren();
    for (const item of inventory.filter(item => `${item.name} ${item.slug}`.toLowerCase().includes(query))) {
      const row = document.createElement('tr');
      const productCell = document.createElement('td');
      const product = document.createElement('div'); product.className = 'inventory-product';
      const image = document.createElement('img'); image.src = item.image_path; image.alt = '';
      const copy = document.createElement('div'); copy.textContent = item.name;
      const slug = document.createElement('small'); slug.textContent = item.slug; copy.append(slug);
      product.append(image,copy); productCell.append(product); row.append(productCell);
      for (const value of [item.price, item.stock, item.is_active ? '上架中' : '已下架']) {
        const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
      }
      const actions = document.createElement('td'); actions.className = 'inventory-actions';
      for (const [label, mode] of [['編輯','set'],['補貨','add']]) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
        button.addEventListener('click', () => edit(item, mode)); actions.append(button);
      }
      const visibility = document.createElement('button');
      visibility.type = 'button';
      visibility.textContent = item.is_active ? '下架商品' : '重新上架';
      visibility.className = item.is_active ? 'admin-unpublish' : '';
      visibility.setAttribute('aria-label', `${visibility.textContent}：${item.name}`);
      visibility.addEventListener('click', async () => {
        const current = generation;
        actions.querySelectorAll('button').forEach(button => { button.disabled = true; });
        $('#inventoryMessage').textContent = item.is_active ? '正在下架商品…' : '正在上架商品…';
        const values = Object.fromEntries(['name','price','stock','category','image_path','description','material','style'].map(key => [key,item[key]]));
        values.is_active = !item.is_active;
        try {
          const response = await api.saveInventory(item.slug,values,item);
          if (current !== generation) return;
          if (response.error) throw response.error;
          // Update the row immediately, even if refreshing the inventory later fails.
          inventory = inventory.map(product => product.slug === item.slug ? { ...product, is_active: values.is_active, revision: product.revision + 1 } : product);
          render();
          $('#inventoryMessage').textContent = values.is_active
            ? `「${item.name}」已重新上架。`
            : `「${item.name}」已下架，商品資料及庫存已保留，可以隨時重新上架。`;
        } catch (error) {
          if (current === generation) {
            $('#inventoryMessage').textContent = report(error);
            actions.querySelectorAll('button').forEach(button => { button.disabled = false; });
          }
        }
      });
      actions.append(visibility);
      row.append(actions); $('#inventoryRows').append(row);
    }
  }
  function previewImage() {
    const value = $('#productEditorForm').elements.image_path.value.trim();
    const preview = $('#productImagePreview');
    preview.hidden = true;
    $('#imageMessage').textContent = '';
    if (!window.EvrisInventory.validImagePath(value)) { preview.removeAttribute('src'); return; }
    preview.onload = () => { preview.hidden = false; $('#imageMessage').textContent = ''; };
    preview.onerror = () => { preview.hidden = true; $('#imageMessage').textContent = '圖片無法載入，請確認網址直接連到圖片，而且允許公開瀏覽。'; };
    preview.src = value;
  }
  $('#productEditorForm').elements.image_path.addEventListener('input', previewImage);
  function edit(item, mode = 'set') {
    editing = item ? { ...item } : null;
    const editor = $('#productEditorForm'); editor.reset();
    const values = item || { slug:'', name:'', price:0, stock:0, category:'bracelet', image_path:'assets/products/', is_active:true };
    for (const key of ['slug','name','price','stock','category','image_path','description','material','style']) editor.elements[key].value = values[key] ?? '';
    editor.elements.is_active.checked = values.is_active;
    editor.elements.slug.readOnly = Boolean(item);
    editor.elements.stockMode.value = mode;
    if (mode === 'add') editor.elements.stock.value = 1;
    previewImage();
    $('#editorTitle').textContent = !item ? '新增商品' : mode === 'add' ? '補充庫存' : '編輯商品';
    $('#editorMessage').textContent = '';
    $('#productEditor').showModal();
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!feedback.validate(form,authMessage,'login')) return;
    $('#adminSignIn').disabled = true;
    const response = await api.auth.signInWithPassword({ email:form.elements.email.value.trim(), password:form.elements.password.value });
    $('#adminSignIn').disabled = false;
    if (response.error) { feedback.error(authMessage,response.error); return; }
    form.reset();
  });
  api.auth.onAuthStateChange(async (_event,session) => {
    const revision = ++generation;
    $('#adminWorkspace').hidden = true; $('#adminLogin').hidden = false;
    $('#productEditor').close(); inventory = []; $('#inventoryRows').replaceChildren();
    $('#connectionState').textContent = '尚未登入';
    if (!session) return;
    const response = await api.adminStatus();
    if (revision !== generation) return;
    if (response.error || !response.data.admin) { authMessage.textContent = '此帳戶沒有店家管理權限。請使用已授權的店家帳戶。'; return; }
    $('#adminLogin').hidden = true; $('#adminWorkspace').hidden = false;
    $('#adminIdentity').textContent = response.data.email;
    $('#connectionState').textContent = '店家已登入';
    await load();
  });
  $('#adminLogout').addEventListener('click', () => api.auth.signOut());
  $('#reloadInventory').addEventListener('click',load);
  $('#inventorySearch').addEventListener('input',render);
  $('#newProduct').addEventListener('click',() => edit(null));
  $('#closeEditor').addEventListener('click',() => $('#productEditor').close());
  $('#productEditorForm').addEventListener('submit', async event => {
    event.preventDefault(); const editor = event.currentTarget;
    const values = Object.fromEntries(new FormData(editor));
    const slug = values.slug; const mode = values.stockMode; delete values.slug; delete values.stockMode;
    values.image_path = values.image_path.trim();
    values.price = Number(values.price); values.stock = Number(values.stock); values.is_active = editor.elements.is_active.checked;
    $('#saveProduct').disabled = true; $('#editorMessage').textContent = '正在儲存…';
    try {
      const response = await api.saveInventory(slug,values,editing,mode === 'add' ? values.stock : null);
      if (response.error) throw response.error;
      $('#productEditor').close(); await load(); $('#inventoryMessage').textContent = '商品已儲存，商店會自動更新。';
    } catch(error) { $('#editorMessage').textContent = report(error); }
    finally { $('#saveProduct').disabled = false; }
  });
  $('#importCatalog').addEventListener('click', async () => {
    $('#importCatalog').disabled = true;
    try {
      for (const item of window.EVRIS_PRODUCTS) {
        if (inventory.some(row => row.slug === item.id)) continue;
        const { error } = await api.saveInventory(item.id,{name:item.title,price:Math.round(item.priceValue * 21.8),category:item.category,stock:0,image_path:item.image,description:item.description || '',material:item.material || '',style:item.style || '',is_active:true},null);
        if (error) throw error;
      }
      await load();
    } catch(error) { $('#inventoryMessage').textContent = report(error); }
    finally { $('#importCatalog').disabled = false; }
  });
})();
