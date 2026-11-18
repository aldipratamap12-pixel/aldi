// First-visit intro (see IntroLoader.astro). Resolves when the page should start its own entrance,
// a little before the overlay has fully left, so the two overlap. Resolves at once when there is no intro.
//
// On the home page (desktop with a mouse), the cursor character from ScrollBuddy.astro joins the intro:
// it hops in next to the wordmark, jumps back when the dot rolls towards it, and when the intro leaves
// it leaps onto the hero's "Contact me" button. That is why it stands there when the page appears.
// ScrollBuddy waits while <html> has the .intro class, then takes over from the same spot.
import { gsap } from 'gsap';

// Archivo ExtraBold metrics in em, measured in the browser for the logo at 260 px.
const DOT = 0.1796; // the full stop is a square
const DOT_INK = 0.0627; // its ink starts this far into its advance
const BW = 48, BH = 44; // the cursor character's box (ScrollBuddy.astro)

export function playIntro() {
  const root = document.documentElement;
  const el = document.querySelector('[data-intro]');
  if (!el || !root.classList.contains('intro')) return Promise.resolve();

  const buddy = document.querySelector('[data-buddy]');
  const cta = document.querySelector('[data-hero] .ctas .btn:last-child'); // ScrollBuddy's first spot
  const withBuddy = !!(buddy && cta && matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches);

  return new Promise((resolve) => {
    let started = false, done = false, stopBuddy = () => {};
    const go = () => { if (!started) { started = true; resolve(); } };
    const finish = () => {
      if (done) return; done = true; go();
      stopBuddy();
      root.classList.remove('intro'); el.remove();
      removeEventListener('pointerdown', skip); removeEventListener('keydown', skip); removeEventListener('wheel', skip); removeEventListener('touchstart', skip);
    };
    let tl = null;
    function skip() { if (tl && tl.time() < tl.labels.exit) tl.seek('exit'); else if (!tl) finish(); }
    addEventListener('pointerdown', skip); addEventListener('keydown', skip); addEventListener('wheel', skip, { passive: true }); addEventListener('touchstart', skip, { passive: true });

    // Wait for the logo font (never longer than 800 ms), so the measurements and the letters are right.
    const font = document.fonts ? document.fonts.load('800 100px "Archivo Variable"').catch(() => {}) : Promise.resolve();
    Promise.race([font, new Promise((r) => setTimeout(r, 800))]).then(() => {
      if (done) return;
      el.style.animation = 'none'; // the script is running: cancel the CSS failsafe
      const word = el.querySelector('[data-intro-word]');
      const letters = el.querySelectorAll('[data-g]');
      const i = el.querySelector('[data-i]');
      const dot = el.querySelector('[data-dot]');
      const em = parseFloat(getComputedStyle(word).fontSize);
      const iBox = i.parentElement; // the mask holds the advance of the "i"
      const baseline = el.querySelector('[data-base]').offsetTop;
      const d = DOT * em;
      const endX = iBox.offsetLeft + iBox.offsetWidth + DOT_INK * em; // final place: the full stop
      // It lands one dot-width to the left (over the spot of the "i"); a quarter roll brings it home.
      gsap.set(dot, { x: endX - d, y: baseline - d, opacity: 0 });

      tl = gsap.timeline({ onComplete: finish });
      tl.to(letters, { y: 0, yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0)
        // The dot drops with gravity, lands, two small bounces that die out.
        .set(dot, { opacity: 1 }, 0.3)
        .fromTo(dot, { y: baseline - d - 1.6 * em }, { y: baseline - d, duration: 0.45, ease: 'power2.in' }, 0.3)
        .to(dot, { y: baseline - d - 0.1 * em, duration: 0.15, ease: 'sine.out' }, 0.75)
        .to(dot, { y: baseline - d, duration: 0.15, ease: 'sine.in' }, 0.9)
        .to(dot, { y: baseline - d - 0.025 * em, duration: 0.08, ease: 'sine.out' }, 1.05)
        .to(dot, { y: baseline - d, duration: 0.08, ease: 'sine.in' }, 1.13)
        // The "i" comes up from below and tips the dot over its corner: slow start, a little faster past balance.
        .to(i, { yPercent: 0, y: 0, duration: 0.8, ease: 'expo.out' }, 1.22)
        .to(dot, { rotation: 90, duration: 0.7, ease: 'sine.inOut' }, 1.26)
        .to(dot, { keyframes: [{ scaleX: 1.07, scaleY: 0.9, duration: 0.08, ease: 'sine.out' }, { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1, 0.45)' }] }, 1.96)
        // Role and location fade up under the wordmark once the dot has settled.
        .fromTo(el.querySelector('[data-intro-tag]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 1.85)
        .addLabel('exit', withBuddy ? 2.75 : 2.6)
        // Out: the wordmark drifts up and fades while the overlay wipes away like the site's headline masks.
        .to(el.querySelector('[data-intro-lockup]'), { y: -0.14 * em, opacity: 0, duration: 0.7, ease: 'sine.inOut' }, 'exit')
        .to(el.querySelector('.intro-hint'), { opacity: 0, duration: 0.3 }, 'exit')
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'expo.inOut' }, 'exit+=0.12')
        .call(go, [], 'exit+=0.35');

      if (withBuddy) stopBuddy = addBuddy(tl, { word, em, baseline, dotRight: endX + d });
    });

    // The cursor character: a hop in, a startled hop, then the leap onto "Contact me" as the intro leaves.
    function addBuddy(tl, { word, em, baseline, dotRight }) {
      const body = buddy.querySelector('.sb-body');
      const face = buddy.querySelector('.sb-face');
      const legs = [...buddy.querySelectorAll('.sb-leg')];
      const pupils = [...buddy.querySelectorAll('.sb-pupil')];
      const eyes = [...buddy.querySelectorAll('.sb-eye')];
      const S = { x: innerWidth + BW, y: 0, sx: 1, sy: 1, r: 0 };
      const legPose = (a, b) => { legs[0].style.transform = `rotate(${a}deg)`; legs[1].style.transform = `rotate(${b}deg)`; };
      const look = (x, y) => pupils.forEach((p) => (p.style.transform = `translate(${x}px, ${y}px)`));
      const blink = () => eyes.forEach((e) => e.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.08)', offset: 0.45 }, { transform: 'scaleY(.08)', offset: 0.55 }, { transform: 'scaleY(1)' }], { duration: 170, easing: 'ease-in-out' }));
      // Live spots in viewport px (feet position).
      const logoSpot = (dx = 0) => { const r = word.getBoundingClientRect(); return { x: r.left + dotRight + 0.3 * em + dx, y: r.top + baseline }; };
      const ctaSpot = () => { const r = cta.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 2 }; };
      const draw = () => {
        buddy.style.transform = `translate3d(${(S.x - BW / 2).toFixed(1)}px, ${(S.y - BH).toFixed(1)}px, 0)`;
        body.style.transform = `rotate(${S.r.toFixed(2)}deg) scale(${S.sx.toFixed(3)}, ${S.sy.toFixed(3)})`;
      };

      buddy.hidden = false;
      buddy.style.zIndex = '210'; // above the overlay while it flies
      face.style.transform = 'scaleX(-1)'; // facing left, the way ScrollBuddy starts
      body.classList.remove('idle');
      S.y = logoSpot().y;
      draw();
      gsap.ticker.add(draw);

      // A jump along a ballistic arc between two live spots; h = height of the arc above the straight line.
      const arc = (at, dur, from, to, h) => {
        const p = { u: 0 };
        tl.to(p, { u: 1, duration: dur, ease: 'none', onStart: () => look(1.4, -1.2), onUpdate() {
          const u = p.u, a = from(), b = to();
          S.x = a.x + (b.x - a.x) * u; S.y = a.y + (b.y - a.y) * u - 4 * h * u * (1 - u);
          const vy = (b.y - a.y) - 4 * h * (1 - 2 * u), s = Math.min(0.12, Math.abs(vy) / 2600);
          S.sy = 1 + s; S.sx = 1 - s * 0.55; S.r = Math.max(-6, Math.min(6, vy / 90)) * 0.5;
          vy < 0 ? legPose(-22, 26) : legPose(14, -10);
        } }, at);
      };
      const crouch = (at) => tl.to(S, { sx: 1.1, sy: 0.86, r: 0, duration: 0.09, ease: 'sine.out', onStart: () => legPose(-12, 12) }, at);
      const land = (at, k = 1) => tl.to(S, { keyframes: [{ sx: 1 + 0.14 * k, sy: 1 - 0.2 * k, r: 0, duration: 0.06, ease: 'sine.out' }, { sx: 1, sy: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' }],
        onStart: () => { legPose(0, 0); blink(); } }, at);

      // 1. Hops in from the right edge and lands next to where the full stop will end up, watching the dot.
      const edge = () => ({ x: innerWidth + BW, y: logoSpot().y });
      arc(0.32, 0.5, edge, () => logoSpot(), 0.9 * em);
      land(0.82, 0.8);
      tl.call(() => look(1.6, 0.6), [], 0.95);
      // 2. The dot rolls towards it: a startled little hop back.
      crouch(1.5);
      arc(1.59, 0.32, () => logoSpot(), () => logoSpot(0.12 * em), 0.25 * em);
      land(1.91, 0.6);
      tl.call(() => look(0, 0.4), [], 2.2); // looks at us
      tl.call(blink, [], 2.45);
      // 3. The intro leaves: it leaps onto the "Contact me" button, where the page keeps it.
      crouch('exit');
      arc('exit+=0.09', 0.85, () => logoSpot(0.12 * em), ctaSpot, 0.6 * em);
      land('exit+=0.94', 1);
      tl.call(() => look(1.4, 1), [], 'exit+=1.1');

      return () => {
        gsap.ticker.remove(draw);
        draw();
        buddy.style.zIndex = '';
        legPose(0, 0);
      };
    }
  });
}
