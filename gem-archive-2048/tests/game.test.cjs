// Run with: node --test gem-archive-2048/tests/game.test.cjs
// Lightweight DOM harness: no dependencies, real game and translation scripts.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const storageKey = "evris-gem-archive-2048-v1";
const energyStorageKey = "evris-gem-energy-v2";
const EPOCH = 1800000000000;
const HOUR = 60 * 60 * 1000;

class Element {
  constructor(tag = "div") {
    this.tag = tag;
    this.children = [];
    this.dataset = {};
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.events = {};
    this.attributes = {};
    this.textContent = "";
    this.open = false;
    this.className = "";
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name), remove: (name) => classes.delete(name),
      toggle: (name, on) => on ? classes.add(name) : classes.delete(name),
    };
  }
  set innerHTML(_) { this.children = []; this.textContent = ""; }
  append(...children) {
    children.forEach((child) => { child.parentNode = this; });
    this.children.push(...children);
  }
  remove() {
    if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((node) => node !== this);
    this.parentNode = null;
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  hasAttribute(name) { return Object.hasOwn(this.attributes, name); }
  addEventListener(name, fn) {
    const previous = this.events[name];
    this.events[name] = previous ? (event) => { previous(event); fn(event); } : fn;
  }
  focus() {}
  showModal() { this.open = true; }
  close() { this.open = false; this.events.close?.(); }
  closest(selector) { return selector.split(", ").includes(this.tag) ? this : null; }
}

