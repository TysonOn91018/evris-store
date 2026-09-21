# EVRIS 測試付款設定

此版本只接受 Stripe 測試金鑰 `sk_test_`，拒絕正式付款事件，不收取真錢。
程式已完成，但必須設定帳戶和部署後端才能實際測試付款及寄信。

## 1 Stripe 測試環境

建立 Stripe 帳戶：https://dashboard.stripe.com/register
在 Sandbox／測試環境取得 Secret key。只在後端環境變數設定，不要貼到聊天、Firebase web config 或 GitHub。

建立 webhook，URL 是 `https://你的後端/api/payments/webhook`，選擇：
- checkout.session.completed
- checkout.session.expired
- checkout.session.async_payment_succeeded

把該 endpoint 的 Signing secret 設為 `STRIPE_WEBHOOK_SECRET`。
目前只開放卡片付款。測試卡可使用 4242 4242 4242 4242、未來有效期及任意三位 CVC。不要使用真實信用卡。

## 2 Firebase 後端身份

後端使用 Firebase Admin SDK，必須有專案 `ecsite-ba325` 的服務帳戶權限。
若在 Google Cloud 執行，可使用執行環境的服務帳戶；其他平台請以平台的 Secret File 功能掛載服務帳戶 JSON。
設定 `GOOGLE_APPLICATION_CREDENTIALS` 為該 secret file 的絕對路徑。
**不要將 JSON 加入 repository，亦不要在對話中提供。**

現有 Firestore catch-all 規則已禁止前端存取 payment_stock、payment_coupons 和 order_mail。
它們只由 Admin SDK 寫入。會員只可讀取自己的訂單。

## 3 Gmail 寄信

寄件 Gmail 必須先開啟 Google 兩步驟驗證，再建立應用程式密碼。
說明：https://support.google.com/accounts/answer/185833
設定 `GMAIL_USER` 及 `GMAIL_APP_PASSWORD`。使用應用程式密碼，不能填日常登入密碼。
若帳戶不提供應用程式密碼，需改用 OAuth 或其他寄件服務；不要關閉安全驗證。
收件人固定使用 Firebase token 中的已驗證會員電郵；結帳表格不能替換收件人。
信件會清楚標明測試付款，包含訂單編號、商品數量、折扣、CNY 總額及配送資料。

## 4 部署 Node 後端

GitHub Pages 仍負責靜態網站。另選支援 Node 及 HTTPS 的主機執行：

```
npm ci
npm start
```

所需環境變數：

```
HOST=0.0.0.0
GOOGLE_CLOUD_PROJECT=ecsite-ba325
GOOGLE_APPLICATION_CREDENTIALS=/平台secret檔案路徑/service-account.json
PUBLIC_ORIGIN=https://tysonon91018.github.io
STORE_URL=https://tysonon91018.github.io/evris-store
STRIPE_SECRET_KEY=sk_test_由Stripe取得
STRIPE_WEBHOOK_SECRET=whsec_由Stripe取得
GMAIL_USER=fatchan2019@gmail.com
GMAIL_APP_PASSWORD=Google應用程式密碼
```

PORT 使用主機提供的值。PUBLIC_ORIGIN 只有 origin，不含 /evris-store 路徑。
在 `firebase-config.js` 將 `window.EVRIS_API_BASE` 設為後端 HTTPS 網址（無尾斜線），並更新各 HTML 對此檔案的版本號再部署。
後端不可放到 GitHub Pages 代替執行。沒有接入時，前端會保留購物車並提示服務未連接。

## 5 驗證流程

1. 用測試商品，設定至少 5 件庫存；登入已驗證會員。
2. 加入 2 件，套用適用優惠券，前往 Stripe 測試付款。
3. 付款前只預留數量，不改動商品的 physical stock。其他結帳會扣除預留數量再判斷是否有貨。
4. 付款成功後，webhook 或返回頁的伺服器查詢會確認 Stripe 真實狀態、金額、貨幣與 session ID，再以 Firestore transaction 扣 2 件並核銷優惠券。
5. 收件會員收到標有 TEST 的確認信。寄信失敗會保留佇列，服務每 30 秒重試。狀態頁可按按鈕更新。
6. 重送同一 webhook／重新整理付款返回頁，確認庫存不重複扣減。
7. 在 Stripe 頁按返回取消，網站會請伺服器令尚未付款的 session 失效並解除預留。直接關閉頁面則等待約 35 分鐘到期。
8. 到期 webhook 解除預留；後端每 60 秒亦查核逾期 pending 訂單。主機休眠期間須待喚醒或 Stripe 重試，不能承諾即時更新。

## 目前界線

- 結算使用 CNY 的整數分；網站其他貨幣是參考換算。測試版運費及禮物包裝為零；正式上線前需確定真實費用。
- 最終付款金額介乎 CNY 4 至 CNY 999,999.99。價格、折扣、數量及庫存均由伺服器驗證。
- 店家在顧客付款途中修改庫存導致不足，訂單會標為 payment_review，不會扣成負數；需要人手查核，不應當成可出貨訂單。
- 只有成功確認付款才清除已購買數量；清理購物車的瀏覽器標記避免重新整理後再次扣除。
- Gmail SMTP 沒有供應商冪等 API。佇列鎖可避免一般重複通知及同時寄送，但 SMTP 接受信件後伺服器崩潰、尚未記錄 sent 時，重試仍可能重複寄信。庫存 transaction 不受影響。
- 寄件伺服器接受信件不等於客戶已讀或保證進入收件匣；信件可能進入垃圾郵件。
- 本版不提供正式收款、退款或實際發貨。不要換上正式金鑰繞過測試限制。

## 依賴檢查

本次 npm audit 顯示原有 firebase-admin 13 依賴鏈有 8 項 moderate 警告；Stripe 與 nodemailer 新增依賴未列入警告。升級 firebase-admin 14 涉及主要版本變更，正式部署前需另外驗證及處理，不能將本次測試視為正式上線審核。
