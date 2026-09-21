# EVRIS Store

Accessory storefront with Firebase Authentication, Cloud Firestore product inventory, a store administration page, member coupons, and a natural-stone 2048 game.

## Local preview

With Python 3 installed:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

- Store: http://localhost:8080/
- Product catalog: http://localhost:8080/products.html
- Store administration: http://localhost:8080/admin.html

The static preview supports Firebase-backed account, catalog, inventory and coupon features once the project and Firestore rules are configured. It does **not** run the checkout API.

## Firebase setup

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for authentication, database rules, product initialization, and deployment requirements.

`firebase-config.js` contains the public web configuration for the owner's Firebase project. A fork should use its own Firebase project and update the administrator authorization in both `firestore.rules` and `firebase-backend.js`. Access must be enforced by published Firestore rules; hiding admin controls is not an authorization mechanism.

Never commit service-account credentials, private keys or `.env` files. Keep Admin SDK credentials outside the publicly served website directory.

## Checkout server

Use Node.js 22 or later. Configure Application Default Credentials and `GOOGLE_CLOUD_PROJECT` as described in the setup guide, then run:

```sh
npm ci
npm start
```

The Node server serves the site and authenticated checkout API at http://127.0.0.1:8081 by default. Production checkout requires a deployed trusted backend with HTTPS. No payment gateway is included.

## Tests

```sh
npm test
node --test gem-archive-2048/tests/*.test.cjs
```

Tests cover local form behavior, coupon ownership and synchronization, inventory conflict handling, and order transactions using test doubles. They do not replace live Firebase/emulator security-rule validation.

## Deployment status

Pushing to GitHub stores the source code; it does not publish a website, deploy Firestore rules, or start the checkout server. GitHub Pages can serve static assets but cannot run the Node checkout API. The legacy `supabase-schema.sql` is retained as a migration reference; the active frontend uses Firebase.

## 測試付款

Stripe 測試付款、付款成功扣庫存、會員 Gmail 確認信已加入後端。網站仍需要配置與部署後端，不能只使用 GitHub Pages 收款。請按 [PAYMENT_SETUP.md](PAYMENT_SETUP.md) 設定。測試版拒絕正式金鑰，不收取真錢。
