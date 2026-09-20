# 商品圖片上傳設定

Firebase 繼續管理登入、商品與庫存。Cloudinary 只儲存商品圖片。

## Cloudinary

1. 登入 https://console.cloudinary.com/ ，確認 Cloud name 是 `df6dzz15b`。
2. Settings → Upload → Upload presets → Add upload preset。
3. Signing mode 設為 **Unsigned**。
4. Allowed formats 設為 `jpg,jpeg,png,webp`，Maximum file size 設為 **5 MB**（若欄位使用 bytes，輸入 `5242880`）。
5. 建議設定專用資料夾 `evris-products`，保留 unique filenames，禁止覆蓋現有圖片。
6. 儲存後，將 preset 名稱填入 `cloudinary-config.js` 的 `uploadPreset`。Cloud name 及 unsigned preset 是公開設定；不要加入 API Secret。

Unsigned preset 可以被取得設定的人用來上傳，並不受 Firebase 管理員規則保護。必須在 Cloudinary preset 本身設定檔案大小及格式限制；瀏覽器端限制只是輔助。若日後需要每次上傳都驗證店家身份，可改由可信任後端簽署上傳請求。

## Firebase

在 Firebase Console → Firestore Database → Rules，使用本專案完整 `firestore.rules` 檔案取代編輯器內容並發布。新版規則允許 HTTPS 圖片網址；商品寫入仍只限已授權店家。

不要只貼其中一段規則。未更新規則時，Cloudinary 圖片可以上傳，但商品儲存會被舊規則拒絕。

## 操作

後台編輯商品 → 選擇圖片 → 查看預覽 → 上傳圖片 → 儲存並更新商店。
上傳未完成時不能儲存商品；失敗可重試或取消，原有商品圖片不變。
上傳後未儲存商品或取消編輯，Cloudinary 中可能保留未使用圖片，可在 Media Library 管理。更換商品圖片不會自動刪除舊圖片。

仍可直接填寫既有 assets/ 路徑或公開 HTTPS 圖片網址。

參考：https://cloudinary.com/documentation/upload_images#unsigned_upload
