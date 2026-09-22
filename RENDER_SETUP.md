# 免費網上測試部署

目前只是課堂／測試付款，不接受真錢。GitHub Pages 保留前端，Render Web Service 運行 Node 後端，Firebase 保留訂單及庫存。

## 1 建立 Render Web Service

登入 https://dashboard.render.com/ ，選 New → Web Service，連接 TysonOn91018/evris-store 的 main 分支。
Runtime 選 Docker（使用現有 Dockerfile），Instance Type 選 Free。不要建立 Postgres；現有 Firebase 已負責資料庫。
環境變數：

```text
HOST=0.0.0.0
GOOGLE_CLOUD_PROJECT=ecsite-ba325
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-service-account.json
PUBLIC_ORIGIN=https://tysonon91018.github.io
STORE_URL=https://tysonon91018.github.io/evris-store
STRIPE_SECRET_KEY=填入沙盒私鑰
STRIPE_WEBHOOK_SECRET=填入此雲端 endpoint 的 signing secret
MAIL_TRANSPORT=gmail-api
GMAIL_USER=fatchan2019@gmail.com
GMAIL_CLIENT_ID=填入 OAuth client ID
GMAIL_CLIENT_SECRET=填入 OAuth client secret
GMAIL_REFRESH_TOKEN=填入店家授權產生的 refresh token
```

在 Render Secret Files 加入 firebase-service-account.json，內容為本機已下載的 Firebase 服務帳戶 JSON。不要把秘密加進 GitHub 或對話。這些設定完成前不要將前端切換過去。

## 2 Gmail HTTPS 寄信

Render 免費版封鎖 SMTP 25/465/587，Google 應用程式密碼不能直接用於 Gmail API。
在 Google Cloud 專案 ecsite-ba325 啟用 Gmail API，設定 Google Auth Platform 的 OAuth 同意畫面，External／Testing，將寄件 Gmail 加為 test user。
建立 Web application OAuth client；若使用 Google OAuth Playground，將 https://developers.google.com/oauthplayground 加入 authorized redirect URIs。
在 https://developers.google.com/oauthplayground 的設定選 Use your own OAuth credentials，填入自己的 client ID / secret。
只選 https://www.googleapis.com/auth/gmail.send，使用 fatchan2019@gmail.com 親自授權，交換 authorization code 取得 refresh token。將三項 OAuth 值填入 Render secrets。不要分享 token。

Google External／Testing 的 refresh token 通常七日後到期，屆時要重新授權更新。測試期間只授權店家寄件帳戶，不要求顧客授權 Gmail。不要未經評估就切成正式公開 OAuth 應用。

## 3 Stripe 網上通知及前端

取得 Render HTTPS 網址後，在同一個 Stripe 沙盒建立 webhook：
`https://你的服務.onrender.com/api/payments/webhook`
事件：checkout.session.completed、checkout.session.expired、checkout.session.async_payment_succeeded。
將此 endpoint 的 whsec_ 密鑰填入 Render 的 STRIPE_WEBHOOK_SECRET，不能沿用本機 CLI 的 signing secret。
成功部署後才把 firebase-config.js 的 EVRIS_API_BASE 改成 Render HTTPS 網址，更新 HTML 的 config 版本號並推送 GitHub。
完整測試步驟見 PAYMENT_SETUP.md。測試會修改現有 Firebase 商品庫存；只用測試商品。

## 免費方案限制

Render 閒置 15 分鐘後休眠，重新喚醒約一分鐘；課堂示範前先開後端首頁等載入完成再結帳，否則可能超過前端 20 秒 timeout。休眠時不能保證立即寄信／處理背景佇列；Stripe webhook 有重試，應以訂單實際狀態為準。免費額度用盡亦可能暫停，並非永久無限或正式商店的可用性保證。
API 寄信仍可能在 Google 接受後、伺服器未記錄前中斷而重複寄出；沿用既有寄信佇列重試與付款冪等處理。

官方文件：https://render.com/docs/free 、 https://developers.google.com/workspace/gmail/api/guides/sending 、 https://developers.google.com/identity/protocols/oauth2
