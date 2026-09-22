import { loadEnvFile } from 'node:process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));
try { loadEnvFile('.env.local'); }
catch { console.error('請先建立並填寫 .env.local；不要在對話中貼出密鑰。'); process.exit(1); }
const missing = [];
if (!/^sk_test_\S+$/.test(process.env.STRIPE_SECRET_KEY || '')) missing.push('STRIPE_SECRET_KEY（Stripe 測試私鑰）');
if (!/^whsec_\S+$/.test(process.env.STRIPE_WEBHOOK_SECRET || '')) missing.push('STRIPE_WEBHOOK_SECRET（本機 Stripe CLI 提供）');
if (process.env.GMAIL_USER !== 'fatchan2019@gmail.com') missing.push('GMAIL_USER（已選擇的寄件 Gmail）');
if (!(process.env.GMAIL_APP_PASSWORD || '').trim()) missing.push('GMAIL_APP_PASSWORD（Google 應用程式密碼）');
try {
  const credential = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  if (credential.type !== 'service_account' || credential.project_id !== 'ecsite-ba325' || !credential.private_key || !credential.client_email) throw new Error();
} catch { missing.push('GOOGLE_APPLICATION_CREDENTIALS（ecsite-ba325 服務帳戶 JSON 檔案路徑）'); }
// Fixed loopback settings keep this launcher local, independent of hosting variables.
Object.assign(process.env, { HOST: '127.0.0.1', PORT: '8081', PUBLIC_ORIGIN: 'http://localhost:8081', STORE_URL: 'http://localhost:8081', GOOGLE_CLOUD_PROJECT: 'ecsite-ba325' });
if (missing.length) {
  console.error('尚未完成以下本機設定（未顯示任何密鑰內容）：\n' + missing.map(x => `- ${x}`).join('\n'));
  process.exit(1);
}
console.log('本機設定格式檢查通過；尚未驗證外部帳戶連線。');
if (!process.argv.includes('--check')) {
  console.log('請保持 Stripe CLI 轉送執行，並開啟 http://localhost:8081/。測試訂單會更新現有 Firebase 庫存，請使用測試商品。');
  await import('./index.mjs');
}
