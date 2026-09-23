import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { claimCoupon, StoreError } from './orders.mjs';
import { paymentService } from './payment-service.mjs';
import { mailWorker } from './order-mail.mjs';
const app = initializeApp({ credential: applicationDefault(), ...(process.env.GOOGLE_CLOUD_PROJECT ? { projectId: process.env.GOOGLE_CLOUD_PROJECT } : {}) });
const db = getFirestore(app);
const payments = paymentService(db, () => FieldValue.serverTimestamp());
setInterval(() => payments.reconcile().catch(() => console.error('Payment reconciliation unavailable')), 60000).unref();
const processMail = mailWorker(db, () => FieldValue.serverTimestamp());
setInterval(() => processMail().catch(() => console.error('Email queue unavailable')), 30000).unref();
const root = fileURLToPath(new URL('../', import.meta.url));
const rootFiles = new Set(['stock-feedback.js','member-orders.js','checkout-payment.js','admin-language.js','cloudinary-config.js','product-image-upload.js','member-favorites.js','coupon-sync.js','member-coupons.js','admin.html','admin.css','admin.js','inventory-model.js','catalog-live.js','index.html','products.html','product.html','styles.css','script.js','account-auth.js','auth-feedback.js','firebase-config.js','firebase-backend.js','homepage-motion.js','products-data.js','products-page.js','product-page.js']);
const mime = { '.html':'text/html; charset=utf-8', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.json':'application/json' };
const limits = new Map();
function rateLimit(uid) {
  const now = Date.now();
  for (const [key, value] of limits) if (now >= value.until) limits.delete(key);
  const value = limits.get(uid) || { count: 0, until: now + 60000 };
  value.count += 1; limits.set(uid, value);
  if (value.count > 30) throw new StoreError('auth/too-many-requests', 'Please wait before trying again.', 429);
}
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type':'application/json', 'Cache-Control':'no-store' });
  res.end(JSON.stringify(data));
}
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/payments/webhook' && req.method === 'POST') {
      const chunks=[]; let size=0;
      for await (const chunk of req) { size+=chunk.length; if(size>1048576) throw new StoreError('order/invalid-input','Request too large.',413); chunks.push(chunk); }
      await payments.webhook(Buffer.concat(chunks),req.headers['stripe-signature']);
      json(res,200,{received:true});
      processMail().catch(() => console.error('Email queue unavailable'));
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      const origin = req.headers.origin;
      const expected = process.env.PUBLIC_ORIGIN || `http://${req.headers.host}`;
      if (origin && origin !== expected) throw new StoreError('permission-denied', 'Origin not allowed.', 403);
      if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
      if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Headers':'Authorization, Content-Type', 'Access-Control-Allow-Methods':'POST' }); res.end(); return;
      }
      if (req.method !== 'POST') throw new StoreError('app/backend-unavailable', 'Use POST.', 405);
      if (!['/api/checkout/start', '/api/checkout/status', '/api/coupons/claim'].includes(url.pathname)) throw new StoreError('app/backend-unavailable', 'Unknown endpoint.', 404);
      let identity;
      try { identity = await getAuth(app).verifyIdToken((req.headers.authorization || '').replace(/^Bearer /, ''), true); }
      catch { throw new StoreError('auth/login-required', 'Please sign in again.', 401); }
      if (!identity.email_verified) throw new StoreError('auth/login-required', 'Verify your email before continuing.', 403);
      rateLimit(identity.uid);
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 32768) throw new StoreError('order/invalid-input', 'Request too large.', 413);
      }
      let payload;
      try { payload = JSON.parse(body); } catch { throw new StoreError('order/invalid-input', 'Invalid request.'); }
      if (!payload || typeof payload !== 'object') throw new StoreError('order/invalid-input', 'Invalid request.');
      const data = url.pathname === '/api/checkout/start' ? await payments.start(identity,payload)
        : url.pathname === '/api/checkout/status' ? await payments.status(identity,payload)
        : await claimCoupon(db, identity.uid, payload, () => FieldValue.serverTimestamp());
      if (url.pathname === '/api/checkout/status') processMail().catch(() => console.error('Email queue unavailable'));
      json(res, 200, data);
      return;
    }
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    let relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    if (relative.endsWith('/')) relative += 'index.html';
    const extension = path.extname(relative);
    const parts = relative.split('/');
    const allowed = rootFiles.has(relative) || (['assets','gem-archive-2048','stone-archive'].includes(parts[0]) && mime[extension] && !parts.includes('tests'));
    if (!allowed || parts.some(part => part.startsWith('.')) || relative.includes('\\')) { res.writeHead(404); res.end('Not found'); return; }
    const contents = await readFile(path.join(root, relative));
    res.writeHead(200, { 'Content-Type': mime[extension] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Cache-Control':'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : contents);
  } catch (error) {
    if (error.code === 'ENOENT') { res.writeHead(404); res.end('Not found'); return; }
    if (error instanceof StoreError) json(res, error.status, { code: error.code, message: error.message });
    else {
      console.error('Request failed:', error.code || error.name);
      json(res, 503, { code: 'app/backend-unavailable', message: 'The order service is unavailable. Your cart has been kept.' });
    }
  }
}).listen(Number(process.env.PORT || 8081), process.env.HOST || '127.0.0.1', () => {
  console.log(`EVRIS Firebase server: http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 8081}`);
});
