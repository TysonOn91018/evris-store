(() => {
  // UI copy only. Product names, descriptions and editable values remain as entered.
  const rows = [
    ['查看商店 ↗','View store ↗','ストアを見る ↗','스토어 보기 ↗'],
    ['店家工作台','Store dashboard','店舗ダッシュボード','매장 대시보드'],
    ['商品與庫存','Products & inventory','商品・在庫管理','상품 및 재고'],
    ['管理每件商品，讓店面保持最新。','Manage products and keep your store up to date.','商品を管理してストアを最新に保ちます。','상품을 관리하고 매장을 최신 상태로 유지하세요.'],
    ['尚未登入','Signed out','未ログイン','로그아웃 상태'],
    ['店家已登入','Store manager signed in','管理者ログイン済み','관리자 로그인됨'],
    ['專屬管理入口','Store management','店舗管理','매장 관리'],
    ['登入店家帳戶','Sign in as store manager','管理者アカウントでログイン','관리자 계정으로 로그인'],
    ['使用已驗證電郵的店家帳戶登入，即可更新商品與補貨。','Use your verified store account to update products and stock.','認証済みの管理者アカウントで商品と在庫を更新できます。','이메일 인증된 관리자 계정으로 상품과 재고를 관리하세요.'],
    ['還未建立帳戶？前往商店註冊','No account? Register in the store','アカウントをお持ちでない方はストアで登録','계정이 없나요? 스토어에서 가입하세요'],
    ['電郵','Email','メールアドレス','이메일'],['密碼','Password','パスワード','비밀번호'],
    ['登入管理後台','Sign in','ログイン','로그인'],['登出','Sign out','ログアウト','로그아웃'],
    ['商品總數','Total products','商品数','전체 상품'],['上架中','Published','公開中','판매 중'],['剩餘庫存','Stock remaining','在庫数','남은 재고'],['已售罄','Sold out','売り切れ','품절'],['已下架','Unpublished','非公開','판매 중지'],
    ['搜尋商品','Search products','商品を検索','상품 검색'],['輸入商品名稱或編號','Product name or ID','商品名またはID','상품명 또는 ID'],['重新載入','Reload','再読み込み','새로고침'],['＋ 新增商品','＋ Add product','＋ 商品を追加','＋ 상품 추가'],
    ['商品','Product','商品','상품'],['售價（RMB）','Price (RMB)','価格（RMB）','가격 (RMB)'],['庫存','Stock','在庫','재고'],['狀態','Status','状態','상태'],['管理','Actions','操作','관리'],
    ['建立第一批商品','Add your first products','最初の商品を登録','첫 상품 등록'],
    ['可以從商店現有商品匯入，庫存會從 0 開始；補上實際數量後才開放購買。','Import existing store products with zero stock, then enter stock to enable purchases.','既存商品を在庫0で取り込み、実際の在庫を入力すると購入可能になります。','기존 상품을 재고 0으로 가져온 후 재고를 입력하면 구매할 수 있습니다.'],
    ['匯入現有商品','Import existing products','既存商品を取り込む','기존 상품 가져오기'],
    ['新增商品','Add product','商品を追加','상품 추가'],['編輯商品','Edit product','商品を編集','상품 편집'],['補充庫存','Restock product','在庫を補充','재고 보충'],['編輯','Edit','編集','편집'],['補貨','Restock','補充','보충'],['下架商品','Unpublish','非公開にする','판매 중지'],['重新上架','Republish','再公開','판매 재개'],['關閉','Close','閉じる','닫기'],
    ['商品編號','Product ID','商品ID','상품 ID'],['例如 citrine-pearl-bracelet','e.g. citrine-pearl-bracelet','例：citrine-pearl-bracelet','예: citrine-pearl-bracelet'],['商品名稱','Product name','商品名','상품명'],['分類','Category','カテゴリー','카테고리'],['手鍊','Bracelet','ブレスレット','팔찌'],['耳環','Earrings','ピアス','귀걸이'],['頸鍊','Necklace','ネックレス','목걸이'],['商品介紹','Description','商品説明','상품 설명'],['材質','Material','素材','소재'],['搭配介紹','Styling notes','コーディネート','스타일링'],
    ['選擇商品圖片','Choose product image','商品画像を選択','상품 이미지 선택'],
    ['JPG、PNG 或 WebP，每張最多 5 MB。選圖後先上傳，再儲存商品。','JPG, PNG or WebP, up to 5 MB. Upload the image before saving the product.','JPG・PNG・WebP、最大5 MB。画像をアップロードしてから商品を保存してください。','JPG, PNG, WebP, 최대 5 MB. 이미지를 업로드한 후 상품을 저장하세요.'],
    ['上傳圖片','Upload image','画像をアップロード','이미지 업로드'],['取消選擇','Cancel selection','選択を取り消す','선택 취소'],['商品圖片網址或路徑','Image URL or path','画像URLまたはパス','이미지 URL 또는 경로'],['https://… 或 assets/products/example.jpg','https://… or assets/products/example.jpg','https://… または assets/products/example.jpg','https://… 또는 assets/products/example.jpg'],
    ['可使用網上圖片的完整 HTTPS 網址，或現有商品圖片路徑。','Use a public HTTPS image URL or an existing product image path.','公開HTTPS画像URLまたは既存画像のパスを入力できます。','공개 HTTPS 이미지 URL 또는 기존 이미지 경로를 입력하세요.'],['商品圖片預覽','Product image preview','商品画像プレビュー','상품 이미지 미리보기'],
    ['庫存操作','Stock action','在庫操作','재고 작업'],['盤點：設定總庫存','Set total stock','在庫総数を設定','총 재고 설정'],['補貨：增加數量','Add stock','在庫数を追加','재고 추가'],['數量','Quantity','数量','수량'],['在商店上架','Publish in store','ストアで公開','스토어에 게시'],['儲存並更新商店','Save and update store','保存してストアを更新','저장 및 스토어 업데이트'],
    ['正在載入商品…','Loading products…','商品を読み込み中…','상품 로딩 중…'],['正在下架商品…','Unpublishing product…','非公開にしています…','판매 중지 중…'],['正在上架商品…','Publishing product…','公開しています…','게시 중…'],['正在儲存…','Saving…','保存中…','저장 중…'],['商品已儲存，商店會自動更新。','Product saved. The store will update automatically.','保存しました。ストアは自動更新されます。','상품을 저장했습니다. 스토어가 자동 업데이트됩니다.'],
    ['庫存連線逾時，請確認 Firestore 資料庫及規則已啟用，再按重新載入。','Inventory connection timed out. Check Firestore setup and rules, then reload.','在庫の接続がタイムアウトしました。Firestoreの設定とルールを確認して再読み込みしてください。','재고 연결 시간이 초과되었습니다. Firestore 설정과 규칙을 확인한 후 새로고침하세요.'],
    ['商品或庫存剛剛有更新。請關閉編輯、重新載入後再修改，避免覆蓋新資料。','This product changed. Close the editor and reload before editing again.','商品が更新されました。編集を閉じ、再読み込みしてから編集してください。','상품이 변경되었습니다. 편집기를 닫고 새로고침한 후 다시 편집하세요.'],
    ['未獲授權。請確認店家帳戶及 Firestore 管理規則已設定。','Access denied. Check your manager account and Firestore rules.','権限がありません。管理者アカウントとFirestoreルールを確認してください。','권한이 없습니다. 관리자 계정과 Firestore 규칙을 확인하세요.'],
    ['此帳戶沒有店家管理權限。請使用已授權的店家帳戶。','This account has no store access. Use an authorized manager account.','このアカウントに管理権限はありません。管理者アカウントをご利用ください。','매장 관리 권한이 없습니다. 승인된 관리자 계정을 사용하세요.'],
    ['圖片無法載入，請確認網址直接連到圖片，而且允許公開瀏覽。','Cannot load image. Check that the URL links directly to a public image.','画像を読み込めません。公開画像への直接URLを確認してください。','이미지를 불러올 수 없습니다. 공개 이미지의 직접 URL을 확인하세요.'],
    ['請選擇 JPG、PNG 或 WebP 圖片。','Choose a JPG, PNG or WebP image.','JPG・PNG・WebP画像を選択してください。','JPG, PNG 또는 WebP 이미지를 선택하세요.'],['圖片大小必須介乎 1 byte 至 5 MB。','Image size must be between 1 byte and 5 MB.','画像サイズは1 byteから5 MBまでです。','이미지 크기는 1 byte에서 5 MB 사이여야 합니다.'],
    ['尚未連接 Cloudinary，請先設定 Cloud name 及 Upload preset。','Configure your Cloudinary cloud name and upload preset first.','CloudinaryのCloud nameとUpload presetを設定してください。','Cloudinary Cloud name과 Upload preset을 먼저 설정하세요.'],
    ['圖片上傳失敗，請檢查 Cloudinary 上傳設定、圖片限制及剩餘額度。','Upload failed. Check Cloudinary settings, image limits and quota.','アップロードに失敗しました。Cloudinary設定、画像制限、残り容量を確認してください。','업로드 실패. Cloudinary 설정, 이미지 제한 및 할당량을 확인하세요.'],
    ['上傳服務未有傳回有效圖片網址，請重試。','No valid image URL returned. Please retry.','有効な画像URLが返されませんでした。再試行してください。','유효한 이미지 URL이 없습니다. 다시 시도하세요.'],['無法讀取這張圖片，請重新選擇。','Cannot read this image. Choose another file.','画像を読み込めません。別の画像を選択してください。','이미지를 읽을 수 없습니다. 다시 선택하세요.'],
    ['圖片已預覽，但尚未連接 Cloudinary，暫時未能上傳。','Preview ready. Configure Cloudinary to enable uploads.','プレビューできました。アップロードにはCloudinary設定が必要です。','미리보기 준비됨. 업로드하려면 Cloudinary를 설정하세요.'],['正在上傳圖片…','Uploading image…','画像をアップロード中…','이미지 업로드 중…'],
    ['圖片已上傳。請按「儲存並更新商店」套用到商品。','Image uploaded. Select Save and update store to apply it.','アップロードしました。「保存してストアを更新」で適用してください。','업로드 완료. 저장 및 스토어 업데이트를 눌러 적용하세요.'],
    ['上傳逾時，請重試。原有商品圖片未有更改。','Upload timed out. Retry; the original product image is unchanged.','タイムアウトしました。元の画像は変更されていません。再試行してください。','업로드 시간 초과. 기존 이미지는 변경되지 않았습니다. 다시 시도하세요.'],['請先完成圖片上傳，或者取消選擇。','Finish uploading or cancel the image selection first.','アップロードを完了するか画像選択を取り消してください。','업로드를 완료하거나 이미지 선택을 취소하세요.'],
    ['文字過長或包含 HTML 標籤。','Text is too long or contains HTML tags.','文字数が多すぎるかHTMLタグが含まれています。','텍스트가 너무 길거나 HTML 태그가 포함되어 있습니다.'],['請輸入商品名稱。','Enter a product name.','商品名を入力してください。','상품명을 입력하세요.'],['請選擇商品分類。','Choose a category.','カテゴリーを選択してください。','카테고리를 선택하세요.'],['價格必須是 0 或以上的整數（RMB）。','Price must be a non-negative integer (RMB).','価格は0以上の整数（RMB）で入力してください。','가격은 0 이상의 정수(RMB)여야 합니다.'],['庫存必須是 0 至 1,000,000 的整數。','Stock must be an integer from 0 to 1,000,000.','在庫は0～1,000,000の整数で入力してください。','재고는 0에서 1,000,000 사이의 정수여야 합니다.'],['請使用 assets/ 圖片路徑或完整 HTTPS 圖片網址。','Use an assets/ image path or a full HTTPS image URL.','assets/画像パスまたは完全なHTTPS画像URLを使用してください。','assets/ 경로 또는 전체 HTTPS 이미지 URL을 사용하세요.'],['商品狀態不正確。','Invalid product status.','商品状態が無効です。','상품 상태가 올바르지 않습니다.'],
  ];
  const map = new Map(rows.map(row => [row[0], row]));
  const languages = ['zh','en','ja','ko'];
  let lang = localStorage.getItem('evrisLanguage') || 'zh';
  if (!languages.includes(lang)) lang = 'zh';
  function translate(source) {
    if (map.has(source)) return map.get(source)[languages.indexOf(lang)];
    const match = source.match(/^「(.*)」已重新上架。$/s);
    if (match) return [source, `“${match[1]}” is published.`, `「${match[1]}」を再公開しました。`, `“${match[1]}” 판매가 재개되었습니다.`][languages.indexOf(lang)];
    const removed = source.match(/^「(.*)」已下架，商品資料及庫存已保留，可以隨時重新上架。$/s);
    if (removed) return [source, `“${removed[1]}” is unpublished. Product data and stock are kept for republishing.`, `「${removed[1]}」を非公開にしました。商品と在庫は保持され、再公開できます。`, `“${removed[1]}” 판매를 중지했습니다. 상품과 재고는 유지되며 다시 게시할 수 있습니다.`][languages.indexOf(lang)];
    const selected = source.match(/^已選擇 (.*)，請按「上傳圖片」，完成後再儲存商品。$/s);
    if (selected) return [source, `Selected ${selected[1]}. Upload the image, then save the product.`, `${selected[1]}を選択しました。アップロード後に商品を保存してください。`, `${selected[1]} 선택됨. 이미지를 업로드한 후 상품을 저장하세요.`][languages.indexOf(lang)];
    const action = source.match(/^(下架商品|重新上架)：(.*)$/s);
    if (action) return `${translate(action[1])}: ${action[2]}`;
    return source;
  }
  const originals = new WeakMap();
  function update(node, key, current, write) {
    let record = originals.get(node); if (!record) originals.set(node, record = {});
    if (!record[key] || record[key].last !== current) record[key] = { source: current, last: current };
    const next = translate(record[key].source.trim());
    const value = current.replace(current.trim(), next);
    if (value !== current) write(value);
    record[key].last = value;
  }
  function refresh() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim() || node.parentElement.closest('script,style,textarea,.inventory-product,#adminIdentity,#languageSelect')) continue;
      update(node, 'text', node.textContent, value => { node.textContent = value; });
    }
    document.querySelectorAll('[placeholder],[alt],[aria-label]').forEach(node => {
      if (node.closest('.inventory-product')) return;
      for (const key of ['placeholder','alt','aria-label']) if (node.hasAttribute(key)) update(node,key,node.getAttribute(key),value => node.setAttribute(key,value));
    });
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : lang;
    document.title = ['EVRIS · 店家管理','EVRIS · Store manager','EVRIS · 店舗管理','EVRIS · 매장 관리'][languages.indexOf(lang)];
  }
  const select = document.querySelector('#languageSelect'); select.value = lang;
  select.addEventListener('change', () => { lang = select.value; localStorage.setItem('evrisLanguage',lang); refresh(); });
  new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','alt','aria-label']});
  refresh();
})();
