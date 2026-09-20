const STORAGE_KEY = "evris-gem-archive-2048-v1";
const backendClient = window.EvrisBackend;
const MAX_ENERGY = 5;
const MAX_TILE = 2048;
const REWARD_RULES_VERSION = 2;
const REWARD_MILESTONES = [
  { value: 256, amount: 3 },
  { value: 512, amount: 5 },
  { value: 1024, amount: 8 },
  { value: 2048, amount: 10 },
];

const MINERALS = [
  { value: 2, x: "0%", y: "0%" },
  { value: 4, x: "33.333%", y: "0%" },
  { value: 8, x: "66.666%", y: "0%" },
  { value: 16, x: "100%", y: "0%" },
  { value: 32, x: "0%", y: "50%" },
  { value: 64, x: "33.333%", y: "50%" },
  { value: 128, x: "66.666%", y: "50%" },
  { value: 256, x: "100%", y: "50%" },
  { value: 512, x: "0%", y: "100%" },
  { value: 1024, x: "33.333%", y: "100%" },
  { value: 2048, x: "66.666%", y: "100%" },
];

const REWARDS = [
  {
    id: "citrine-earrings",
    codePrefix: "GEMCITRINE",
    image: "assets/citrine-drop-earrings.jpg",
    weight: 46,
  },
  {
    id: "moon-pearl",
    codePrefix: "GEMMOON",
    image: "assets/moon-pearl-bracelet.jpg",
    weight: 34,
  },
  {
    id: "pearl-chain",
    codePrefix: "GEMPEARL",
    image: "assets/minimal-pearl-chain.jpg",
    weight: 20,
  },
];

const previewBoard = [
  2, 4, 8, 16,
  0, 32, 64, 0,
  0, 0, 128, 0,
  0, 0, 0, 0,
];

const defaultState = {
  board: Array(16).fill(0),
  score: 0,
  best: 0,
  energy: MAX_ENERGY,
  rulesVersion: REWARD_RULES_VERSION,
  roundMilestones: [],
  pendingRewards: [],
  roundResult: null,
  started: false,
  reached2048: false,
  discovered: [2],
  coupons: [],
  legacyCoupons: [],
  language: "zh",
  rewardPool: null,
};

let state = loadState();
let touchStart = null;
let toastTimer = null;
let activeToast = null;
let currentCoupon = null;
let copied = false;
let tileLayer = null;
let tileViews = new Map();
let energyRenderSignature = null;
let rewardRenderSignature = null;
const mergingTiles = new Set();
const SLIDE_DURATION_MS = 160;

const elements = {
  board: document.querySelector("#gameBoard"),
  score: document.querySelector("#scoreValue"),
  best: document.querySelector("#bestValue"),
  finalScore: document.querySelector("#finalScore"),
  gameStatus: document.querySelector("#gameStatus"),
  startOverlay: document.querySelector("#startOverlay"),
  overlayTitle: document.querySelector("#overlayTitle"),
  overlayMessage: document.querySelector("#overlayMessage"),
  startButton: document.querySelector("#startButton"),
  restartButton: document.querySelector("#restartButton"),
  playAgainButton: document.querySelector("#playAgainButton"),
  energyCount: document.querySelector("#energyCount"),
  headerEnergyCount: document.querySelector("#headerEnergyCount"),
  energyDots: document.querySelector("#energyDots"),
  headerEnergyDots: document.querySelector("#headerEnergyDots"),
  energyNote: document.querySelector("#energyNote"),
  recoveryMode: document.querySelector("#recoveryMode"),
  recoveryPercent: document.querySelector("#recoveryPercent"),
  recoveryMeter: document.querySelector("#recoveryMeter"),
  recoveryMeterFill: document.querySelector("#recoveryMeterFill"),
  browseButton: document.querySelector("#browseButton"),
  browseDialog: document.querySelector("#browseDialog"),
  browseProducts: document.querySelector("#browseProducts"),
  browseEnergyNote: document.querySelector("#browseEnergyNote"),
  browseMeterFill: document.querySelector("#browseMeterFill"),
  closeBrowseButton: document.querySelector("#closeBrowseButton"),
  returnToGameButton: document.querySelector("#returnToGameButton"),
  mineralLedger: document.querySelector("#mineralLedger"),
  progressText: document.querySelector("#progressText"),
  progressLabel: document.querySelector("#progressLabel"),
  progressFill: document.querySelector("#progressFill"),
  milestoneRewards: document.querySelector("#milestoneRewards"),
  ticketCount: document.querySelector("#ticketCount"),
  drawButton: document.querySelector("#drawButton"),
  rewardDialog: document.querySelector("#rewardDialog"),
  rewardImage: document.querySelector("#rewardImage"),
  rewardDiscount: document.querySelector("#rewardDiscount"),
  rewardProduct: document.querySelector("#rewardProduct"),
  rewardDetail: document.querySelector("#rewardDetail"),
  rewardCode: document.querySelector("#rewardCode"),
  copyCouponButton: document.querySelector("#copyCouponButton"),
  couponHistoryList: document.querySelector("#couponHistoryList"),
  couponHistoryCount: document.querySelector("#couponHistoryCount"),
  gameoverDialog: document.querySelector("#gameoverDialog"),
  gameoverMessage: document.querySelector("#gameoverMessage"),
  gameoverTitle: document.querySelector("#gameoverTitle"),
  claimRewardButton: document.querySelector("#claimRewardButton"),
  toast: document.querySelector("#toast"),
  language: document.querySelector("#languageSelect"),
};

