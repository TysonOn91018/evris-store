const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const path = require('node:path');
test('missing Firebase config fails closed without loading the SDK or reporting a session', async () => {
  const window = { EVRIS_FIREBASE_CONFIG: {} };
  runInNewContext(readFileSync(path.join(__dirname, '../firebase-backend.js'), 'utf8'), { window });
  const backend = window.EvrisBackend;
  const session = await backend.auth.getSession();
  assert.equal(session.data.session, null);
  assert.equal(session.error.code, 'app/not-configured');
  for (const response of [await backend.auth.signInWithPassword({ email: 'test@example.com', password: 'test' }), await backend.placeOrder({}), await backend.subscribe('test@example.com')]) {
    assert.equal(response.data, null);
    assert.equal(response.error.code, 'app/not-configured');
  }
});
test('Firebase authentication errors retain actionable localized feedback', () => {
  const window = {};
  runInNewContext(readFileSync(path.join(__dirname, '../auth-feedback.js'), 'utf8'), { window, localStorage: { getItem: () => 'en' } });
  for (const [code, expected] of Object.entries({ 'auth/invalid-credential':'credentials', 'auth/network-request-failed':'network', 'auth/unverified-email':'unconfirmed', 'app/not-configured':'firebaseConfig', 'permission-denied':'permission', 'order/out-of-stock':'stock' })) {
    assert.equal(window.EvrisAuthFeedback.classify({ code }), expected);
  }
});

function signupHarness({ verificationError = null } = {}) {
  const events = [];
  const stored = new Map();
  const user = { uid: 'test-user', email: 'test@example.com', metadata: { creationTime: 'now' }, emailVerified: false };
  const auth = { authStateReady: async () => {} };
  const modules = {
    'firebase-app.js': { initializeApp: () => ({}) },
    'firebase-auth.js': {
      getAuth: () => auth,
      createUserWithEmailAndPassword: async () => { events.push('created'); return { user }; },
      sendEmailVerification: async () => { events.push('email'); if (verificationError) throw verificationError; },
      signOut: async () => { events.push('signOut'); },
    },
    'firebase-firestore.js': {
      getFirestore: () => ({}), doc: () => ({}),
      setDoc: () => { events.push('firestore-write'); return new Promise(() => {}); },
    },
  };
  const window = { EVRIS_FIREBASE_CONFIG: { apiKey: 'test', authDomain: 'test', projectId: 'test', appId: 'test' } };
  const source = readFileSync(path.join(__dirname, '../firebase-backend.js'), 'utf8').replaceAll('import(`${sdkRoot}', 'mockImport(`${sdkRoot}');
  runInNewContext(source, {
    window,
    localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
    mockImport: async url => modules[url.split('/').at(-1)],
  });
  return { backend: window.EvrisBackend, events, stored };
}
test('signup returns verification success without waiting for an offline Firestore write', async () => {
  const { backend, events, stored } = signupHarness();
  let timer;
  try {
    const response = await Promise.race([
      backend.auth.signUp({ email: 'test@example.com', password: 'test-only', options: { data: { birthday_month: '9' } } }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Signup was blocked by profile persistence')), 300); }),
    ]);
    assert.equal(response.error, null);
    assert.equal(response.data.session, null);
    assert.equal(response.data.user.user_metadata.birthday_month, '9');
    assert.equal(stored.get('evrisPendingBirthday:test-user'), '9');
    assert.deepEqual(events, ['created', 'email', 'signOut']);
  } finally { clearTimeout(timer); }
});
test('failed verification delivery reports the error instead of claiming the email was sent', async () => {
  const failure = { code: 'auth/too-many-requests' };
  const { backend, events } = signupHarness({ verificationError: failure });
  const response = await backend.auth.signUp({ email: 'test@example.com', password: 'test-only' });
  assert.equal(response.error, failure);
  assert.equal(response.data, null);
  assert.deepEqual(events, ['created', 'email', 'signOut']);
});
test('member UI updates immediately when profile loading is stalled, and late data cannot restore a logged-out user', async () => {
  const source = readFileSync(path.join(__dirname, '../account-auth.js'), 'utf8');
  const start = source.indexOf('  let sessionRevision = 0;');
  const end = source.indexOf('  function setMemberFromUser', start);
  let resolveProfile, renders = 0;
  const context = {
    member: null, console,
    loadProfile: () => new Promise(resolve => { resolveProfile = resolve; }),
    createProfile: async () => null,
    setMemberFromUser(user) { context.member = user; },
    updateMemberUi() { renders++; }, saveMember() {},
  };
  runInNewContext(source.slice(start, end), context);
  context.applySession({ id: 'test-user', email: 'test@example.com' });
  assert.equal(context.member.id, 'test-user');
  assert.equal(renders, 1);
  context.applySession(null);
  resolveProfile({ rank: 'Silver' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.member, null);
  assert.equal(renders, 2);
});
