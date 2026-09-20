const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const source = readFileSync(join(__dirname, "../homepage-motion.js"), "utf8");

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(name, listener) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(listener);
    },
    dispatch(name, event = {}) {
      (listeners.get(name) || []).forEach((listener) => listener(event));
    },
  };
}

function element(top = 0, hidden = false, height = 700) {
  const classes = new Set();
  const properties = new Map();
  let elementTop = top;
  return {
    ...eventTarget(),
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
      toggle: (name, force) => force ? classes.add(name) : classes.delete(name),
    },
    style: {
      setProperty: (name, value) => properties.set(name, String(value)),
      removeProperty: (name) => properties.delete(name),
      getPropertyValue: (name) => properties.get(name) || "",
    },
    getClientRects: () => hidden ? [] : [{}],
    getBoundingClientRect: () => ({
      top: elementTop, bottom: elementTop + height, left: 0, width: 1200, height,
    }),
    setTop: (value) => { elementTop = value; },
    setAttribute() {},
  };
}

function setup({ reduced = false, observer = true, fine = true, hasWordmark = true } = {}) {
  const body = element();
  body.classList.add("home-page");
  const children = [];
  body.appendChild = (child) => children.push(child);
  const hero = element();
  const header = element(0, false, 58);
  const wordmark = hasWordmark ? element() : null;
  const cards = [element(200), element(1100), element(1400, true)];
  const queries = new Map([[".product-card", cards]]);
  const reducedMotion = { ...eventTarget(), matches: reduced };
  const finePointer = { ...eventTarget(), matches: fine };
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.targets.clear(); }
  }
  const frames = new Map();
  let frameId = 0;
  const document = {
    ...eventTarget(), body, documentElement: { scrollHeight: 4000 },
    querySelector: (selector) => ({
      ".hero": hero, ".site-header": header, ".hero-copy-wordmark": wordmark,
    })[selector] || null,
    querySelectorAll: (selector) => queries.get(selector) || [],
    createElement: () => element(),
  };
  const window = {
    ...eventTarget(), innerHeight: 800, scrollY: 0,
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? reducedMotion : finePointer,
    ...(observer ? { IntersectionObserver: Observer } : {}),
  };
  runInNewContext(source, {
    document, window, IntersectionObserver: Observer,
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  function flushFrames() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback());
  }
  return { cards, hero, header, wordmark, window, document, reducedMotion, finePointer, observers, frames, flushFrames, progress: children[0] };
}

test("only offscreen, unfiltered content awaits a reveal", () => {
  const { cards, observers } = setup();
  assert.equal(cards[0].classList.contains("is-awaiting-reveal"), false);
  assert.equal(cards[1].classList.contains("is-awaiting-reveal"), true);
  assert.equal(cards[2].classList.contains("is-awaiting-reveal"), false);
  const revealObserver = observers.find((item) => item.targets.has(cards[1]));
  revealObserver.callback([{ target: cards[1], isIntersecting: true }]);
  assert.equal(cards[1].classList.contains("is-awaiting-reveal"), false);
  assert.equal(revealObserver.targets.has(cards[1]), false);
});

test("reduced motion and missing observers leave all content visible", () => {
  for (const options of [{ reduced: true }, { observer: false }]) {
    const { cards } = setup(options);
    assert.ok(cards.every((card) => !card.classList.contains("is-awaiting-reveal")));
  }
});

test("keyboard focus reveals its containing item immediately", () => {
  const { document, cards } = setup();
  document.dispatch("focusin", { target: { closest: () => cards[1] } });
  assert.equal(cards[1].classList.contains("is-awaiting-reveal"), false);
});

test("progress is frame-batched and clamps overscroll", () => {
  const { window, document, frames, flushFrames, progress } = setup();
  window.scrollY = 1600;
  window.dispatch("scroll");
  window.dispatch("scroll");
  assert.equal(frames.size, 1);
  flushFrames();
  assert.equal(progress.style.getPropertyValue("--page-progress"), "0.5");
  window.scrollY = 9000;
  window.dispatch("scroll");
  flushFrames();
  assert.equal(progress.style.getPropertyValue("--page-progress"), "1");
  document.documentElement.scrollHeight = 600;
  window.dispatch("resize");
  flushFrames();
  assert.equal(progress.style.getPropertyValue("--page-progress"), "0");
});

test("the header switches to the light theme after the hero clears it", () => {
  const { hero, header, window, flushFrames } = setup();
  assert.equal(header.classList.contains("is-past-hero"), false);
  hero.setTop(-641);
  window.dispatch("scroll");
  flushFrames();
  assert.equal(header.classList.contains("is-past-hero"), false);
  hero.setTop(-642);
  window.dispatch("scroll");
  flushFrames();
  assert.equal(header.classList.contains("is-past-hero"), true);
  hero.setTop(-500);
  window.dispatch("scroll");
  flushFrames();
  assert.equal(header.classList.contains("is-past-hero"), false);
});