function localized(values) {
  return values[Object.keys(GAME_LOCALES).indexOf(state.language)] || values[0];
}

function t(key, params = {}) {
  return localized(GAME_MESSAGES[key]).replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);
}

function gemName(mineral) {
  return localized(GEM_NAMES[mineral.value]);
}

function rewardName(reward) {
  return localized(PRODUCT_NAMES[reward.id]);
}

function rewardDiscount(reward) {
  return t(reward.kind === "fixed" ? "fixedDiscount" : "percentDiscount", { amount: reward.amount });
}

function couponOffer(coupon) {
  return coupon || { amount: REWARD_MILESTONES[0].amount, kind: "percent" };
}

function isMilestoneCoupon(coupon) {
  if (!coupon || !REWARDS.some((reward) => reward.id === coupon.rewardId)) return false;
  const tier = REWARD_MILESTONES.find((item) => item.value === coupon.milestone);
  return Boolean(tier && coupon.kind === "percent" && coupon.amount === tier.amount
    && typeof coupon.code === "string" && coupon.code.length > 0);
}

function renderLanguage() {
  document.documentElement.lang = GAME_LOCALES[state.language];
  document.title = `${t("gameTitle")} | EVRIS`;
  document.querySelector('meta[name="description"]').content = t("description");
  elements.language.value = state.language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
  if (activeToast) elements.toast.textContent = toastText();
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    const merged = { ...structuredClone(defaultState), ...saved };
    merged.board = Array.isArray(saved.board) && saved.board.length === 16
      ? saved.board.map((value) => Number(value) || 0)
      : Array(16).fill(0);
    merged.discovered = Array.isArray(saved.discovered) ? saved.discovered : [2];
    const savedCoupons = Array.isArray(saved.coupons) ? saved.coupons : [];
    // Old fixed-code demo coupons are not rewards earned under milestone rules.
    // Archive them in the same save instead of erasing them or showing them as
    // a new player's balance. Reloading never archives the same records twice.
    merged.coupons = savedCoupons.filter(isMilestoneCoupon);
    merged.legacyCoupons = [
      ...(Array.isArray(saved.legacyCoupons) ? saved.legacyCoupons : []),
      ...savedCoupons.filter((coupon) => !isMilestoneCoupon(coupon)),
    ];
    merged.language = Object.hasOwn(GAME_LOCALES, saved.language) ? saved.language : "zh";
    const highest = Math.max(...merged.board);
    const validMilestones = REWARD_MILESTONES.map((tier) => tier.value);
    if (saved.rulesVersion !== REWARD_RULES_VERSION) {
      // Retire score-based draw balances without discarding their audit record.
      // Do not grant new rewards merely for opening an old saved board.
      merged.legacyRewardBalance = { tickets: saved.tickets || 0, points: saved.blindProgress || 0 };
      merged.roundMilestones = validMilestones.filter((value) => value <= highest);
      merged.pendingRewards = [];
      merged.roundResult = !saved.started && highest > 0 ? "lost" : null;
    } else {
      merged.roundMilestones = [...new Set((Array.isArray(saved.roundMilestones) ? saved.roundMilestones : [])
        .filter((value) => validMilestones.includes(value)))];
      merged.pendingRewards = (Array.isArray(saved.pendingRewards) ? saved.pendingRewards : [])
        .filter((value) => validMilestones.includes(value));
    }
    merged.rulesVersion = REWARD_RULES_VERSION;
    // The shared energy clock migrates these fields before this script loads.
    delete merged.awayCreditMs;
    delete merged.awayStartedAt;
    delete merged.tickets;
    delete merged.blindProgress;
    if (highest >= MAX_TILE) {
      if (highest > MAX_TILE) merged.legacyBoard = merged.board.slice();
      merged.board = merged.board.map((value) => Math.min(value, MAX_TILE));
      merged.roundResult = "won";
      merged.reached2048 = true;
      merged.started = false;
    }
    merged.discovered = merged.discovered.filter((value) => value <= MAX_TILE);
    // Preserve unfinished draw cycles on reload. Migrate old saves by treating
    // their latest non-repeating run as the start of the current cycle.
    const ids = REWARDS.map((reward) => reward.id);
    if (savedCoupons.length !== merged.coupons.length && merged.coupons.length === 0) {
      merged.rewardPool = ids.slice();
    } else if (Array.isArray(saved.rewardPool)) {
      merged.rewardPool = [...new Set(saved.rewardPool.filter((id) => ids.includes(id)))];
    } else {
      const recent = new Set();
      for (const coupon of merged.coupons) {
        if (!ids.includes(coupon.rewardId)) continue;
        if (recent.has(coupon.rewardId)) break;
        recent.add(coupon.rewardId);
        if (recent.size === ids.length) break;
      }
      merged.rewardPool = ids.filter((id) => !recent.has(id));
    }
    return merged;
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The game remains playable when browser privacy settings block local storage.
  }
}

