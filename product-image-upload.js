(() => {
  function validateFile(file) {
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('請選擇 JPG、PNG 或 WebP 圖片。');
    if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('圖片大小必須介乎 1 byte 至 5 MB。');
  }
  function configured() {
    const config = window.EVRIS_CLOUDINARY_CONFIG || {};
    return /^[a-zA-Z0-9_-]+$/.test(config.cloudName || '') && /^[a-zA-Z0-9_-]+$/.test(config.uploadPreset || '');
  }
  async function upload(file, signal) {
    validateFile(file);
    if (!configured()) throw new Error('尚未連接 Cloudinary，請先設定 Cloud name 及 Upload preset。');
    const { cloudName, uploadPreset } = window.EVRIS_CLOUDINARY_CONFIG;
    const body = new FormData(); body.append('file', file); body.append('upload_preset', uploadPreset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: 'POST', body, signal });
    const result = await response.json();
    if (!response.ok) throw new Error('圖片上傳失敗，請檢查 Cloudinary 上傳設定、圖片限制及剩餘額度。');
    const prefix = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    if (typeof result.secure_url !== 'string' || !result.secure_url.startsWith(prefix) || !window.EvrisInventory.validImagePath(result.secure_url)) throw new Error('上傳服務未有傳回有效圖片網址，請重試。');
    return result.secure_url;
  }
  window.EvrisImageUpload = { validateFile, configured, upload };
  if (typeof document === 'undefined') return;
  const fileInput = document.querySelector('#productImageFile');
  if (!fileInput) return;
  const form = document.querySelector('#productEditorForm');
  const path = form.elements.image_path;
  const preview = document.querySelector('#productImagePreview');
  const message = document.querySelector('#imageMessage');
  const uploadButton = document.querySelector('#uploadProductImage');
  const cancelButton = document.querySelector('#cancelProductImage');
  const save = document.querySelector('#saveProduct');
  let pending = null, objectUrl = null, controller = null, revision = 0;
  function reset() {
    ++revision; controller?.abort(); controller = null; pending = null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null; fileInput.value = ''; fileInput.disabled = false; path.readOnly = false;
    uploadButton.disabled = true; cancelButton.hidden = true; save.disabled = false;
  }
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    reset();
    path.dispatchEvent(new Event('input'));
    if (!file) return;
    try { validateFile(file); }
    catch (error) { message.textContent = error.message; return; }
    pending = file; objectUrl = URL.createObjectURL(file);
    preview.onload = () => { preview.hidden = false; };
    preview.onerror = () => { reset(); preview.hidden = true; message.textContent = '無法讀取這張圖片，請重新選擇。'; };
    preview.src = objectUrl;
    save.disabled = true; cancelButton.hidden = false;
    uploadButton.disabled = !configured();
    message.textContent = configured() ? `已選擇 ${file.name}，請按「上傳圖片」，完成後再儲存商品。` : '圖片已預覽，但尚未連接 Cloudinary，暫時未能上傳。';
  });
  path.addEventListener('input', () => { if (pending) reset(); });
  cancelButton.addEventListener('click', () => { reset(); path.dispatchEvent(new Event('input')); });
  uploadButton.addEventListener('click', async () => {
    if (!pending || controller) return;
    const current = revision;
    controller = new AbortController();
    const uploadController = controller;
    const timeout = setTimeout(() => uploadController.abort(), 60000);
    uploadButton.disabled = true; fileInput.disabled = true; path.readOnly = true;
    message.textContent = '正在上傳圖片…';
    try {
      const url = await upload(pending, controller.signal);
      if (current !== revision) return;
      reset(); path.value = url; path.dispatchEvent(new Event('input'));
      message.textContent = '圖片已上傳。請按「儲存並更新商店」套用到商品。';
    } catch (error) {
      if (current !== revision) return;
      controller = null; fileInput.disabled = false; path.readOnly = false; uploadButton.disabled = false;
      message.textContent = error.name === 'AbortError' ? '上傳逾時，請重試。原有商品圖片未有更改。' : error.message;
    } finally { clearTimeout(timeout); }
  });
  form.addEventListener('submit', event => {
    if (pending || controller) { event.preventDefault(); event.stopImmediatePropagation(); message.textContent = '請先完成圖片上傳，或者取消選擇。'; }
  }, true);
  form.addEventListener('reset', reset);
  document.querySelector('#productEditor').addEventListener('close', reset);
})();
