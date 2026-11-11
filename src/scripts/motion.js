// Motion for the whole site, following the "Motion notes" panel in Figma.
// Everything here is progressive: without JS, or with reduced motion, the content shows in its final state.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initMotion() {
  setupMenu();
  setupEmailCopy();
  setupNavHide();
  setupToc();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !document.documentElement.classList.contains('motion')) {
    document.documentElement.classList.remove('motion');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === '#top' ? 0 : -24 });
      history.pushState(null, '', id);
    });
  });

  // Headline lines rise out of a mask (Endcap style). CSS hides them below the mask first.
  document.querySelectorAll('[data-split]').forEach((el) => {
    const lines = el.querySelectorAll('.line-mask > span');
    const inHero = el.closest('[data-hero]');
    gsap.fromTo(lines, { y: 0, yPercent: 105 }, {
      y: 0, yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.08, delay: inHero ? 0.15 : 0,
      scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 85%' },
    });
  });

  // Fade up on enter, with a small stagger for siblings
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal')) : [el];
    const i = Math.max(0, siblings.indexOf(el));
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: Math.min(i, 6) * 0.06,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  // Parallax: data-speed="0.9" moves slower than the page, "1.1" faster
  gsap.utils.toArray('[data-speed]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed || '1');
    gsap.fromTo(el, { y: () => (1 - speed) * -120 }, {
      y: () => (1 - speed) * 120, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });

  // Hero visual: blueprint lines draw in, then the seam moves as you scroll
  const hv = document.querySelector('[data-hero-visual]');
  if (hv) {
    const rects = hv.querySelectorAll('.wire .draw');
    gsap.fromTo(rects, { strokeDasharray: '0 100' }, {
      strokeDasharray: (i, r) => (r.classList.contains('dashed') ? '6 5' : '100 0'),
      duration: 1.2, ease: 'power2.out', stagger: 0.004, delay: 0.4,
    });
    gsap.from(hv.querySelectorAll('.wire .note'), { opacity: 0, duration: 0.5, stagger: 0.03, delay: 1.2 });
    gsap.fromTo(hv, { '--seam': '78%' }, {
      '--seam': '12%', ease: 'none',
      scrollTrigger: { trigger: hv, start: 'top 75%', end: 'bottom 30%', scrub: 1.2 },
    });
  }

  // Count-up numbers
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const raw = el.textContent.trim();
    const m = raw.match(/^(~?)(\d+)(.*)$/);
    if (!m) return;
    const [, pre, num, post] = m;
    const obj = { v: 0 };
    el.textContent = `${pre}0${post}`;
    gsap.to(obj, {
      v: Number(num), duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate() { el.textContent = `${pre}${Math.round(obj.v)}${post}`; },
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// Sticky table of contents: highlight the section in view. Works with or without motion.
function setupToc() {
  const links = [...document.querySelectorAll('[data-toc] a')];
  if (!links.length) return;
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((x) => { x.classList.remove('active'); x.removeAttribute('aria-current'); });
      const a = byId.get(e.target.id);
      if (a) { a.classList.add('active'); a.setAttribute('aria-current', 'location'); }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });

  // Wide diagrams break out over the TOC column: hide the TOC while one is on screen.
  const toc = document.querySelector('[data-toc]');
  const wides = document.querySelectorAll('[data-wide]');
  if (toc && wides.length) {
    const visible = new Set();
    const wo = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      toc.classList.toggle('toc--hide', visible.size > 0);
    }, { rootMargin: '-10% 0px -10% 0px' });
    wides.forEach((w) => wo.observe(w));
  }
}

function setupNavHide() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  let last = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const menuOpen = document.querySelector('[data-menu]:not([hidden])');
    if (!menuOpen) nav.classList.toggle('is-hidden', y > 200 && y > last + 4);
    if (y < last - 4) nav.classList.remove('is-hidden');
    last = y;
  }, { passive: true });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
}

function setupMenu() {
  const openBtn = document.querySelector('[data-menu-open]');
  const menu = document.querySelector('[data-menu]');
  const closeBtn = document.querySelector('[data-menu-close]');
  if (!openBtn || !menu || !closeBtn) return;
  const open = () => { menu.hidden = false; openBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; closeBtn.focus(); };
  const close = () => { menu.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; openBtn.focus(); };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  menu.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => { menu.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }));
  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    // Keep Tab inside the open menu (it covers the page).
    if (e.key === 'Tab') {
      const f = [...menu.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

function setupEmailCopy() {
  const toast = document.querySelector('[data-toast]');
  document.querySelectorAll('[data-copy-email]').forEach((a) => {
    a.addEventListener('click', async () => {
      // The mailto link still opens. Copying is a bonus for people without a mail app.
      try {
        await navigator.clipboard.writeText(a.dataset.copyEmail);
        if (toast) { toast.textContent = 'Email copied'; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800); }
      } catch { /* clipboard not allowed: the mailto link is enough */ }
    });
  });
}