test("the hero photo stays stationary for mouse and touch input", () => {
  const { hero, flushFrames, frames } = setup();
  for (const pointerType of ["mouse", "touch"]) {
    hero.dispatch("pointermove", { clientX: 1100, clientY: 600, pointerType });
  }
  assert.equal(frames.size, 0);
  flushFrames();
  assert.equal(hero.style.getPropertyValue("--hero-x"), "");
  assert.equal(hero.style.getPropertyValue("--hero-y"), "");
});

test("wordmark animation still pauses when the hero is offscreen", () => {
  const { hero, observers } = setup();
  const heroObserver = observers.find((item) => item.targets.has(hero));
  heroObserver.callback([{ target: hero, isIntersecting: false }]);
  assert.equal(hero.classList.contains("is-offscreen"), true);
  heroObserver.callback([{ target: hero, isIntersecting: true }]);
  assert.equal(hero.classList.contains("is-offscreen"), false);
});

test("changing motion preferences clears pending content", () => {
  const { cards, reducedMotion } = setup();
  reducedMotion.matches = true;
  reducedMotion.dispatch("change");
  assert.ok(cards.every((card) => !card.classList.contains("is-awaiting-reveal")));
});

test("wordmark reflection batches pointer events and clamps its offsets", () => {
  const { wordmark, frames, flushFrames } = setup();
  wordmark.dispatch("pointermove", { clientX: 300, clientY: 100, pointerType: "mouse" });
  wordmark.dispatch("pointermove", { clientX: 900, clientY: 350, pointerType: "mouse" });
  assert.equal(frames.size, 1);
  flushFrames();
  assert.equal(wordmark.style.getPropertyValue("--foil-position"), "75%");
  assert.equal(wordmark.style.getPropertyValue("--foil-offset-x"), "1px");
  assert.equal(wordmark.style.getPropertyValue("--foil-offset-y"), "0px");
  assert.equal(wordmark.classList.contains("has-foil-light"), true);
  wordmark.dispatch("pointermove", { clientX: 9000, clientY: -100, pointerType: "mouse" });
  flushFrames();
  assert.equal(wordmark.style.getPropertyValue("--foil-position"), "100%");
  assert.equal(wordmark.style.getPropertyValue("--foil-offset-x"), "2px");
  assert.equal(wordmark.style.getPropertyValue("--foil-offset-y"), "-2px");
});

test("leaving or cancelling the wordmark clears reflection and pending frames", () => {
  for (const eventName of ["pointerleave", "pointercancel", "blur"]) {
    const { wordmark, window, frames, flushFrames } = setup();
    const move = () => wordmark.dispatch("pointermove", { clientX: 900, clientY: 350, pointerType: "mouse" });
    move();
    flushFrames();
    move();
    (eventName === "blur" ? window : wordmark).dispatch(eventName);
    assert.equal(frames.size, 0);
    flushFrames();
    assert.equal(wordmark.classList.contains("has-foil-light"), false);
    assert.equal(wordmark.style.getPropertyValue("--foil-position"), "");
    assert.equal(wordmark.style.getPropertyValue("--foil-offset-x"), "");
    assert.equal(wordmark.style.getPropertyValue("--foil-offset-y"), "");
  }
});

test("touch, coarse pointers, and reduced motion do not animate reflections", () => {
  for (const options of [{ reduced: true }, { fine: false }, {}]) {
    const { wordmark, frames } = setup(options);
    wordmark.dispatch("pointermove", { clientX: 900, clientY: 350, pointerType: Object.keys(options).length ? "mouse" : "touch" });
    assert.equal(frames.size, 0);
    assert.equal(wordmark.classList.contains("has-foil-light"), false);
  }
});

test("changing motion or pointer preferences resets an active reflection", () => {
  for (const preference of ["motion", "pointer"]) {
    const { wordmark, finePointer, reducedMotion, frames, flushFrames } = setup();
    wordmark.dispatch("pointermove", { clientX: 900, clientY: 350, pointerType: "mouse" });
    flushFrames();
    const media = preference === "motion" ? reducedMotion : finePointer;
    media.matches = preference === "motion";
    media.dispatch("change");
    assert.equal(wordmark.classList.contains("has-foil-light"), false);
    wordmark.dispatch("pointermove", { clientX: 900, clientY: 350, pointerType: "mouse" });
    assert.equal(frames.size, 0);
  }
});

test("pages without a wordmark keep the other enhancements", () => {
  const { window, progress, flushFrames } = setup({ hasWordmark: false });
  window.dispatch("blur");
  window.scrollY = 1600;
  window.dispatch("scroll");
  flushFrames();
  assert.equal(progress.style.getPropertyValue("--page-progress"), "0.5");
});
