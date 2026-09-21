(() => {
  const config = window.EVRIS_FIREBASE_CONFIG || {};
  const sdkRoot = 'https://www.gstatic.com/firebasejs/12.19.0/';
  let initialization;
  function failure(code, message = code) { return Object.assign(new Error(message), { code }); }
  function initialize() {
    if (!initialization) initialization = (async () => {
      if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
        throw failure('app/not-configured', 'Firebase web configuration is missing.');
      }
      const [appSdk, authSdk, dbSdk] = await Promise.all([
        import(`${sdkRoot}firebase-app.js`), import(`${sdkRoot}firebase-auth.js`), import(`${sdkRoot}firebase-firestore.js`),
      ]);
      const app = appSdk.initializeApp(config);
      const auth = authSdk.getAuth(app);
      const db = dbSdk.getFirestore(app);
      await auth.authStateReady();
      return { auth, db, a: authSdk, d: dbSdk };
    })().catch(error => { initialization = undefined; throw error; });
    return initialization;
  }
  function pendingBirthday(uid) {
    try { return localStorage.getItem(`evrisPendingBirthday:${uid}`) || ''; }
    catch { return ''; }
  }
  const userView = user => user && ({
    id: user.uid, email: user.email, created_at: user.metadata.creationTime,
    user_metadata: { birthday_month: pendingBirthday(user.uid) },
  });
  const sessionView = user => user?.emailVerified ? { user: userView(user) } : null;
  async function result(task) {
    try { return { data: await task(await initialize()), error: null }; }
    catch (error) { return { data: null, error }; }
  }
  function requireUser(auth) {
    if (!auth.currentUser) throw failure('auth/login-required');
    return auth.currentUser;
  }
  async function inventoryDeadline(promise) {
    let timer;
    try {
      return await Promise.race([promise, new Promise((_, reject) => {
        timer = setTimeout(() => reject(failure('inventory/timeout', 'Inventory request timed out')), 12000);
      })]);
    } finally { clearTimeout(timer); }
  }
  const backend = {
    auth: {
      getSession: async () => {
        const response = await result(async ({ auth }) => ({ session: sessionView(auth.currentUser) }));
        return { ...response, data: response.data || { session: null } };
      },
      getUser: async () => {
        const response = await backend.auth.getSession();
        return { ...response, data: { user: response.data.session?.user || null } };
      },
      signInWithPassword: ({ email, password }) => result(async ({ auth, a }) => {
        const { user } = await a.signInWithEmailAndPassword(auth, email, password);
        if (!user.emailVerified) {
          await a.signOut(auth);
          throw failure('auth/unverified-email');
        }
        return { user: userView(user), session: sessionView(user) };
      }),
      signUp: ({ email, password, options }) => result(async ({ auth, a }) => {
        const { user } = await a.createUserWithEmailAndPassword(auth, email, password);
        try {
          await a.sendEmailVerification(user);
          // Firestore writes can wait indefinitely while offline. Never gate the
          // verification message on an optional profile write. Save after login.
          try { localStorage.setItem(`evrisPendingBirthday:${user.uid}`, options?.data?.birthday_month || ''); }
          catch { /* Optional birthday persistence must not block registration. */ }
        } finally { await a.signOut(auth); }
        return { user: userView(user), session: null };
      }),
      resetPasswordForEmail: email => result(async ({ auth, a }) => {
        // Firebase's hosted action handler completes password changes (no custom reset page needed).
        await a.sendPasswordResetEmail(auth, email);
        return {};
      }),
      resendVerification: ({ email, password }) => result(async ({ auth, a }) => {
        const { user } = await a.signInWithEmailAndPassword(auth, email, password);
        try { if (!user.emailVerified) await a.sendEmailVerification(user); }
        finally { await a.signOut(auth); }
        return {};
      }),
      signOut: () => result(async ({ auth, a }) => { await a.signOut(auth); return {}; }),
      onAuthStateChange(callback) {
        let unsubscribe, cancelled = false, lastUid;
        initialize().then(({ auth, a }) => {
          if (!cancelled) unsubscribe = a.onAuthStateChanged(auth, user => {
            const session = sessionView(user);
            const uid = session?.user.id || null;
            if (uid !== lastUid) { lastUid = uid; callback('SESSION_CHANGED', session); }
          });
        }).catch(() => callback('SESSION_CHANGED', null));
        return { unsubscribe() { cancelled = true; unsubscribe?.(); } };
      },
    },
    async adminStatus() {
      return result(async ({ auth }) => {
        const user = requireUser(auth);
        const token = await user.getIdTokenResult(true);
        return { admin: user.emailVerified && (token.claims.admin === true || user.email === 'fatchan2019@gmail.com'), email: user.email };
      });
    },
    listInventory: () => result(async ({ auth, db, d }) => {
      const token = await requireUser(auth).getIdTokenResult();
      if (!token.claims.admin && auth.currentUser.email !== 'fatchan2019@gmail.com') throw failure('permission-denied');
      const snapshot = await inventoryDeadline(d.getDocs(d.collection(db, 'products')));
      return snapshot.docs.map(item => ({ ...item.data(), slug: item.id }));
    }),
    saveInventory: (slug, values, expected, adjustment = null) => result(async ({ auth, db, d }) => {
      const token = await requireUser(auth).getIdTokenResult();
      if (!token.claims.admin && auth.currentUser.email !== 'fatchan2019@gmail.com') throw failure('permission-denied');
      if (!/^[a-z0-9-]{1,100}$/.test(slug)) throw failure('inventory/invalid-id');
      const ref = d.doc(db, 'products', slug);
      return d.runTransaction(db, async tx => {
        const snapshot = await tx.get(ref);
        const previous = snapshot.exists() ? snapshot.data() : null;
        if ((previous?.revision || 0) !== (expected?.revision || 0) || Boolean(previous) !== Boolean(expected)) throw failure('inventory/conflict');
        if (adjustment === null && previous && previous.stock !== expected.stock) throw failure('inventory/conflict');
        if (adjustment !== null && (!Number.isSafeInteger(adjustment) || adjustment <= 0)) throw failure('inventory/invalid-stock');
        const updated = window.EvrisInventory.validate({ ...values, stock: adjustment === null ? values.stock : (previous?.stock || 0) + adjustment });
        tx.set(ref, { ...updated, slug, revision: (previous?.revision || 0) + 1, updated_at: d.serverTimestamp() }, { merge: true });
        return {};
      });
    }),
    watchProducts(onData, onError) {
      let unsubscribe, cancelled = false;
      initialize().then(({ db, d }) => {
        if (!cancelled) unsubscribe = d.onSnapshot(d.query(d.collection(db, 'products'), d.where('is_active', '==', true)), snapshot => onData(snapshot.docs.map(item => ({ ...item.data(), slug: item.id }))), onError);
      }).catch(onError);
      return () => { cancelled = true; unsubscribe?.(); };
    },
    watchMemberCoupons(uid, onData, onError) {
      let unsubscribe, cancelled = false;
      initialize().then(({ auth, db, d }) => {
        if (cancelled) return;
        if (!auth.currentUser?.emailVerified || auth.currentUser.uid !== uid) throw failure('permission-denied');
        unsubscribe = d.onSnapshot(d.query(d.collection(db, 'game_coupons'), d.where('user_id', '==', uid)), snapshot => {
          if (!cancelled) onData(snapshot.docs.map(item => ({ ...item.data(), id: item.id })));
        }, error => { if (!cancelled) onError(error); });
      }).catch(error => { if (!cancelled) onError(error); });
      return () => { cancelled = true; unsubscribe?.(); };
    },
    getProfile: id => result(async ({ db, d }) => {
      const snapshot = await d.getDoc(d.doc(db, 'profiles', id));
      return snapshot.exists() ? snapshot.data() : null;
    }),
    saveProfile: (id, values) => result(async ({ auth, db, d }) => {
      const user = requireUser(auth);
      if (id !== user.uid) throw failure('permission-denied');
      const ref = d.doc(db, 'profiles', id);
      await d.runTransaction(db, async transaction => {
        const previous = await transaction.get(ref);
        const editable = {};
        for (const key of ['birthday_month', 'shipping_address']) {
          if (values[key] !== undefined && values[key] !== null) editable[key] = values[key];
        }
        transaction.set(ref, previous.exists() ? editable : {
          email: user.email, shipping_address: '', rank: 'Silver', points: 0, ...editable,
          birthday_month: editable.birthday_month || pendingBirthday(user.uid),
        }, { merge: true });
      });
      try { localStorage.removeItem(`evrisPendingBirthday:${user.uid}`); } catch {}
      return {};
    }),
    getReviews: slug => result(async ({ db, d }) => {
      const snapshot = await d.getDocs(d.query(d.collection(db, 'reviews'), d.where('product_slug', '==', slug), d.orderBy('created_at', 'desc'), d.limit(50)));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }),
    addReview: review => result(async ({ auth, db, d }) => {
      const user = requireUser(auth);
      await d.addDoc(d.collection(db, 'reviews'), {
        product_slug: review.product_slug, rating: review.rating, comment: review.comment,
        user_id: user.uid, user_email: 'EVRIS member', created_at: d.serverTimestamp(),
      });
      return {};
    }),
    setFavorite: (product, saved) => result(async ({ auth, db, d }) => {
      const user = requireUser(auth);
      const ref = d.doc(db, 'profiles', user.uid, 'favorites', product.id);
      if (saved) await d.setDoc(ref, { product_slug: product.id, product_name: product.title, image_url: product.image });
      else await d.deleteDoc(ref);
      return {};
    }),
    subscribe: email => result(async ({ db, d }) => {
      await d.addDoc(d.collection(db, 'newsletter_subscribers'), { email, created_at: d.serverTimestamp() });
      return {};
    }),
    async request(path, payload) {
      return result(async ({ auth }) => {
        const user = requireUser(auth);
        const token = await user.getIdToken();
        const response = await fetch(`${window.EVRIS_API_BASE || ''}/api/${path}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload), signal: AbortSignal.timeout(20000),
        });
        if (!response.headers.get('content-type')?.includes('application/json')) throw failure('app/backend-unavailable');
        const body = await response.json();
        if (!response.ok) throw failure(body.code || 'app/backend-unavailable', body.message);
        return body;
      });
    },
    placeOrder: payload => backend.request('checkout/start', payload),
    orderStatus: payload => backend.request('checkout/status', payload),
    claimCoupon: payload => result(async ({ auth, db, d }) => {
      const user = requireUser(auth);
      if (!user.emailVerified) throw failure('auth/unverified-email');
      const tiers = { 256: 3, 512: 5, 1024: 8, 2048: 10 };
      if (!Number.isInteger(payload.p_milestone) || !tiers[payload.p_milestone] ||
          !['citrine-drop-earrings', 'moon-pearl-bracelet', 'minimal-pearl-chain'].includes(payload.p_product_slug)) {
        throw failure('order/invalid-coupon');
      }
      const id = `${user.uid}_${payload.p_milestone}`;
      const claimRef = d.doc(db, 'coupon_claims', id);
      const couponRef = d.doc(db, 'game_coupons', id);
      return inventoryDeadline(d.runTransaction(db, async tx => {
        const claim = await tx.get(claimRef);
        if (claim.exists()) {
          // Use the current coupon, not the original claim snapshot: it may be redeemed.
          const existing = await tx.get(d.doc(db, 'game_coupons', claim.data().code));
          if (!existing.exists() || existing.data().user_id !== user.uid) throw failure('order/invalid-coupon');
          return existing.data();
        }
        const existing = await tx.get(couponRef);
        if (existing.exists()) return existing.data();
        const data = {
          user_id: user.uid, code: id, milestone: payload.p_milestone,
          product_slug: payload.p_product_slug, discount_percent: tiers[payload.p_milestone],
          issued_at: d.serverTimestamp(), redeemed_at: null,
        };
        tx.set(claimRef, data);
        tx.set(couponRef, data);
        return data;
      }));
    }),
  };
  window.EvrisBackend = backend;
})();
