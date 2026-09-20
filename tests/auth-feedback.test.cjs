const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const path = require('node:path');
const read = name => readFileSync(path.join(__dirname, '..', name), 'utf8');
function feedback(lang = 'en') {
  const window = {};
  runInNewContext(read('auth-feedback.js'), { window, localStorage: { getItem: () => lang }, setTimeout: callback => callback() });
  return window.EvrisAuthFeedback;
}
test('network failures never blame credentials; known auth failures have distinct guidance', () => {
  const api = feedback();
  for (const message of ['Failed to fetch', 'Load failed', 'NetworkError when attempting to fetch resource.']) {
    assert.equal(api.classify({ message }), 'network');
  }
  assert.equal(api.classify({ code: 'invalid_credentials' }), 'credentials');
  assert.equal(api.classify({ code: 'email_not_confirmed' }), 'unconfirmed');
  assert.equal(api.classify({ status: 429 }), 'rate');
  assert.equal(api.classify({ status: 503 }), 'server');
  assert.equal(api.classify({ message: 'Invalid API key' }), 'config');
  assert.equal(api.classify({ message: '<secret server detail>' }), 'generic');
  for (const lang of ['en', 'zh', 'ja', 'ko']) {
    assert.ok(feedback(lang).text('network').length > 30);
  }
});
function element(value = '') {
  return { value, validity: { valid: true }, attrs: {}, classList: { toggle() {}, remove() {} },
    setAttribute(k, v) { this.attrs[k] = v; }, removeAttribute(k) { delete this.attrs[k]; }, focus() { this.focused = true; } };
}
test('validation identifies the field and permits short existing login passwords', () => {
  const api = feedback('zh'), email = element('bad'), password = element('123'), message = element();
  const form = { querySelector: s => s.includes('email') ? email : password };
  email.validity.valid = false;
  assert.equal(api.validate(form, message, 'login'), false);
  assert.equal(email.attrs['aria-invalid'], 'true');
  assert.match(message.textContent, /格式/);
  email.value = 'test@example.com'; email.validity.valid = true;
  assert.equal(api.validate(form, message, 'login'), true);
  assert.equal(api.validate(form, message, 'create'), false);
  assert.equal(password.attrs['aria-invalid'], 'true');
  assert.equal(api.validate(form, message, 'login', true), true);
});
async function submitHome(client) {
  const source = read('script.js');
  const start = source.indexOf('accountForm.addEventListener("submit", async (event) => {');
  const end = source.indexOf('\nforgotPasswordButton.addEventListener', start);
  let submit, signedIn = false;
  const message = element();
  const fields = { email: element(), password: element() };
  const context = {
    accountForm: { addEventListener(_name, fn) { submit = fn; }, reset() {}, querySelector: selector => fields[selector.includes("email") ? "email" : "password"] },
    member: null, accountModal: { classList: { contains: () => true } },
    setAccountMode(mode) { context.accountMode = mode; },
    accountSubmit: { disabled: false }, accountMessage: message, accountMode: 'create',
    authFeedback: { ...feedback(), validate: () => true }, backendClient: client,
    FormData: class { get(k) { return { email: 'test@example.com', password: 'test-only' }[k]; } },
    setMemberFromUser() { signedIn = true; }, updateMemberUi() {}, saveProfileToBackend: async () => {},
  };
  runInNewContext(source.slice(start, end), context);
  await submit({ preventDefault() {} });
  return { signedIn, message: message.textContent, disabled: context.accountSubmit.disabled };
}
test('missing auth SDK never creates a local login', async () => {
  const result = await submitHome(null);
  assert.equal(result.signedIn, false);
  assert.match(result.message, /did not load/);
});
test('registration without a session asks for confirmation rather than logging in', async () => {
  const result = await submitHome({ auth: { signUp: async () => ({ data: { user: { id: 'test' }, session: null } }) } });
  assert.equal(result.signedIn, false);
  assert.match(result.message, /confirmation/);
  assert.equal(result.disabled, false);
});
test('failed request leaves the form retryable with connection guidance', async () => {
  const result = await submitHome({ auth: { signUp: async () => { throw new TypeError('Failed to fetch'); } } });
  assert.equal(result.signedIn, false);
  assert.match(result.message, /Cannot connect/);
  assert.equal(result.disabled, false);
});
test('verification reminder precedes login by three seconds and keeps email but clears password', async () => {
  const window = {}; let advance, delay;
  runInNewContext(read('auth-feedback.js'), { window, localStorage: { getItem: () => 'zh' }, setTimeout(callback, ms) { advance = callback; delay = ms; } });
  const email = element(), password = element('old-password'), message = element();
  const form = { reset() {}, querySelector: selector => selector.includes('email') ? email : password };
  let mode = 'create';
  const done = window.EvrisAuthFeedback.confirmThenLogin(form, message, 'test@example.com', () => { mode = 'login'; }, () => true);
  assert.equal(mode, 'create');
  assert.equal(delay, 3000);
  assert.match(message.textContent, /垃圾郵件/);
  assert.equal(email.value, 'test@example.com');
  assert.equal(password.value, '');
  advance(); await done;
  assert.equal(mode, 'login');
  assert.match(message.textContent, /垃圾郵件/);
  assert.equal(password.focused, true);
});
test('delayed login transition leaves a closed panel alone', async () => {
  const window = {}; let advance;
  runInNewContext(read('auth-feedback.js'), { window, localStorage: { getItem: () => 'en' }, setTimeout(callback) { advance = callback; } });
  const field = element(), message = element(); let switched = false;
  const done = window.EvrisAuthFeedback.confirmThenLogin({ reset() {}, querySelector: () => field }, message, 'test@example.com', () => { switched = true; }, () => false);
  advance(); await done;
  assert.equal(switched, false);
});