function createLedger() {
  elements.mineralLedger.innerHTML = "";
  MINERALS.forEach((mineral) => {
    const item = document.createElement("li");
    item.dataset.value = mineral.value;

    const icon = document.createElement("span");
    icon.className = "ledger-icon";
    icon.style.backgroundPosition = `${mineral.x} ${mineral.y}`;

    const name = document.createElement("span");
    name.className = "ledger-name";
    name.textContent = gemName(mineral);
    name.title = gemName(mineral);

    const value = document.createElement("span");
    value.className = "ledger-value";
    value.textContent = mineral.value;

    item.append(icon, name, value);
    elements.mineralLedger.append(item);
  });
}

function ensureBoardLayers() {
  if (tileLayer) return;
  // The 16 background cells and tile layer live for the lifetime of the page.
  for (let i = 0; i < 16; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("aria-hidden", "true");
    elements.board.append(cell);
  }
  tileLayer = document.createElement("div");
  tileLayer.className = "tile-layer";
  elements.board.append(tileLayer);
}

function updateTile(view, value) {
  const mineral = mineralFor(value);
  const label = gemName(mineral);
  if (view.value !== value) {
    view.node.className = `tile tile-${value}`;
    view.node.dataset.value = value;
    view.number.textContent = value;
    view.value = value;
  }
  if (view.name.textContent !== label) view.name.textContent = label;
  view.node.title = `${label} · ${value}`;
  view.node.setAttribute("aria-label", `${label}, ${value}`);
}

function positionTile(view, index) {
  if (view.index === index) return;
  view.node.style.setProperty("--column", index % 4);
  view.node.style.setProperty("--row", Math.floor(index / 4));
  view.index = index;
}

function createTile(value, index) {
  const node = document.createElement("div");
  const number = document.createElement("span");
  number.className = "tile-value";
  const name = document.createElement("span");
  name.className = "tile-name";
  node.append(number, name);
  const view = { node, number, name, value: null, index: null };
  updateTile(view, value);
  positionTile(view, index);
  tileLayer.append(node);
  return view;
}

function clearMergingTiles() {
  mergingTiles.forEach((entry) => {
    window.clearTimeout(entry.timer);
    entry.node.remove();
  });
  mergingTiles.clear();
}

function resetBoardView() {
  clearMergingTiles();
  tileViews.forEach((view) => view.node.remove());
  tileViews.clear();
}

function syncTiles(board) {
  tileViews.forEach((view, index) => {
    if (!board[index]) {
      view.node.remove();
      tileViews.delete(index);
    }
  });
  board.forEach((value, index) => {
    if (!value) return;
    if (tileViews.has(index)) updateTile(tileViews.get(index), value);
    else tileViews.set(index, createTile(value, index));
  });
}

