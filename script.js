// Hero name: typewriter effect (no cursor)
function initTypewriter() {
  const el = document.querySelector(".typewriter-text");
  if (!el) return;
  const text = el.getAttribute("data-typing") || "Mounika";
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    el.textContent = text;
    return;
  }
  const speed = 160;
  el.textContent = "";
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(type, speed);
    }
  }
  type();
  setTimeout(function () {
    if (el.textContent === "") el.textContent = text;
  }, text.length * speed + 500);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTypewriter);
} else {
  initTypewriter();
}

// Contact form: open mailto with form data
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = (this.querySelector('[name="name"]') || {}).value || "";
    const email = (this.querySelector('[name="email"]') || {}).value || "";
    const subject = (this.querySelector('[name="subject"]') || {}).value || "";
    const message = (this.querySelector('[name="message"]') || {}).value || "";
    const body = "Name: " + name + "\n\n" + message;
    const mailto = "mailto:mounika.geriki@stonybrook.edu?subject=" + encodeURIComponent(subject || "Portfolio contact") + "&body=" + encodeURIComponent(body);
    window.location.href = mailto;
  });
}

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
    }
  });
}

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

// In-page anchor navigation
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId.length > 1) {
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    }
  });
});

// Footer year
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Section reveal: fade in from below, once
const revealSections = document.querySelectorAll(".contact-section, .other-projects");
if (revealSections.length && !prefersReducedMotion && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  revealSections.forEach((el) => sectionObserver.observe(el));
} else {
  revealSections.forEach((el) => el.classList.add("in-view"));
}

/* Project category tabs — instant switch (no slide animation) */
const categoryTabs = document.querySelectorAll(".category-tab");
const projectCategories = document.querySelectorAll(".project-category");

categoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetCategory = tab.getAttribute("data-category");
    categoryTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    projectCategories.forEach((cat) => {
      cat.classList.toggle("active", cat.getAttribute("data-category") === targetCategory);
    });
  });
});

/* Background particles (canvas) — subtle dot + line network */
(() => {
  const canvas = document.getElementById("bg-particles");
  if (!canvas) return;

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  /** @type {CanvasRenderingContext2D | null} */
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  let w = 0;
  let h = 0;
  let particles = [];
  let rafId = 0;

  const CONFIG = {
    density: 0.000085,
    minR: 0.9,
    maxR: 2.6,
    minV: 0.08,
    maxV: 0.28,
    linkDist: 140,
    linkAlpha: 0.075,
    dotAlpha: 0.62,
    tint: { r: 99, g: 102, b: 241 },
  };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const targetCount = Math.max(18, Math.min(120, Math.floor(w * h * CONFIG.density)));
    const next = [];
    for (let i = 0; i < targetCount; i++) {
      const existing = particles[i];
      next.push(
        existing || {
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(CONFIG.minV, CONFIG.maxV) * (Math.random() < 0.5 ? -1 : 1),
          vy: rand(CONFIG.minV, CONFIG.maxV) * (Math.random() < 0.5 ? -1 : 1),
          r: rand(CONFIG.minR, CONFIG.maxR),
        }
      );
    }
    particles = next;
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    }

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        const maxD = CONFIG.linkDist;
        if (d2 > maxD * maxD) continue;
        const d = Math.sqrt(d2);
        const t = 1 - d / maxD;
        ctx.strokeStyle = `rgba(${CONFIG.tint.r}, ${CONFIG.tint.g}, ${CONFIG.tint.b}, ${CONFIG.linkAlpha * t})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const p of particles) {
      ctx.fillStyle = `rgba(${CONFIG.tint.r}, ${CONFIG.tint.g}, ${CONFIG.tint.b}, ${CONFIG.dotAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = window.requestAnimationFrame(step);
  }

  function start() {
    cancelAnimationFrame(rafId);
    resize();
    rafId = window.requestAnimationFrame(step);
  }

  let resizeT;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeT);
    resizeT = window.setTimeout(resize, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!rafId) {
      rafId = window.requestAnimationFrame(step);
    }
  });

  start();
})();