function boot(saved, seed = 42, options = {}) {
  let now = options.now ?? EPOCH;
  let focused = true;
  const nodes = new Map();
  const translated = [];
  const aria = [];
  for (const match of html.matchAll(/<(\w+)\b([^>]+)>/g)) {
    const node = new Element(match[1]);
    const attrs = Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    if (attrs.id) nodes.set(`#${attrs.id}`, node);
    if (attrs["data-i18n"]) { node.dataset.i18n = attrs["data-i18n"]; translated.push(node); }
    if (attrs["data-i18n-aria"]) { node.dataset.i18nAria = attrs["data-i18n-aria"]; aria.push(node); }
  }
  nodes.set('meta[name="description"]', new Element("meta"));
  const body = new Element("body");
  const doc = new Element("document");
  Object.assign(doc, {
    body, documentElement: new Element("html"), visibilityState: "visible",
    hasFocus: () => focused,
    currentScript: options.storefront ? { hasAttribute: (name) => name === "data-gem-browse" } : null,
    querySelector: (selector) => {
      assert.ok(nodes.has(selector), `Missing DOM node: ${selector}`);
      return nodes.get(selector);
    },
    querySelectorAll: (selector) => selector === "[data-i18n]" ? translated : selector === "[data-i18n-aria]" ? aria : [],
    createElement: (tag) => new Element(tag),
  });
  const store = options.store || new Map(saved ? [[storageKey, JSON.stringify(saved)]] : []);
  if (options.energy) store.set(energyStorageKey, JSON.stringify(options.energy));
  const random = Object.create(Math);
  random.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const timers = new Map();
  const intervals = new Map();
  let nextTimer = 0;
  const win = new Element("window");
  Object.assign(win, {
    setTimeout(fn) { const id = ++nextTimer; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
    setInterval(fn) { const id = ++nextTimer; intervals.set(id, fn); return id; },
    confirm() { return true; },
  });
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const context = vm.createContext({
    document: doc, structuredClone, Date: ClockDate, Math: random,
    navigator: { clipboard: { writeText: async () => {} } },
    localStorage: {
      getItem: (key) => { if (options.storageBlocked) throw Error("Storage unavailable"); return store.get(key) ?? null; },
      setItem: (key, value) => { if (options.storageBlocked) throw Error("Storage unavailable"); store.set(key, value); },
    },
    window: win,
  });
  const scripts = options.storefront ? ["energy.js"] : ["locales.js", "energy.js", "game.js"];
  for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
  const run = (script) => vm.runInContext(script, context);
  const json = (script) => JSON.parse(run(`JSON.stringify(${script})`));
  const flushTimers = () => { const pending = [...timers.values()]; timers.clear(); pending.forEach((fn) => fn()); };
  const advance = (ms, { live = false } = {}) => {
    if (!live) { now += ms; intervals.forEach((fn) => fn()); return; }
    const end = now + ms;
    while (now < end) { now = Math.min(end, now + 1000); intervals.forEach((fn) => fn()); }
  };
  return {
    run, json, nodes, doc, win, translated, aria, flushTimers, advance, store,
    setFocus: (value) => { focused = value; win.events[value ? "focus" : "blur"]?.(); },
    now: () => now,
    saved: () => JSON.parse(store.get(storageKey)),
    energySaved: () => JSON.parse(store.get(energyStorageKey)),
  };
}

test("Every static/dynamic key, mineral and product has all four translations", () => {
  const app = boot();
  for (const dictionary of ["GAME_MESSAGES", "GEM_NAMES", "PRODUCT_NAMES"]) {
    for (const [key, values] of Object.entries(app.json(dictionary))) {
      assert.equal(values.length, 4, `${dictionary}.${key}`);
      assert.ok(values.every((value) => typeof value === "string" && value.length > 0));
      const tokens = (value) => [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      values.forEach((value) => assert.deepEqual(tokens(value), tokens(values[0]), key));
    }
  }
  for (const lang of ["en", "zh", "ja", "ko"]) {
    app.nodes.get("#languageSelect").value = lang;
    app.nodes.get("#languageSelect").events.change();
    assert.equal(app.doc.documentElement.lang, app.json("GAME_LOCALES")[lang]);
    assert.ok(app.translated.every((node) => node.textContent.length > 0));
    assert.ok(app.aria.every((node) => node.attributes["aria-label"]?.length > 0));
  }
});

test("Switching and reloading languages preserve the board, energy, points and coupons", () => {
  const app = boot();
  app.run("startNewGame(); state.score = 264; awardMilestones([256,512]); state.rewardPool = ['moon-pearl'];");
  const before = app.json("state");
  for (const lang of ["en", "ja", "ko", "zh"]) {
    app.nodes.get("#languageSelect").value = lang;
    app.nodes.get("#languageSelect").events.change();
    assert.deepEqual(app.json("state"), { ...before, language: lang });
    const restored = boot(app.saved());
    assert.deepEqual(restored.json("state"), { ...before, language: lang });
    assert.equal(restored.nodes.get("#startOverlay").hidden, true);
  }
});

test("Old coupons are archived, not counted as newly earned coupons", () => {
  const saved = { score: 512, best: 4096, energy: 2, tickets: 8, coupons: [
    { rewardId: "citrine-earrings", code: "GEMCITRINE12" },
    { rewardId: "citrine-earrings", code: "GEMCITRINE12" },
  ] };
  const app = boot(saved);
  assert.equal(app.json("state.best"), 4096);
  assert.equal(app.json("state.energy"), 2);
  assert.equal(app.json("state.language"), "zh");
  assert.deepEqual(app.json("state.pendingRewards"), []);
  assert.deepEqual(app.json("state.legacyRewardBalance"), { tickets: 8, points: 0 });
  assert.deepEqual(app.json("state.coupons"), []);
  assert.deepEqual(app.json("state.legacyCoupons"), saved.coupons);
  assert.equal(app.nodes.get("#couponHistoryCount").textContent, 0);
  assert.deepEqual(app.json("state.rewardPool"), ["citrine-earrings", "moon-pearl", "pearl-chain"]);
  assert.equal(boot({ language: "fr" }).json("state.language"), "zh");
});

test("All 11 minerals show real localized names and stop at 2048", () => {
  const app = boot();
  assert.deepEqual(app.json("state.discovered"), [2]);
  for (const lang of ["en", "zh", "ja", "ko"]) {
    app.run(`state.language = '${lang}'; renderAll();`);
    const ledger = app.nodes.get("#mineralLedger").children;
    assert.equal(ledger.length, 11);
    assert.equal(ledger.at(-1).dataset.value, 2048);
    ledger.forEach((item) => {
      const name = item.children[1].textContent;
      assert.ok(name.length > 0 && !/未鉴定|unidentified/i.test(name));
      assert.equal(name, app.run(`gemName(mineralFor(${item.dataset.value}))`));
    });
  }
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.ok(!css.includes("grayscale(1)"));
});

test("The final four gems keep distinct mineral artwork and exact values", () => {
  const app = boot();
  const values = [256, 512, 1024, 2048];
  assert.equal(new Set(app.json(`[${values}].map(value => { const mineral = mineralFor(value); return mineral.x + mineral.y; })`)).size, 4);
  for (const value of values) {
    app.run(`state.started = true; state.board = [${value}, ...Array(15).fill(0)]; renderBoard();`);
    const tile = app.run("tileViews.get(0).node");
    assert.equal(tile.className, `tile tile-${value}`);
    assert.equal(tile.dataset.value, value);
    assert.equal(tile.children[0].textContent, value);
    assert.ok(tile.children[1].textContent.length > 0);
  }
});

test("3,000 draws: no duplicate in any round and no consecutive duplicate across rounds, including reloads", () => {
  let app = boot();
  let previous;
  let round = [];
  for (let i = 0; i < 3000; i++) {
    const id = app.run("(() => { const reward = weightedReward(); state.coupons.unshift({ rewardId: reward.id, code: reward.codePrefix, milestone: 256, kind: 'percent', amount: 3 }); saveState(); return reward.id; })()");
    assert.notEqual(id, previous, `Consecutive duplicate at draw ${i}`);
    previous = id;
    round.push(id);
    if (round.length === 3) {
      assert.equal(new Set(round).size, 3, `Duplicate within round ending at ${i}`);
      round = [];
    }
    if (i % 29 === 0) app = boot(app.saved(), i + 1);
  }
});

test("Reward click consumes exactly one milestone; dialogs and history translate live", () => {
  const app = boot();
  app.run("drawReward()");
  assert.equal(app.json("state.coupons.length"), 0);
  app.run("awardMilestones([256,512,1024,2048]); drawReward(); drawReward();");
  assert.deepEqual(app.json("state.pendingRewards"), [512,1024,2048]);
  assert.equal(app.json("state.coupons.length"), 1);
  assert.equal(app.nodes.get("#rewardDialog").open, true);
  const code = app.nodes.get("#rewardCode").textContent;
  for (const lang of ["en", "zh", "ja", "ko"]) {
    app.run(`state.language = '${lang}'; renderAll();`);
    assert.equal(app.nodes.get("#rewardCode").textContent, code);
    assert.equal(app.nodes.get("#rewardProduct").textContent, app.run("rewardName(REWARDS.find(r => r.id === currentCoupon.rewardId))"));
    assert.equal(app.nodes.get("#rewardDetail").textContent, app.run("t('earnedFrom', { value: 256 }) + ' · ' + t('couponDetail')"));
    assert.equal(app.nodes.get("#rewardDiscount").textContent, app.run("t('percentDiscount', { amount: 3 })"));
    assert.equal(app.nodes.get("#couponHistoryList").children[0].children[1].children[0].textContent, app.nodes.get("#rewardProduct").textContent);
  }
});

test("Merges occur once per move in every direction, with a hard 2048 cap", () => {
  const app = boot();
  for (const [line, expected, delta] of [
    [[2,2,2,2], [4,4,0,0], 8], [[2,0,2,2], [4,2,0,0], 4],
    [[1024,1024,512,512], [2048,1024,0,0], 3072],
    [[2048,2048,0,0], [2048,2048,0,0], 0],
  ]) {
    const result = app.json(`slideLine(${JSON.stringify(line)})`);
    assert.deepEqual(result.line, expected);
    assert.equal(result.scoreDelta, delta);
  }
  for (const [direction, target] of [["left",0], ["right",3], ["up",0], ["down",12]]) {
    app.run(`state.started = true; state.board = [128,0,0,0, ...Array(12).fill(0)];
      state.board[${direction === "left" || direction === "right" ? 1 : 4}] = 128;
      state.score = 0; move('${direction}');`);
    assert.equal(app.json(`state.board[${target}]`), 256);
    assert.equal(app.json("state.score"), 256);
  }
});

test("Select keyboard interaction is not intercepted by the game", () => {
  const app = boot();
  app.run("startNewGame()");
  const before = app.json("state.board");
  let prevented = false;
  app.doc.events.keydown({ key: "ArrowDown", target: new Element("select"), preventDefault() { prevented = true; } });
  assert.equal(prevented, false);
  assert.deepEqual(app.json("state.board"), before);
});

test("Toast and game-over messages use the selected language; assets exist", () => {
  const app = boot();
  app.run("showToast('gemMerged', { gemValue: 256, value: 256 }); state.language = 'ja'; renderAll();");
  assert.match(app.nodes.get("#toast").textContent, /オパール/);
  assert.ok(!app.nodes.get("#toast").textContent.includes("{name}"));
  app.run("while (window.GemEnergy.spend()) {} finishRound('lost');");
  assert.equal(app.nodes.get("#gameoverMessage").textContent, app.run("t('gameoverEmpty')"));
  assert.equal(app.nodes.get("#playAgainButton").disabled, true);
  for (const reward of app.json("REWARDS")) assert.ok(fs.existsSync(path.join(root, reward.image)));
  assert.ok(fs.existsSync(path.join(root, "assets/gem-sprite.png")));
});

test("High score alone does not award coupons, and a duplicate 256 merge awards only once", () => {
  const app = boot();
  app.run("startNewGame(); state.board = Array(16).fill(64); move('left');");
  assert.equal(app.json("state.score"), 1024);
  assert.deepEqual(app.json("state.pendingRewards"), []);
  assert.equal(app.nodes.get("#progressText").textContent, "128 / 256");
  app.run("state.board = [128,128,128,128,...Array(12).fill(0)]; move('left');");
  assert.deepEqual(app.json("state.pendingRewards"), [256]);
  assert.deepEqual(app.json("state.roundMilestones"), [256]);
  app.run("state.board = [128,128,...Array(14).fill(0)]; move('left');");
  assert.deepEqual(app.json("state.pendingRewards"), [256]);
});

test("Each level yields its own 3%, 5%, 8%, 10% discount, regardless of random product", () => {
  const app = boot();
  app.run("startNewGame(); awardMilestones([256,512,1024,2048]); awardMilestones([256,512,1024,2048]);");
  assert.equal(app.json("state.pendingRewards.length"), 4);
  const products = [];
  for (const [value, amount] of [[256,3], [512,5], [1024,8], [2048,10]]) {
    app.run("drawReward()");
    const coupon = app.json("state.coupons[0]");
    assert.equal(coupon.milestone, value);
    assert.equal(coupon.amount, amount);
    assert.equal(coupon.kind, "percent");
    assert.ok(coupon.code.startsWith(app.run("REWARDS.find(r => r.id === currentCoupon.rewardId).codePrefix")));
    assert.equal(app.nodes.get("#rewardDiscount").textContent, `减免 ${amount}%`);
    products.push(coupon.rewardId);
    app.run("closeDialog(elements.rewardDialog)");
  }
  assert.equal(new Set(products.slice(0,3)).size, 3);
  assert.notEqual(products[2], products[3]);
  assert.equal(app.json("state.pendingRewards.length"), 0);
  app.run("drawReward()");
  assert.equal(app.json("state.coupons.length"), 4);
  assert.equal(app.nodes.get("#drawButton").disabled, true);
  assert.deepEqual(app.json("state.coupons.map(coupon => coupon.amount)"), [10,8,5,3]);
  const restored = boot(app.saved());
  assert.deepEqual(restored.json("state.coupons"), app.json("state.coupons"));
});

test("Reload cannot re-award claimed milestones; a new game resets eligibility but retains pending rewards", () => {
  let app = boot();
  app.run("startNewGame(); awardMilestones([256,512]); drawReward(); closeDialog(elements.rewardDialog); saveState();");
  app = boot(app.saved());
  app.run("awardMilestones([256,256,512]); saveState();");
  assert.deepEqual(app.json("state.pendingRewards"), [512]);
  assert.equal(app.json("state.coupons.length"), 1);
  app.run("startNewGame(); awardMilestones([256,256]); saveState();");
  assert.deepEqual(app.json("state.pendingRewards"), [512,256]);
  assert.deepEqual(app.json("state.roundMilestones"), [256]);
});

test("Reaching 2048 freezes the final board, persists victory, and leaves the last reward claimable", () => {
  const app = boot();
  app.run("startNewGame(); state.roundMilestones = [256,512,1024]; state.board = [1024,1024,...Array(14).fill(0)]; move('left');");
  assert.equal(app.json("state.roundResult"), "won");
  assert.equal(app.json("state.started"), false);
  assert.deepEqual(app.json("state.pendingRewards"), [2048]);
  assert.equal(app.nodes.get("#gameoverDialog").open, true);
  assert.equal(app.nodes.get("#claimRewardButton").hidden, false);
  const board = app.json("state.board");
  assert.deepEqual(board, [2048,...Array(15).fill(0)]); // No post-win random spawn.
  app.run("closeDialog(elements.gameoverDialog); move('right'); move('down');");
  assert.deepEqual(app.json("state.board"), board);
  assert.equal(app.nodes.get("#startOverlay").hidden, true);
  assert.equal(app.run("tileViews.get(0).node.dataset.value"), 2048);
  assert.ok(!app.nodes.get("#gameStatus").textContent.includes("4096"));
  const restored = boot(app.saved());
  assert.equal(restored.json("state.roundResult"), "won");
  assert.deepEqual(restored.json("state.pendingRewards"), [2048]);
  restored.run("drawReward()");
  assert.equal(restored.json("state.coupons[0].amount"), 10);
  restored.run("closeDialog(elements.rewardDialog); saveState();");
  const again = boot(restored.saved());
  assert.deepEqual(again.json("state.pendingRewards"), []);
  assert.equal(again.json("state.coupons.length"), 1);
});

test("Opening an active legacy board cannot mint new coupons; old records remain recoverable", () => {
  const saved = {
    started: true, board: [4096,...Array(15).fill(0)], energy: 2, score: 9000,
    tickets: 60, blindProgress: 100, language: "ko",
    coupons: [{ rewardId: "pearl-chain", code: "GEMPEARL40" }],
  };
  const app = boot(saved);
  assert.equal(app.json("state.roundResult"), "won");
  assert.equal(app.json("state.started"), false);
  assert.deepEqual(app.json("state.pendingRewards"), []);
  assert.deepEqual(app.json("state.legacyBoard"), saved.board);
  assert.equal(app.json("Math.max(...state.board)"), 2048);
  assert.deepEqual(app.json("state.legacyRewardBalance"), { tickets: 60, points: 100 });
  assert.deepEqual(app.json("state.coupons"), []);
  assert.deepEqual(app.json("state.legacyCoupons"), saved.coupons);
  const restored = boot(app.saved());
  assert.deepEqual(restored.json("state"), app.json("state"));
});

test("Victory claim button opens the final coupon even with zero energy, in all four languages", () => {
  for (const language of ["en", "zh", "ja", "ko"]) {
    const app = boot();
    app.run(`startNewGame(); state.language = '${language}'; while (window.GemEnergy.spend()) {}
      state.roundMilestones = [256,512,1024];
      state.board = [1024,1024,...Array(14).fill(0)]; move('left');`);
    assert.equal(app.nodes.get("#gameoverTitle").textContent, app.run("t('winTitle')"));
    assert.equal(app.nodes.get("#playAgainButton").disabled, true);
    app.nodes.get("#claimRewardButton").events.click();
    assert.equal(app.nodes.get("#gameoverDialog").open, false);
    assert.equal(app.nodes.get("#rewardDialog").open, true);
    assert.equal(app.nodes.get("#rewardDiscount").textContent, app.run("t('percentDiscount', { amount: 10 })"));
    assert.equal(app.json("state.coupons.length"), 1);
    app.run("closeDialog(elements.rewardDialog); move('right');");
    assert.equal(app.json("state.board[0]"), 2048);
  }
});

test("A new player starts with no coupons; ten legacy demo coupons stay archived across reloads", () => {
  const fresh = boot();
  assert.equal(fresh.nodes.get("#couponHistoryCount").textContent, 0);
  assert.equal(fresh.nodes.get("#ticketCount").textContent, 0);
  assert.equal(fresh.json("state.started"), false);
  const legacy = Array.from({ length: 10 }, (_, index) => index % 2
    ? { rewardId: "moon-pearl", code: "GEMMOON15", kind: "percent", amount: 15 }
    : { rewardId: "pearl-chain", code: "GEMPEARL40", kind: "fixed", amount: 40, minimum: 299 });
  const saved = { rulesVersion: 2, coupons: legacy, language: "zh", pendingRewards: [], started: false };
  let app = boot(saved);
  for (let i = 0; i < 4; i++) {
    assert.equal(app.nodes.get("#couponHistoryCount").textContent, 0);
    assert.equal(app.nodes.get("#ticketCount").textContent, 0);
    assert.deepEqual(app.json("state.legacyCoupons"), legacy);
    assert.equal(app.nodes.get("#couponHistoryList").children[0].textContent, "尚无已收藏的商品券");
    app = boot(app.saved());
  }
});

test("Cleaning old demo coupons preserves genuine milestone coupons and current gameplay", () => {
  const app = boot();
  app.run("startNewGame(); awardMilestones([256]); drawReward(); closeDialog(elements.rewardDialog);");
  const earned = app.json("state.coupons[0]");
  const saved = app.saved();
  saved.coupons.push({ rewardId: "pearl-chain", code: "GEMPEARL40", amount: 40, kind: "fixed" });
  const restored = boot(saved);
  assert.deepEqual(restored.json("state.coupons"), [earned]);
  assert.equal(restored.json("state.legacyCoupons.length"), 1);
  assert.deepEqual(restored.json("state.board"), saved.board);
  assert.equal(restored.json("state.energy"), saved.energy);
  assert.equal(restored.json("state.started"), true);
});

test("Moving tiles reuses existing DOM nodes, and stationary tiles, backgrounds and panels never rebuild", () => {
  const app = boot();
  app.run("startNewGame(); state.board = [2,0,0,0,0,0,0,4,...Array(8).fill(0)]; renderAll();");
  const board = app.nodes.get("#gameBoard");
  const backgrounds = board.children.slice(0,16);
  const layer = board.children[16];
  const stationary = app.run("tileViews.get(0).node");
  const moving = app.run("tileViews.get(7).node");
  const energyDot = app.nodes.get("#energyDots").children[0];
  const history = app.nodes.get("#couponHistoryList").children[0];
  const ledger = app.nodes.get("#mineralLedger").children[0];
  app.run("move('left')");
  assert.equal(app.run("tileViews.get(0).node"), stationary);
  assert.equal(app.run("tileViews.get(4).node"), moving);
  assert.equal(moving.style["--column"], 0);
  assert.equal(moving.style["--row"], 1);
  assert.equal(board.children.length, 17);
  backgrounds.forEach((node, index) => assert.equal(board.children[index], node));
  assert.equal(board.children[16], layer);
  assert.equal(app.nodes.get("#energyDots").children[0], energyDot);
  assert.equal(app.nodes.get("#couponHistoryList").children[0], history);
  assert.equal(app.nodes.get("#mineralLedger").children[0], ledger);
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.ok(!css.includes("tile-appear"));
  assert.ok(!css.includes("ready-pulse"));
  assert.match(css, /transition: transform 160ms/);
});

test("Merge ghosts are removed after sliding without removing the live result tile", () => {
  const app = boot();
  app.run("startNewGame(); state.board = [2,2,2,2,...Array(12).fill(0)]; renderAll();");
  const result = app.run("tileViews.get(0).node");
  const consumed = app.run("tileViews.get(1).node");
  app.run("move('left')");
  assert.equal(app.run("tileViews.get(0).node"), result);
  assert.equal(result.dataset.value, 4);
  assert.equal(consumed.attributes["aria-hidden"], "true");
  assert.ok(consumed.parentNode);
  assert.equal(app.run("mergingTiles.size"), 2);
  app.flushTimers();
  assert.equal(consumed.parentNode, null);
  assert.ok(result.parentNode);
  assert.equal(app.run("mergingTiles.size"), 0);
  assert.equal(app.run("tileLayer.children.length"), app.json("state.board.filter(Boolean).length"));
});

test("Motion planning matches the reference merge logic for 4000 random boards/directions", () => {
  const app = boot();
  const consistent = app.run(`(() => {
    for (let sample = 0; sample < 1000; sample++) {
      const board = Array.from({ length: 16 }, () => Math.random() < 0.35 ? 0 : 2 ** (1 + Math.floor(Math.random() * 11)));
      for (const direction of ['left','right','up','down']) {
        const expected = Array(16).fill(0);
        let score = 0;
        for (let i = 0; i < 4; i++) {
          const outcome = slideLine(getLine(board, i, direction));
          putLine(expected, i, direction, outcome.line);
          score += outcome.scoreDelta;
        }
        const actual = planMove(board, direction);
        if (JSON.stringify(expected) !== JSON.stringify(actual.board) || score !== actual.scoreDelta) return false;
        if (new Set(actual.moves.map(move => move.from)).size !== board.filter(Boolean).length) return false;
      }
    }
    return true;
  })()`);
  assert.equal(consistent, true);
});

test("Automatic recovery takes exactly two hours, including time spent on the game page", () => {
  const app = boot();
  assert.equal(app.nodes.get("#recoveryPercent").textContent, "100%");
  app.run("startNewGame()");
  assert.equal(app.json("state.energy"), 4);
  assert.match(app.nodes.get("#energyNote").textContent, /02:00:00/);
  app.advance(2 * HOUR - 1000);
  assert.equal(app.json("state.energy"), 4);
  assert.match(app.nodes.get("#energyNote").textContent, /00:00:01/);
  app.advance(1000);
  assert.equal(app.json("state.energy"), 5);
  assert.equal(app.nodes.get("#recoveryPercent").textContent, "100%");
  assert.equal(app.energySaved().creditMs, 0);
});

test("Partial progress survives reloads, then offline time restores multiple points only once", () => {
  const app = boot({ energy: 1 });
  app.advance(HOUR / 2);
  assert.equal(app.nodes.get("#recoveryPercent").textContent, "25%");
  assert.equal(app.nodes.get("#recoveryMeter").attributes["aria-valuenow"], "25");
  const restored = boot(app.saved(), 42, { store: app.store, now: app.now() + 4 * HOUR });
  assert.equal(restored.json("state.energy"), 3);
  assert.equal(restored.energySaved().creditMs, HOUR / 2);
  const again = boot(restored.saved(), 42, { store: restored.store, now: restored.now() });
  assert.equal(again.json("state.energy"), 3);
  assert.equal(again.energySaved().creditMs, HOUR / 2);
});

test("Full energy does not bank extra credit, and a new game preserves only valid partial credit", () => {
  const app = boot({ energy: 1 });
  app.advance(24 * HOUR);
  app.run("startNewGame()");
  assert.equal(app.json("state.energy"), 4);
  assert.equal(app.energySaved().creditMs, 0);
  app.advance(HOUR);
  app.run("startNewGame()");
  assert.equal(app.run("window.GemEnergy.snapshot().energy"), 3);
  assert.equal(app.energySaved().creditMs, HOUR);
  app.advance(HOUR);
  assert.equal(app.json("state.energy"), 4);
});

test("The game sends players to EVRIS products for recovery browsing", () => {
  const app = boot();
  app.run("startNewGame()");
  const button = app.nodes.get("#browseButton");
  assert.match(html, /id="browseButton" href="\.\.\/products\.html\?from=gem-archive"/);
  button.events.click();
  assert.equal(app.nodes.get("#browseDialog").open, false);
  assert.equal(app.run("window.GemEnergy.snapshot().rate"), 1);
  assert.deepEqual(app.json("state.coupons"), []);
});

test("Storefront browsing bonus expires after one idle minute; new interaction cannot backfill idle time", () => {
  const app = boot(null, 42, { energy: { energy: 2, creditMs: 0, updatedAt: EPOCH }, storefront: true });
  app.advance(90 * 1000, { live: true });
  assert.equal(app.energySaved().creditMs, 150 * 1000);
  app.doc.events.pointerdown({ target: new Element("article") });
  assert.equal(app.energySaved().creditMs, 150 * 1000);
  app.advance(10 * 1000, { live: true });
  assert.equal(app.energySaved().creditMs, 170 * 1000);
});

test("A sustained hour of active browsing restores one point, not two", () => {
  const app = boot(null, 42, { energy: { energy: 2, creditMs: 0, updatedAt: EPOCH }, storefront: true });
  for (let minute = 0; minute < 60; minute++) {
    app.doc.events.wheel({ target: new Element("article") });
    app.advance(60 * 1000, { live: true });
  }
  assert.equal(app.run("window.GemEnergy.snapshot().energy"), 3);
  assert.equal(app.energySaved().creditMs, 0);
});

test("Hidden pages, lost focus and device suspension never accrue offline browsing bonuses", () => {
  for (const mode of ["hidden", "blur", "pagehide", "suspend"]) {
    const app = boot(null, 42, { energy: { energy: 1, creditMs: 0, updatedAt: EPOCH }, storefront: true });
    if (mode === "hidden") { app.doc.visibilityState = "hidden"; app.doc.events.visibilitychange(); }
    if (mode === "blur") app.setFocus(false);
    if (mode === "pagehide") app.win.events.pagehide();
    app.advance(2 * HOUR);
    assert.equal(app.run("window.GemEnergy.snapshot().energy"), 2, mode);
    assert.equal(app.energySaved().creditMs, 0, mode);
    assert.equal(app.run("window.GemEnergy.snapshot().rate"), 1, mode);
  }
});

test("Closing and reopening a boosted page applies only ordinary offline recovery", () => {
  const app = boot(null, 42, { energy: { energy: 1, creditMs: 0, updatedAt: EPOCH }, storefront: true });
  app.advance(30 * 1000, { live: true });
  const restored = boot(null, 42, { store: app.store, now: app.now() + 2 * HOUR });
  assert.equal(restored.json("state.energy"), 2);
  assert.equal(restored.energySaved().creditMs, 60 * 1000);
  assert.equal(restored.run("window.GemEnergy.snapshot().rate"), 1);
});

test("Legacy eight-minute recovery migrates elapsed time without an eight-minute payout", () => {
  const app = boot({ energy: 3, awayCreditMs: 2 * 60 * 1000, awayStartedAt: EPOCH - 6 * 60 * 1000 });
  assert.equal(app.json("state.energy"), 3);
  assert.equal(app.energySaved().creditMs, 8 * 60 * 1000);
  assert.equal(app.json("Object.hasOwn(state, 'awayCreditMs')"), false);
  assert.equal(app.json("Object.hasOwn(state, 'awayStartedAt')"), false);
  assert.match(app.nodes.get("#energyNote").textContent, /01:52:00/);
});

test("Clock rollback cannot restore energy or count the same elapsed time twice", () => {
  const app = boot({ energy: 1 });
  app.advance(HOUR);
  app.advance(-HOUR / 2);
  assert.equal(app.energySaved().creditMs, HOUR);
  app.advance(HOUR / 2);
  assert.equal(app.energySaved().creditMs, HOUR);
  app.advance(HOUR);
  assert.equal(app.json("state.energy"), 2);
});

test("Starting a browsing session after a clock rollback cannot re-credit past time", () => {
  const app = boot({ energy: 1 });
  app.advance(HOUR);
  app.advance(-HOUR / 2);
  const shop = boot(null, 42, { store: app.store, now: app.now(), storefront: true });
  shop.advance(30 * 1000, { live: true });
  assert.equal(app.energySaved().creditMs, HOUR);
});

test("The storefront opt-in shares recovery with the game without stacking tab bonuses", () => {
  const app = boot({ energy: 1 });
  const shop = boot(null, 42, { store: app.store, now: app.now(), storefront: true });
  app.setFocus(false);
  shop.advance(30 * 1000, { live: true });
  app.advance(30 * 1000);
  assert.equal(app.energySaved().creditMs, 60 * 1000);
  assert.equal(app.json("state.energy"), 1);
  // A stale game save must never overwrite the independently shared clock.
  app.run("state.energy = 5; saveState()");
  app.advance(1000);
  assert.equal(app.json("state.energy"), 1);
  assert.equal(app.energySaved().creditMs, 61 * 1000);
});

test("Interleaved background game ticks cannot erase storefront browsing bonuses", () => {
  for (const gameFirst of [true, false]) {
    const app = boot({ energy: 1 });
    const shop = boot(null, 42, { store: app.store, now: app.now(), storefront: true });
    app.setFocus(false);
    for (let second = 0; second < 60; second++) {
      const pages = gameFirst ? [app, shop] : [shop, app];
      pages.forEach((page) => page.advance(1000));
    }
    assert.equal(app.energySaved().creditMs, 120 * 1000);
  }
});

test("Overlapping storefront heartbeats never stack the multiplier beyond 2x", () => {
  const shop = boot({ energy: 1 }, 42, { storefront: true });
  const second = boot(null, 42, { store: shop.store, now: shop.now(), storefront: true });
  for (let secondIndex = 0; secondIndex < 30; secondIndex++) {
    shop.advance(1000);
    second.advance(1000);
  }
  assert.equal(shop.energySaved().creditMs, 60 * 1000);
});

test("Energy progress updates never replace tiles, dots or coupon history", () => {
  const app = boot();
  app.run("startNewGame()");
  const tile = app.run("[...tileViews.values()][0].node");
  const dot = app.nodes.get("#energyDots").children[0];
  const history = app.nodes.get("#couponHistoryList").children[0];
  app.advance(10 * 1000, { live: true });
  assert.equal(app.run("[...tileViews.values()][0].node"), tile);
  assert.equal(app.nodes.get("#energyDots").children[0], dot);
  assert.equal(app.nodes.get("#couponHistoryList").children[0], history);
});

test("Energy zero re-enables play on recovery, with updated copy in all four languages", () => {
  for (const language of ["en", "zh", "ja", "ko"]) {
    const app = boot({ energy: 0, language });
    assert.equal(app.nodes.get("#startButton").disabled, true);
    assert.equal(app.nodes.get("#playAgainButton").disabled, true);
    assert.equal(app.nodes.get("#energyNote").textContent, app.run("t('recoveryHint', { time: '02:00:00' })"));
    assert.match(html, /id="browseButton" href="\.\.\/products\.html\?from=gem-archive"/);
    app.advance(2 * HOUR);
    assert.equal(app.nodes.get("#startButton").disabled, false);
    assert.equal(app.nodes.get("#playAgainButton").disabled, false);
    assert.equal(app.nodes.get("#overlayMessage").textContent, app.run("t('energyCost')"));
  }
});

test("Blocked browser storage keeps energy functional in memory", () => {
  const app = boot(null, 42, { storageBlocked: true });
  app.run("startNewGame()");
  assert.equal(app.json("state.energy"), 4);
  app.advance(2 * HOUR);
  assert.equal(app.json("state.energy"), 5);
});