function renderBoard(motion = null) {
  ensureBoardLayers();
  const board = state.started || state.roundResult ? state.board : previewBoard;
  if (!motion) {
    clearMergingTiles();
    syncTiles(board);
    return;
  }

  // Match views to the pre-move state, then retain each moving DOM node. CSS
  // translates those nodes without fading or recreating stationary gemstones.
  syncTiles(motion.before);
  const movedViews = new Map();
  motion.moves.forEach(({ from, to }) => {
    const view = tileViews.get(from);
    positionTile(view, to);
    if (!movedViews.has(to)) {
      updateTile(view, motion.board[to]);
      movedViews.set(to, view);
    } else {
      view.node.classList.add("is-merging");
      view.node.setAttribute("aria-hidden", "true");
      const entry = { node: view.node, timer: null };
      entry.timer = window.setTimeout(() => {
        entry.node.remove();
        mergingTiles.delete(entry);
      }, SLIDE_DURATION_MS);
      mergingTiles.add(entry);
    }
  });
  tileViews = movedViews;
  // A newly spawned tile appears only in its own cell, with no fade or zoom.
  syncTiles(board);
}

function mineralFor(value) {
  return MINERALS.find((item) => item.value === value) || MINERALS[MINERALS.length - 1];
}

function renderEnergy(recovery = window.GemEnergy.snapshot()) {
  state.energy = recovery.energy;
  const full = state.energy >= MAX_ENERGY;
  const time = formatTime(recovery.remainingMs);
  const percent = Math.floor(recovery.progress);
  const signature = JSON.stringify([state.language, state.energy, time, percent, recovery.rate, state.started]);
  if (signature === energyRenderSignature) return;
  energyRenderSignature = signature;
  elements.energyCount.textContent = `${state.energy} / ${MAX_ENERGY}`;
  elements.headerEnergyCount.textContent = `${state.energy}/${MAX_ENERGY}`;
  // Clock ticks update text and width only; the board and energy dots stay put.
  if (elements.energyDots.dataset.energy !== String(state.energy)) {
    renderDots(elements.energyDots);
    renderDots(elements.headerEnergyDots);
    elements.energyDots.dataset.energy = String(state.energy);
  }

  const mode = t(full ? "recoveryFull" : recovery.rate === 2 ? "recoveryBoosted" : "recoveryNormal");
  elements.recoveryMode.textContent = mode;
  elements.recoveryPercent.textContent = `${percent}%`;
  elements.recoveryMeterFill.style.width = `${recovery.progress}%`;
  elements.recoveryMeter.setAttribute("aria-valuenow", String(percent));
  elements.recoveryMeter.classList.toggle("is-boosted", recovery.rate === 2);
  elements.energyNote.textContent = full
    ? t("energyFull")
    : t("recoveryHint", { time });
  elements.recoveryMeter.setAttribute("aria-valuetext", `${mode} · ${elements.energyNote.textContent}`);
  elements.browseEnergyNote.textContent = `${state.energy} / ${MAX_ENERGY} · ${mode} · ${elements.energyNote.textContent}`;
  elements.browseMeterFill.style.width = `${recovery.progress}%`;

  const outOfEnergy = state.energy <= 0;
  elements.startButton.disabled = outOfEnergy;
  elements.playAgainButton.disabled = outOfEnergy;
  if (!state.started) {
    elements.overlayTitle.textContent = t(outOfEnergy ? "energyPaused" : "beginCollection");
    elements.overlayMessage.textContent = outOfEnergy
      ? t("returnAfter", { time })
      : t("energyCost");
    elements.startButton.textContent = t(outOfEnergy ? "recharging" : "start");
  }
  elements.gameoverMessage.textContent = t(state.roundResult === "won" ? "winMessage" : (outOfEnergy ? "gameoverEmpty" : "gameoverReady"));
}

function renderBrowseProducts() {
  elements.browseProducts.innerHTML = "";
  REWARDS.forEach((reward) => {
    const card = document.createElement("article");
    const image = document.createElement("img");
    image.src = reward.image;
    image.alt = rewardName(reward);
    image.width = 400;
    image.height = 400;
    const name = document.createElement("h3");
    name.textContent = rewardName(reward);
    card.append(image, name);
    elements.browseProducts.append(card);
  });
}

function renderDots(container) {
  container.innerHTML = "";
  for (let i = 0; i < MAX_ENERGY; i += 1) {
    const dot = document.createElement("i");
    if (i < state.energy) dot.classList.add("is-full");
    container.append(dot);
  }
}

