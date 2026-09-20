// Shared, device-local energy clock. Also usable on storefront pages:
// <script src="/gem-archive-2048/energy.js" data-gem-browse></script>
(() => {
  if (window.GemEnergy) return;
  const STORAGE_KEY = "evris-gem-energy-v2";
  const GAME_STORAGE_KEY = "evris-gem-archive-2048-v1";
  const MAX_ENERGY = 5;
  const RECOVERY_MS = 2 * 60 * 60 * 1000;
  const IDLE_MS = 60 * 1000;
  const HEARTBEAT_LIMIT_MS = 5000;
  const listeners = new Set();
  let memory = null;
  let storageAvailable = true;
  let browsing = false;
  let lastActivityAt = 0;
  let lastTickAt = Date.now();

  function readJSON(key) {
    if (!storageAvailable) return null;
    let raw;
    try {
      raw = localStorage.getItem(key);
    } catch {
      storageAvailable = false;
      return null;
    }
    try { return JSON.parse(raw); } catch { return null; }
  }

  function validNumber(value, fallback) {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }

  function load(now) {
    let saved = readJSON(STORAGE_KEY) || memory;
    if (!saved) {
      const legacy = readJSON(GAME_STORAGE_KEY) || {};
      saved = {
        energy: legacy.energy,
        creditMs: legacy.awayCreditMs,
        // Retain elapsed time, but use the new two-hour rule, never the old
        // eight-minute rule. An absent timestamp starts the new clock now.
        updatedAt: validNumber(legacy.awayStartedAt, now),
      };
    }
    return {
      version: 2,
      energy: Math.max(0, Math.min(MAX_ENERGY, Math.floor(validNumber(saved.energy, MAX_ENERGY)))),
      creditMs: Math.max(0, Math.min(RECOVERY_MS - 1, validNumber(saved.creditMs, 0))),
      updatedAt: Math.max(0, validNumber(saved.updatedAt, now)),
      bonusUpdatedAt: Math.max(0, validNumber(saved.bonusUpdatedAt, validNumber(saved.updatedAt, now))),
    };
  }

  function persist(value) {
    const changed = JSON.stringify(memory) !== JSON.stringify(value);
    memory = value;
    if (!storageAvailable || !changed) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      storageAvailable = false;
    }
  }

  function foreground() {
    return document.visibilityState === "visible" && document.hasFocus();
  }

  function isBoosted(now) {
    return browsing && foreground() && now >= lastActivityAt && now < lastActivityAt + IDLE_MS;
  }

  function settle(now = Date.now()) {
    const value = load(now);
    const elapsed = Math.max(0, now - value.updatedAt);
    // Bonus time is earned only by live, focused browsing heartbeats. Closing
    // a page, suspending a device or changing tabs cannot bank offline boosts.
    const gap = now - lastTickAt;
    const bonusUntil = Math.min(now, lastActivityAt + IDLE_MS);
    const bonus = browsing && foreground() && now >= value.updatedAt && gap >= 0 && gap <= HEARTBEAT_LIMIT_MS
      ? Math.max(0, bonusUntil - Math.max(value.bonusUpdatedAt, lastTickAt))
      : 0;
    // Baseline and bonus have separate checkpoints: a background game tick
    // must not consume the foreground storefront's earned bonus interval.
    if (bonus > 0) value.bonusUpdatedAt = bonusUntil;
    if (value.energy < MAX_ENERGY) {
      const credit = value.creditMs + elapsed + bonus;
      value.energy = Math.min(MAX_ENERGY, value.energy + Math.floor(credit / RECOVERY_MS));
      value.creditMs = value.energy === MAX_ENERGY ? 0 : credit % RECOVERY_MS;
    } else {
      value.creditMs = 0;
    }
    if (value.energy === MAX_ENERGY) value.bonusUpdatedAt = Math.max(value.bonusUpdatedAt, now);
    // Do not count the same time again if the system clock moves backwards.
    value.updatedAt = Math.max(value.updatedAt, now);
    lastTickAt = now;
    persist(value);
    const full = value.energy === MAX_ENERGY;
    const rate = !full && isBoosted(now) ? 2 : 1;
    return {
      energy: value.energy,
      creditMs: value.creditMs,
      progress: full ? 100 : value.creditMs / RECOVERY_MS * 100,
      remainingMs: full ? 0 : (RECOVERY_MS - value.creditMs) / rate,
      rate,
    };
  }

  function notify() {
    const value = settle();
    listeners.forEach((listener) => listener(value));
    return value;
  }

  function stopBrowsing() {
    settle();
    browsing = false;
    notify();
  }

  function recordActivity() {
    settle();
    if (!foreground()) return;
    browsing = true;
    lastActivityAt = Date.now();
    notify();
  }

  window.GemEnergy = Object.freeze({
    snapshot: settle,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    recordActivity,
    stopBrowsing,
    spend() {
      const current = settle();
      if (current.energy <= 0) return false;
      persist({ ...memory, energy: current.energy - 1 });
      notify();
      return true;
    },
  });

  const storefront = document.currentScript?.hasAttribute("data-gem-browse");
  if (storefront) {
    recordActivity();
    for (const name of ["pointerdown", "keydown", "scroll", "wheel", "touchstart"]) {
      document.addEventListener(name, recordActivity, { passive: true, capture: true });
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopBrowsing();
    else notify();
  });
  window.addEventListener("blur", stopBrowsing);
  window.addEventListener("focus", notify);
  window.addEventListener("pagehide", stopBrowsing);
  window.addEventListener("pageshow", notify);
  // Each tick reads the latest shared clock, so other same-origin tabs sync
  // within a second without storage-event write loops or stacked recovery.
  window.setInterval(notify, 1000);
  settle();
})();
