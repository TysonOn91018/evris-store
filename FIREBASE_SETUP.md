# EVRIS Firebase setup

## Status

The website now uses Firebase Authentication and Cloud Firestore. `firebase-config.js` now contains the supplied public web configuration for `ecsite-ba325`. Authentication configuration is now available. A sign-in probe using synthetic credentials returned `INVALID_LOGIN_CREDENTIALS`, confirming the email/password endpoint responds. A real account signup, email verification and successful login have not yet been tested. Authorized domains currently include `localhost`, `ecsite-ba325.firebaseapp.com` and `ecsite-ba325.web.app`; use localhost for local testing. No remote project settings or data have been changed. Old Supabase SQL is retained as a migration reference; the website no longer loads or contacts Supabase.

## Connect the project (no billing upgrade required for Auth + Firestore within Spark quotas)

1. Create or open a project at https://console.firebase.google.com/ using the Spark plan.
2. Register a Web app. Copy the public `firebaseConfig` into `firebase-config.js` (apiKey, authDomain, projectId, appId). These web values are public identifiers, not Admin credentials.
3. In Authentication → Sign-in method, enable Email/Password. Under Settings → Authorized domains, add the actual website host; add `127.0.0.1` and `localhost` for this local preview as appropriate. Configure the verification/password-reset email templates. The Firebase-hosted reset page handles the password change.
4. Create a Cloud Firestore database in production mode. Choose its region carefully before creation.
5. Publish `firestore.rules` and `firestore.indexes.json` to that project, using the Firebase Console or Firebase CLI: `firebase deploy --only firestore --project YOUR_PROJECT_ID`. Never select open/test rules.
6. Refresh the website. Create a test account, verify its email, then sign in. Verify profile/address persistence, password-reset email delivery, private-data isolation, reviews and favorites.

Existing Supabase users/data are NOT migrated automatically. Do not delete the old project. Confirm whether real data exists before planning export/import and account migration.

## Trusted order service

Firestore client rules intentionally prohibit browser writes to orders, prices, stock and coupons. `server/index.mjs` uses the Firebase Admin SDK and verifies Firebase ID tokens. It serves the website and `/api/orders` and `/api/coupons/claim` together. Checkout requires a verified signed-in account. Order records are not payment confirmations; no payment gateway is implemented.

Local setup:

- `npm install`
- Set `GOOGLE_CLOUD_PROJECT` to the selected project ID.
- Set `GOOGLE_APPLICATION_CREDENTIALS` to an Admin service-account JSON file stored OUTSIDE this website directory, or use Application Default Credentials from the host. Never paste this JSON into `firebase-config.js`, chat, or frontend files.
- Run `npm run seed:firebase` to create missing catalog entries. This preserves existing records, initializes stock to zero, and does not import customers/orders. Set real stock levels using trusted admin access.
- Run `npm start`, then open http://127.0.0.1:8081 . The static Python preview on port 8080 cannot execute the order API.

For production, deploy this Node server to a trusted Node-capable host, configure server credentials, `HOST=0.0.0.0`, its assigned `PORT`, and `PUBLIC_ORIGIN=https://your-store-domain`. Serve over HTTPS. When frontend/API are separate, set `EVRIS_API_BASE` in `firebase-config.js` to the HTTPS API origin and set `PUBLIC_ORIGIN` to the exact frontend origin.

Hosting this server is a separate requirement: Firebase Spark alone does not deploy it. No paid Cloud Functions, Cloud Run, billing account, hosting subscription or Firebase project was enabled by this change. Choose hosting and its costs before production deployment.

Orders use Firestore transactions for authoritative prices, stock and coupon ownership/redemption. In-page retries reuse a request ID. Stock is reduced only when the order is created. Game claims retain the existing client-reported milestone trust model; the server validates reward tiers and limits claims to one per user/tier, but does not prove gameplay. Rate limits in this single-process server are basic and should be backed by shared edge limits for a scaled public launch.

## Validation

`npm test` covers error classification, fail-closed unconfigured Firebase behavior, local form validation, order price/quantity handling, retry idempotency, stock checks and coupon ownership/redemption with transaction doubles. These are not live Firebase tests. No Java runtime is available here, so Firestore Emulator rules tests have not been executed. Validate rules with the emulator and perform live email/session testing before production deployment.

Official references:
- https://firebase.google.com/docs/web/setup
- https://firebase.google.com/docs/auth/web/start
- https://firebase.google.com/docs/firestore/security/get-started
- https://firebase.google.com/pricing


## Store inventory manager

- Open `/admin.html`. The explicitly authorized store account is `fatchan2019@gmail.com`, with verified email. This authorization is enforced in `firestore.rules`, not just in the page. The public email in the JS does not grant access without published rules.
- A live check returned `SERVICE_DISABLED` for Cloud Firestore. First create the default Firestore database from the Firebase Console (production mode), then publish the updated rules and indexes. No remote rules have been deployed by this change.
- Sign in to the manager and use “匯入現有商品” to initialize the 16 existing products at zero stock. No live import has been performed automatically. Enter actual stock; do not assume sample inventory.
- Edit names, whole-RMB prices, descriptions, material/style text, local image paths and visibility, or add a new product. New images must be added to the site's `assets` directory separately; file uploads and arbitrary page-code editing are outside this manager.
- “補貨” adds to the latest stock in a transaction; “盤點” refuses stale absolute counts. Concurrent metadata edits are rejected using revisions. The storefront listens for active catalog changes and displays exact stock on detail pages; missing connectivity shows an unavailable message.
- Product descriptions entered in the manager are shown as entered across languages; automatic translation is not provided.
- Rules still require emulator/live validation before production. Tests use transaction doubles, not live administrative writes.


## Direct game coupon synchronization

Game rewards now use a Firestore transaction directly; `/api/coupons/claim` is no longer required by the browser. Publish the latest `firestore.rules` before using this flow. Verified users may create only the fixed tier discounts (256 → 3%, 512 → 5%, 1024 → 8%, 2048 → 10%) for the three supported reward products. A deterministic user/tier document ID plus an atomic immutable claim prevents repeat issuance; clients cannot change redemption state or delete a claim. Existing server-issued claims remain readable and their current redemption state is preserved.

The member center has a “同步優惠券” button. It uploads local pending rewards to the signed-in account, updates local codes only after success, retains rewards on failure, and excludes device records assigned to another user. Existing device-only rewards are still client-reported game achievements, as in the original system; neither implementation proves gameplay. Checkout remains a separate trusted backend requirement.

41 local tests passed after this change, including mocked transaction issuance, duplicate/redeemed claims and local failure preservation. Live Firestore rules and real account synchronization still require verification after publication.