function renderRewards() {
  const next = REWARD_MILESTONES.find((tier) => !state.roundMilestones.includes(tier.value));
  const highest = state.started || state.roundResult ? Math.max(...state.board) : 0;
  const signature = JSON.stringify([state.language, highest, state.roundMilestones, state.pendingRewards, state.coupons]);
  if (signature === rewardRenderSignature) return;
  rewardRenderSignature = signature;
  elements.progressLabel.textContent = t(next ? "nextReward" : "allTiersReached");
  elements.progressText.textContent = next ? `${highest} / ${next.value}` : `${MAX_TILE} / ${MAX_TILE}`;
  elements.progressFill.style.width = `${next ? Math.min(100, highest / next.value * 100) : 100}%`;
  elements.ticketCount.textContent = state.pendingRewards.length;
  const pending = REWARD_MILESTONES.find((tier) => tier.value === state.pendingRewards[0]);
  elements.drawButton.disabled = !pending;
  elements.drawButton.textContent = pending
    ? t("drawTier", { value: pending.value, amount: pending.amount })
    : t(next ? "unlockAt" : "allDrawn", { value: next?.value });
  elements.drawButton.classList.toggle("is-ready", Boolean(pending));
  elements.claimRewardButton.hidden = !pending;
  elements.claimRewardButton.textContent = t("claimRewards", { count: state.pendingRewards.length });
  elements.milestoneRewards.innerHTML = "";
  REWARD_MILESTONES.forEach((tier) => {
    const reached = state.roundMilestones.includes(tier.value);
    const row = document.createElement("li");
    row.className = reached ? "is-earned" : "";
    row.dataset.milestone = tier.value;
    const value = document.createElement("span");
    value.textContent = tier.value;
    const discount = document.createElement("strong");
    discount.textContent = rewardDiscount({ kind: "percent", amount: tier.amount });
    const status = document.createElement("small");
    status.textContent = t(reached ? "tierReached" : "tierWaiting");
    row.append(value, discount, status);
    elements.milestoneRewards.append(row);
  });
  renderCouponHistory();
}

function renderCouponHistory() {
  elements.couponHistoryCount.textContent = state.coupons.length;
  elements.couponHistoryList.innerHTML = "";

  if (!state.coupons.length) {
    const empty = document.createElement("p");
    empty.className = "empty-copy";
    empty.textContent = t("emptyCoupons");
    elements.couponHistoryList.append(empty);
    return;
  }

  state.coupons.slice(0, 4).forEach((coupon) => {
    const reward = REWARDS.find((item) => item.id === coupon.rewardId);
    if (!reward) return;
    const item = document.createElement("article");
    item.className = "coupon-history-item";
    const img = document.createElement("img");
    img.src = reward.image;
    img.alt = rewardName(reward);
    const info = document.createElement("div");
    const name = document.createElement("p");
    name.textContent = rewardName(reward);
    name.title = rewardName(reward);
    const code = document.createElement("small");
    code.textContent = coupon.code;
    const discount = document.createElement("strong");
    discount.textContent = rewardDiscount(couponOffer(coupon));
    info.append(name, code);
    item.append(img, info, discount);
    elements.couponHistoryList.append(item);
  });
}

function renderStatus() {
  elements.score.textContent = state.score.toLocaleString(GAME_LOCALES[state.language]);
  elements.best.textContent = state.best.toLocaleString(GAME_LOCALES[state.language]);
  elements.finalScore.textContent = state.score.toLocaleString(GAME_LOCALES[state.language]);
  elements.gameoverTitle.textContent = t(state.roundResult === "won" ? "winTitle" : "gameoverTitle");
  elements.gameoverMessage.textContent = t(state.roundResult === "won" ? "winMessage" : (state.energy > 0 ? "gameoverReady" : "gameoverEmpty"));

  const highest = Math.max(...state.board, 2);
  const next = mineralFor(Math.min(highest * 2, MAX_TILE));
  elements.gameStatus.textContent = state.roundResult === "won"
    ? t("winStatus")
    : t("nextGem", { name: gemName(next), value: next.value });
}

function renderAll({ motion = null } = {}) {
  if (!motion) renderLanguage();
  renderBoard(motion);
  renderStatus();
  renderEnergy();
  renderRewards();
  if (!motion) {
    createLedger();
    renderRewardDialog();
    renderBrowseProducts();
  }
  elements.startOverlay.hidden = Boolean(state.started || state.roundResult);
}

