(() => {
  if (!document.body.classList.contains("home-page")) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.querySelector(".hero");
  const header = document.querySelector(".site-header");
  const groups = [
    ".store-benefit", ".category-mosaic > a", ".collection .section-heading",
    ".feature-media", ".feature-details", ".collection-copy", ".member-copy",
    ".member-card > div", ".styling-photo", ".styling-panel", ".ranking-head",
    ".product-card", ".stone-guide .section-label",
    ".stone-grid article", ".store-list .section-label", ".store-columns article",
    ".news-list .section-label", ".news-lines p", ".newsletter > p", ".newsletter form",
  ];
  const elements = groups.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
  let revealObserver;

  function reveal(element) {
    element.classList.remove("is-awaiting-reveal");
    revealObserver?.unobserve(element);
  }

  function configureReveals() {
    revealObserver?.disconnect();
    elements.forEach(reveal);
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });

    groups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        // Never hide content already visible, above the viewport, or filtered out.
        if (!element.getClientRects().length || element.getBoundingClientRect().top < window.innerHeight) return;
        element.style.setProperty("--reveal-delay", `${(index % 4) * 65}ms`);
        element.classList.add("motion-reveal", "is-awaiting-reveal");
        revealObserver.observe(element);
      });
    });
  }

  document.addEventListener("focusin", (event) => {
    const element = event.target.closest(".is-awaiting-reveal");
    if (element) reveal(element);
  });

  const progress = document.createElement("div");
  progress.className = "page-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);
  let progressFrame = 0;

  function updateProgress() {
    progressFrame = 0;
    const length = document.documentElement.scrollHeight - window.innerHeight;
    const amount = length > 0 ? Math.max(0, Math.min(1, window.scrollY / length)) : 0;
    progress.style.setProperty("--page-progress", amount);

    if (hero && header) {
      const heroBounds = hero.getBoundingClientRect();
      const headerHeight = header.getBoundingClientRect().height;
      const heroBottom = Number.isFinite(heroBounds.bottom)
        ? heroBounds.bottom
        : heroBounds.top + heroBounds.height;
      header.classList.toggle("is-past-hero", heroBottom <= headerHeight);
    }
  }

  function scheduleProgress() {
    if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
  }

  window.addEventListener("scroll", scheduleProgress, { passive: true });
  window.addEventListener("resize", scheduleProgress, { passive: true });
  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleProgress).observe(document.body);
  }

  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      hero.classList.toggle("is-offscreen", !entry.isIntersecting);
    }).observe(hero);
  }

  const wordmark = document.querySelector(".hero-copy-wordmark");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let foilFrame = 0;
  let foilPoint;

  function resetFoil() {
    cancelAnimationFrame(foilFrame);
    foilFrame = 0;
    wordmark?.classList.remove("has-foil-light");
    ["--foil-position", "--foil-offset-x", "--foil-offset-y"].forEach((property) => {
      wordmark?.style.removeProperty(property);
    });
  }

  wordmark?.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== "mouse") return;
    foilPoint = { x: event.clientX, y: event.clientY };
    if (foilFrame) return;
    // Only the letter reflections react; the photograph and text layout stay still.
    foilFrame = requestAnimationFrame(() => {
      foilFrame = 0;
      const bounds = wordmark.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(0, Math.min(1, (foilPoint.x - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (foilPoint.y - bounds.top) / bounds.height));
      wordmark.style.setProperty("--foil-position", `${x * 100}%`);
      wordmark.style.setProperty("--foil-offset-x", `${(x - 0.5) * 4}px`);
      wordmark.style.setProperty("--foil-offset-y", `${(y - 0.5) * 4}px`);
      wordmark.classList.add("has-foil-light");
    });
  }, { passive: true });
  wordmark?.addEventListener("pointerleave", resetFoil);
  wordmark?.addEventListener("pointercancel", resetFoil);
  window.addEventListener("blur", resetFoil);
  finePointer.addEventListener("change", resetFoil);
  reducedMotion.addEventListener("change", resetFoil);

  reducedMotion.addEventListener("change", configureReveals);
  window.addEventListener("pageshow", scheduleProgress);
  configureReveals();
  updateProgress();
})();