function startNewGame({ confirmRestart = false } = {}) {
  renderEnergy();
  if (state.energy <= 0) {
    renderEnergy();
    showToast("noEnergy");
    return;
  }

  if (confirmRestart && state.started) {
    const accepted = window.confirm(t("restartConfirm"));
    if (!accepted) return;
  }

  window.GemEnergy.stopBrowsing();
  if (!window.GemEnergy.spend()) {
    renderEnergy();
    showToast("noEnergy");
    return;
  }
  state.board = Array(16).fill(0);
  state.score = 0;
  state.started = true;
  state.reached2048 = false;
  state.roundResult = null;
  state.roundMilestones = [];
  resetBoardView();
  addRandomTile();
  addRandomTile();
  saveState();
  renderAll();
  elements.board.focus({ preventScroll: true });
}

function addRandomTile() {
  const empty = state.board
    .map((value, index) => (value === 0 ? index : -1))
    .filter((index) => index >= 0);
  if (!empty.length) return;
  const index = empty[Math.floor(Math.random() * empty.length)];
  state.board[index] = Math.random() < 0.9 ? 2 : 4;
}

function slideLine(line) {
  const values = line.filter(Boolean);
  const result = [];
  let scoreDelta = 0;
  const mergedValues = [];

  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1] && values[i] < MAX_TILE) {
      const merged = values[i] * 2;
      result.push(merged);
      scoreDelta += merged;
      mergedValues.push(merged);
      i += 1;
    } else {
      result.push(values[i]);
    }
  }

  while (result.length < 4) result.push(0);
  return { line: result, scoreDelta, mergedValues };
}

function getLine(board, index, direction) {
  if (direction === "left") return board.slice(index * 4, index * 4 + 4);
  if (direction === "right") return board.slice(index * 4, index * 4 + 4).reverse();
  if (direction === "up") return [0, 1, 2, 3].map((row) => board[row * 4 + index]);
  return [3, 2, 1, 0].map((row) => board[row * 4 + index]);
}

function putLine(board, index, direction, line) {
  if (direction === "left") {
    line.forEach((value, column) => { board[index * 4 + column] = value; });
  } else if (direction === "right") {
    line.forEach((value, offset) => { board[index * 4 + (3 - offset)] = value; });
  } else if (direction === "up") {
    line.forEach((value, row) => { board[row * 4 + index] = value; });
  } else {
    line.forEach((value, offset) => { board[(3 - offset) * 4 + index] = value; });
  }
}

function planMove(board, direction) {
  const result = { before: board.slice(), board: Array(16).fill(0), moves: [], scoreDelta: 0, mergedValues: [] };
  const indices = Array.from({ length: 16 }, (_, index) => index);
  for (let line = 0; line < 4; line += 1) {
    const positions = getLine(indices, line, direction);
    const occupied = positions.filter((index) => board[index]);
    let output = 0;
    for (let i = 0; i < occupied.length; i += 1) {
      const from = occupied[i];
      const to = positions[output++];
      let value = board[from];
      result.moves.push({ from, to });
      if (value < MAX_TILE && value === board[occupied[i + 1]]) {
        result.moves.push({ from: occupied[++i], to });
        value *= 2;
        result.scoreDelta += value;
        result.mergedValues.push(value);
      }
      result.board[to] = value;
    }
  }
  return result;
}

function move(direction) {
  if (!state.started || elements.rewardDialog.open || elements.gameoverDialog.open || elements.browseDialog.open) return;
  window.GemEnergy.stopBrowsing();
  if (state.board.some((value) => value >= MAX_TILE)) {
    finishRound("won");
    return;
  }

  const motion = planMove(state.board, direction);
  if (motion.board.every((value, index) => value === state.board[index])) return;

  state.board = motion.board.slice();
  state.score += motion.scoreDelta;
  state.best = Math.max(state.best, state.score);
  discoverMinerals(motion.mergedValues);
  awardMilestones(motion.mergedValues);
  if (state.board.includes(MAX_TILE)) {
    finishRound("won", motion);
    return;
  }
  addRandomTile();

  saveState();
  if (!canMove()) {
    finishRound("lost", motion);
  } else renderAll({ motion });
}

function awardMilestones(mergedValues) {
  REWARD_MILESTONES.forEach((tier) => {
    if (!mergedValues.includes(tier.value) || state.roundMilestones.includes(tier.value)) return;
    state.roundMilestones.push(tier.value);
    state.pendingRewards.push(tier.value);
    showToast("tierUnlocked", { value: tier.value, amount: tier.amount });
  });
}

function discoverMinerals(values) {
  values.forEach((value) => {
    if (!state.discovered.includes(value)) {
      state.discovered.push(value);
      showToast("gemMerged", { gemValue: value, value });
    }
  });
}

function canMove() {
  if (state.board.includes(0)) return true;
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const current = state.board[row * 4 + column];
      if (column < 3 && current === state.board[row * 4 + column + 1]) return true;
      if (row < 3 && current === state.board[(row + 1) * 4 + column]) return true;
    }
  }
  return false;
}

function finishRound(result, motion = null) {
  state.started = false;
  state.roundResult = result;
  state.reached2048 = result === "won";
  saveState();
  renderAll({ motion });
  openDialog(elements.gameoverDialog);
}

function drawReward() {
  if (!state.pendingRewards.length || elements.rewardDialog.open || elements.gameoverDialog.open) return;
  const milestone = state.pendingRewards.shift();
  const tier = REWARD_MILESTONES.find((item) => item.value === milestone);
  const reward = weightedReward();
  const coupon = {
    rewardId: reward.id,
    milestone,
    amount: tier.amount,
    kind: "percent",
    code: `${reward.codePrefix}${tier.amount}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    wonAt: new Date().toISOString(),
  };
  state.coupons.unshift(coupon);
  saveState();
  renderRewards();
  void syncCouponToBackend(coupon);

  currentCoupon = coupon;
  copied = false;
  renderRewardDialog();
  openDialog(elements.rewardDialog);
}

function rewardProductSlug(coupon) {
  return {
    "citrine-earrings": "citrine-drop-earrings",
    "moon-pearl": "moon-pearl-bracelet",
    "pearl-chain": "minimal-pearl-chain",
  }[coupon.rewardId];
}

async function syncCouponToBackend(coupon) {
  if (!backendClient || !rewardProductSlug(coupon)) return;
  const { data: authData } = await backendClient.auth.getUser();
  if (!authData.user || (coupon.user_id && coupon.user_id !== authData.user.id)) return;
  coupon.user_id = authData.user.id;
  saveState();

  const { data, error } = await backendClient.claimCoupon({
    p_milestone: coupon.milestone,
    p_product_slug: rewardProductSlug(coupon),
    p_code: coupon.code,
  });
  // Offline play remains visible locally. Once signed in, a successful response
  // replaces the local code with the stored server code (including a duplicate
  // milestone earned on another device).
  if (error || !data) return;
  coupon.code = data.code;
  coupon.amount = data.discount_percent;
  coupon.storeProductId = data.product_slug;
  coupon.synced = true;
  coupon.redeemed_at = data.redeemed_at || null;
  saveState();
  renderRewards();
}

function syncSavedCouponsToBackend() {
  state.coupons.forEach((coupon) => { void syncCouponToBackend(coupon); });
}

function renderRewardDialog() {
  const reward = REWARDS.find((item) => item.id === currentCoupon?.rewardId) || REWARDS[0];
  const offer = couponOffer(currentCoupon);
  elements.rewardImage.src = reward.image;
  elements.rewardImage.alt = rewardName(reward);
  elements.rewardDiscount.textContent = rewardDiscount(offer);
  elements.rewardProduct.textContent = rewardName(reward);
  elements.rewardDetail.textContent = [
    currentCoupon?.milestone ? t("earnedFrom", { value: currentCoupon.milestone }) : "",
    t(offer.minimum ? "couponMinimum" : "couponDetail"),
  ].filter(Boolean).join(" · ");
  elements.rewardCode.textContent = currentCoupon?.code || "—";
  elements.copyCouponButton.textContent = t(copied ? "copied" : "copy");
}

function weightedReward() {
  if (!state.rewardPool?.length) state.rewardPool = REWARDS.map((reward) => reward.id);
  const lastRewardId = state.coupons[0]?.rewardId;
  // Draw without replacement. At a cycle boundary, keep the last reward in
  // the pool but exclude it from the first draw so it can appear later.
  const available = REWARDS.filter((reward) => state.rewardPool.includes(reward.id));
  const candidates = available.filter((reward) => reward.id !== lastRewardId);
  const pool = candidates.length ? candidates : available;
  const total = pool.reduce((sum, reward) => sum + reward.weight, 0);
  let roll = Math.random() * total;
  let chosen = pool[pool.length - 1];
  for (const reward of pool) {
    roll -= reward.weight;
    if (roll < 0) {
      chosen = reward;
      break;
    }
  }
  state.rewardPool = state.rewardPool.filter((id) => id !== chosen.id);
  return chosen;
}

async function copyCoupon() {
  const code = elements.rewardCode.textContent;
  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const input = document.createElement("textarea");
    input.value = code;
    document.body.append(input);
    input.select();
    let success = false;
    try { success = document.execCommand("copy"); } catch { /* Manual copy remains available. */ }
    input.remove();
    if (!success) {
      showToast("copyFailed");
      return;
    }
  }
  copied = true;
  elements.copyCouponButton.textContent = t("copied");
  window.setTimeout(() => {
    copied = false;
    elements.copyCouponButton.textContent = t("copy");
  }, 1600);
}

function openDialog(dialog) {
  document.body.classList.add("is-dialog-open");
  dialog.showModal();
}

function closeDialog(dialog) {
  dialog.close();
  document.body.classList.remove("is-dialog-open");
}

function showToast(key, params = {}) {
  window.clearTimeout(toastTimer);
  activeToast = { key, params };
  elements.toast.textContent = toastText();
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    activeToast = null;
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

function toastText() {
  const { key, params } = activeToast;
  return t(key, params.gemValue ? { ...params, name: gemName(mineralFor(params.gemValue)) } : params);
}

function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
}

function directionFromKey(key) {
  const keyMap = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  };
  return keyMap[key];
}

elements.startButton.addEventListener("click", () => startNewGame());
elements.restartButton.addEventListener("click", () => startNewGame({ confirmRestart: true }));
elements.playAgainButton.addEventListener("click", () => {
  closeDialog(elements.gameoverDialog);
  startNewGame();
});
elements.drawButton.addEventListener("click", drawReward);
elements.claimRewardButton.addEventListener("click", () => {
  closeDialog(elements.gameoverDialog);
  drawReward();
});
elements.copyCouponButton.addEventListener("click", copyCoupon);
elements.browseButton.addEventListener("click", () => {
  // The boost belongs to EVRIS's actual product pages, not a game-only mock
  // catalogue. The shared clock continues once the shopper arrives there.
  window.GemEnergy.stopBrowsing();
});
elements.closeBrowseButton.addEventListener("click", () => closeDialog(elements.browseDialog));
elements.returnToGameButton.addEventListener("click", () => closeDialog(elements.browseDialog));
elements.browseDialog.addEventListener("close", () => {
  document.body.classList.remove("is-dialog-open");
  window.GemEnergy.stopBrowsing();
  if (state.started) elements.board.focus({ preventScroll: true });
});
for (const name of ["pointerdown", "keydown", "scroll", "wheel", "touchstart"]) {
  document.addEventListener(name, (event) => {
    if (elements.browseDialog.open || event.target.closest?.(".mineral-ledger")) {
      window.GemEnergy.recordActivity();
    }
  }, { passive: true, capture: true });
}
elements.language.addEventListener("change", () => {
  if (!Object.hasOwn(GAME_LOCALES, elements.language.value)) return;
  state.language = elements.language.value;
  saveState();
  renderAll();
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(elements.rewardDialog));
});
document.querySelectorAll("[data-close-gameover]").forEach((button) => {
  button.addEventListener("click", () => closeDialog(elements.gameoverDialog));
});
[elements.rewardDialog, elements.gameoverDialog].forEach((dialog) => {
  dialog.addEventListener("close", () => document.body.classList.remove("is-dialog-open"));
});
document.querySelectorAll("[data-direction]").forEach((button) => {
  button.addEventListener("click", () => move(button.dataset.direction));
});

document.addEventListener("keydown", (event) => {
  // Leave native select navigation and dialog/button keyboard interaction alone.
  if (event.target.closest("input, select, textarea, button, dialog, [contenteditable]")) return;
  if (!state.started || elements.rewardDialog.open || elements.gameoverDialog.open) return;
  const direction = directionFromKey(event.key);
  if (!direction) return;
  event.preventDefault();
  move(direction);
});

elements.board.addEventListener("pointerdown", (event) => {
  touchStart = { x: event.clientX, y: event.clientY };
});

elements.board.addEventListener("pointerup", (event) => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
});

elements.board.addEventListener("pointercancel", () => { touchStart = null; });

window.GemEnergy.subscribe((recovery) => {
  const recovered = recovery.energy - state.energy;
  renderEnergy(recovery);
  if (recovered !== 0) saveState();
  if (recovered > 0 && document.visibilityState === "visible") showToast("energyRecovered", { count: recovered });
});
const recoveredAtLaunch = window.GemEnergy.snapshot().energy - state.energy;
renderEnergy();
saveState();
renderAll();
syncSavedCouponsToBackend();
if (recoveredAtLaunch > 0) showToast("energyRecovered", { count: recoveredAtLaunch });
