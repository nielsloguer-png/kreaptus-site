/* Kreaptus — interacções e animações */
(function () {
  const root = document.documentElement;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();
  document.body.classList.add('is-loading');
  if (hasGSAP && !reduced) root.classList.add('js');

  /* ---------- menu ---------- */
  const burger = document.querySelector('.nav__burger');
  const menu = document.querySelector('.menu');
  function toggleMenu(open) {
    const isOpen = open ?? !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    menu.setAttribute('aria-hidden', !isOpen);
    if (window.__lenis) isOpen ? window.__lenis.stop() : window.__lenis.start();
  }
  burger.addEventListener('click', () => toggleMenu());
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* ---------- sketches: lightbox ---------- */
  const lb = document.querySelector('.lightbox');
  const lbImg = lb.querySelector('img');
  const closeLb = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); window.__lenis && window.__lenis.start(); };
  document.querySelectorAll('.sheet__paper, .zoomable').forEach(b => b.addEventListener('click', () => {
    lbImg.src = b.dataset.full;
    lbImg.alt = b.querySelector('img').alt;
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    window.__lenis && window.__lenis.stop();
  }));
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* ---------- case study tabs (Toyota) ---------- */
  const tabs = Array.from(document.querySelectorAll('.case__tabs [role="tab"]'));
  const selectTab = t => {
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', on);
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); selectTab(n);
    });
  });

  /* ---------- form → mailto ---------- */
  document.getElementById('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = `Pedido de reunião — ${f.get('tipo')} — ${f.get('nome')}`;
    const body = `Nome: ${f.get('nome')}\nTelefone: ${f.get('telefone') || '—'}\nTipo de projecto: ${f.get('tipo')}\n\n${f.get('mensagem')}`;
    window.location.href = `mailto:kuendi@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  /* ---------- loader ---------- */
  const loader = document.querySelector('.loader');
  const numEl = document.getElementById('loadNum');
  const barEl = document.querySelector('.loader__bar span');
  const imgs = Array.from(document.images);
  let loaded = 0, shown = 0;
  const target = () => Math.round((loaded / imgs.length) * 100);
  imgs.forEach(img => {
    if (img.complete) loaded++;
    else { img.addEventListener('load', () => loaded++, { once: true }); img.addEventListener('error', () => loaded++, { once: true }); }
  });
  const started = performance.now();
  function tick() {
    // time-driven so throttled frames can't stall it: ~1.6s when images are ready, max ~2.6s
    const elapsed = performance.now() - started;
    const byTime = Math.min(100, elapsed / 26);
    const byLoad = Math.min(100, elapsed / 16) * (target() / 100);
    shown = Math.max(shown, byTime, byLoad);
    // hold at 96% until the walkthrough's first frames are in (capped at ~9s so it never blocks)
    if (!window.__walkReady && hasGSAP && !reduced && elapsed < 9000) shown = Math.min(shown, 96);
    numEl.textContent = Math.floor(shown);
    barEl.style.width = shown + '%';
    if (shown < 100) requestAnimationFrame(tick); else finishLoading();
  }
  requestAnimationFrame(tick);

  function finishLoading() {
    document.body.classList.remove('is-loading');
    if (!hasGSAP || reduced) { loader.remove(); return; }
    gsap.timeline()
      .to('.loader__inner', { yPercent: -40, opacity: 0, duration: .6, ease: 'power3.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=.1')
      .add(() => loader.remove())
      .add(heroIntro(), '-=.75');
  }

  if (!hasGSAP || reduced) return;

  /* ============ GSAP from here ============ */
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const el = id === '#topo' ? 0 : document.querySelector(id);
      if (el === null) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    }));
  }

  /* hero intro */
  function heroIntro() {
    return gsap.timeline()
      .from('.walk__canvas', { scale: 1.18, duration: 2.4, ease: 'expo.out' }, 0)
      .to('.hero__title .line>span', { y: 0, duration: 1.3, stagger: .12, ease: 'expo.out' }, .15)
      .to('.hero__eyebrow', { opacity: 1, duration: .8 }, .5)
      .fromTo('.hero__bottom', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, .7)
      .to('.hero__scroll', { opacity: 1, duration: 1 }, 1)
      .from('.nav', { opacity: 0, duration: 1.2, ease: 'power2.out' }, .5);
  }

  /* ---------- walkthrough: image sequence scrubbed by scroll ---------- */
  const walk = document.querySelector('.walk');
  const canvas = walk.querySelector('.walk__canvas');
  const ctx = canvas.getContext('2d');
  const N = +walk.dataset.frames;
  const set = window.innerWidth < 900 ? 'mobile' : 'desktop';
  const frames = new Array(N);
  const frameSrc = i => `assets/walk/${set}/f${String(i + 1).padStart(4, '0')}.jpg`;

  function loadFrame(i) {
    return new Promise(res => {
      if (frames[i]) return res();
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        // decode off the main thread before first use so scrubbing never hitches
        (im.decode ? im.decode() : Promise.resolve()).catch(() => {}).then(() => {
          frames[i] = im;
          if (Math.abs(i - cur * (N - 1)) < 2 || lastKey === '') draw(true);
          res();
        });
      };
      im.onerror = res;
      im.src = frameSrc(i);
    });
  }
  async function loadPass(indices, concurrency = 6) {
    let k = 0;
    const worker = async () => { while (k < indices.length) await loadFrame(indices[k++]); };
    await Promise.all(Array.from({ length: concurrency }, worker));
  }
  (async () => {
    // coarse-to-fine: every 16th frame first (enough to scrub), then fill the gaps
    for (const stride of [16, 8, 4, 2, 1]) {
      const idx = [];
      for (let i = 0; i < N; i += stride) if (!frames[i]) idx.push(i);
      if (stride === 16) idx.push(N - 1);
      await loadPass(idx);
      if (stride === 16) { window.__walkReady = true; walk.classList.add('is-ready'); }
    }
  })();

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw(true);
  }
  let lastKey = '', cur = 0, walkTarget = 0;
  // closest loaded frame at or before i, and at or after i
  function loadedBelow(i) { for (let k = i; k >= 0; k--) if (frames[k]) return k; return -1; }
  function loadedAbove(i) { for (let k = i; k < N; k++) if (frames[k]) return k; return -1; }
  function paint(im, alpha) {
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  // sub-frame blending: mix the two loaded frames around the exact scroll position,
  // so motion stays continuous between frames (and between sparse frames while loading)
  function draw(force) {
    const f = cur * (N - 1);
    let a = loadedBelow(Math.floor(f)), b = loadedAbove(Math.ceil(f));
    if (a < 0 && b < 0) return;
    if (a < 0) a = b; if (b < 0) b = a;
    const t = b === a ? 0 : (f - a) / (b - a);
    const key = a + ':' + b + ':' + Math.round(t * 32);
    if (!force && key === lastKey) return;
    lastKey = key;
    paint(frames[a], 1);
    if (t > 0.02) paint(frames[b], t);
    ctx.globalAlpha = 1;
  }
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  const chapters = gsap.utils.toArray('.walk__chapter:not(.hero__content)');
  const intro = walk.querySelector('.hero__content');
  const rooms = gsap.utils.toArray('.walk__rooms li');
  const bar = walk.querySelector('.walk__bar span');
  const scrollHint = walk.querySelector('.hero__scroll');
  ScrollTrigger.create({
    trigger: walk, start: 'top top', end: 'bottom bottom',
    onUpdate: s => { walkTarget = s.progress; }
  });
  gsap.ticker.add(() => {
    cur += (walkTarget - cur) * 0.085;
    if (Math.abs(walkTarget - cur) < 0.00005) cur = walkTarget;
    draw(false);
    const p = cur;
    bar.style.width = (p * 100) + '%';
    // intro fades & lifts away as you start walking in
    const introOut = gsap.utils.clamp(0, 1, (p - 0.04) / 0.1);
    intro.style.opacity = 1 - introOut;
    intro.style.transform = `translateY(${-introOut * 60}px)`;
    scrollHint.style.opacity = introOut > 0 ? 1 - introOut : '';
    chapters.forEach(c => {
      const on = p >= +c.dataset.from && p <= +c.dataset.to;
      if (on !== c._on) {
        c._on = on;
        gsap.to(c, on
          ? { autoAlpha: 1, y: 0, duration: .9, ease: 'expo.out', overwrite: true }
          : { autoAlpha: 0, y: -30, duration: .5, ease: 'power2.in', overwrite: true });
      }
    });
    let active = 0;
    rooms.forEach((r, i) => { if (p >= +r.dataset.at) active = i; });
    rooms.forEach((r, i) => r.classList.toggle('is-on', i === active));
  });
  gsap.set(chapters, { y: 40 });

  /* nav state */
  const nav = document.querySelector('.nav');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 400 && !document.body.classList.contains('menu-open'));
      lastY = y;
    }
  });

  /* ---------- word splitter (keeps <br>, keeps .grad per word) ---------- */
  function splitWords(el, masked) {
    const words = [];
    const walk = (node, grad) => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w' + (grad ? ' grad' : '');
            w.textContent = part;
            if (masked) {
              const m = document.createElement('span');
              m.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em';
              w.style.display = 'inline-block';
              m.appendChild(w); frag.appendChild(m);
            } else frag.appendChild(w);
            words.push(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          const isGrad = grad || child.classList.contains('grad');
          if (child.classList.contains('grad')) child.classList.remove('grad');
          walk(child, isGrad);
        }
      });
    };
    walk(el, false);
    return words;
  }

  /* headings: masked word rise */
  document.querySelectorAll('.split-lines').forEach(el => {
    const words = splitWords(el, true);
    gsap.from(words, { yPercent: 110, duration: 1.2, stagger: .045, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  /* about: colour fill as you scroll */
  document.querySelectorAll('.fill-text').forEach(el => {
    const words = splitWords(el, false);
    gsap.to(words, { color: '#F4F4F8', stagger: .1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });

  /* manifesto: words light up */
  document.querySelectorAll('.split-words').forEach(el => {
    const words = splitWords(el, false);
    gsap.to(words, { opacity: 1, stagger: .15, ease: 'none', scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 40%', scrub: true } });
  });

  /* generic reveals */
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: .08, ease: 'expo.out', overwrite: true })
  });
  gsap.utils.toArray('.clip-reveal').forEach(el => {
    gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 80%' } });
  });
  gsap.utils.toArray('.parallax-img').forEach(img => {
    gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* marquee reacts to scroll velocity */
  const track = document.querySelector('.marquee__track');
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: self => {
      const v = gsap.utils.clamp(-4, 4, self.getVelocity() / 400);
      track.style.animationDuration = Math.max(6, 26 - Math.abs(v) * 5) + 's';
      track.style.animationDirection = v < -0.2 ? 'reverse' : 'normal';
    }
  });

  /* ---------- horizontal projects (desktop) ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const tr = document.querySelector('.projects__track');
    const dist = () => tr.scrollWidth + tr.offsetLeft - window.innerWidth;
    const tween = gsap.to(tr, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.projects', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: s => gsap.set('.projects__progress span', { width: (s.progress * 100) + '%' })
      }
    });
    gsap.utils.toArray('.proj__img img').forEach(img => {
      gsap.fromTo(img, { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: img.closest('.proj'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
    });
  });

  /* ---------- method steps ---------- */
  const steps = gsap.utils.toArray('.step');
  mm.add({ wide: '(min-width: 1101px)', narrow: '(max-width: 1100px)' }, ctx => {
    const prop = ctx.conditions.wide ? 'scaleX' : 'scaleY';
    gsap.fromTo('.steps__line span', { [prop]: 0 }, { [prop]: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 60%', scrub: true } });
  });
  steps.forEach(s => {
    ScrollTrigger.create({ trigger: s, start: 'top 65%', onEnter: () => s.classList.add('is-on'), onLeaveBack: () => s.classList.remove('is-on') });
    gsap.from(s, { opacity: 0, y: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 88%' } });
  });

  /* sketches "draw" in left-to-right as they scroll into view */
  const idxItems = gsap.utils.toArray('.sketch__index li');
  gsap.utils.toArray('.sheet').forEach((s, i) => {
    ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: t => idxItems[i] && idxItems[i].classList.toggle('is-on', t.isActive) });
    const img = s.querySelector('.sheet__paper img');
    gsap.to(img, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: s, start: 'top 85%', end: 'top 30%', scrub: .6 } });
    gsap.from(s.querySelector('.sheet__paper'), { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 92%' } });
    gsap.from(s.querySelector('.sheet__info'), { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 70%' } });
  });

  /* values cards stagger */
  gsap.from('.value', { y: 80, opacity: 0, duration: 1.2, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.values__grid', start: 'top 85%' } });

  /* cta glow follows scroll */
  gsap.fromTo('.cta__glow', { scale: .6, opacity: .4 }, { scale: 1.1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.from('.footer__big', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  // lazy images change the page height when they arrive: re-measure (debounced)
  let lazyT;
  document.querySelectorAll('img[loading="lazy"]').forEach(im => im.addEventListener('load', () => {
    clearTimeout(lazyT); lazyT = setTimeout(() => ScrollTrigger.refresh(), 200);
  }, { once: true }));
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  if (!finePointer) return;

  /* ============ desktop pointer effects ============ */

  /* cursor */
  const cursor = document.querySelector('.cursor');
  const label = cursor.querySelector('.cursor__label');
  const cx = gsap.quickTo(cursor, 'x', { duration: .45, ease: 'power3' });
  const cy = gsap.quickTo(cursor, 'y', { duration: .45, ease: 'power3' });
  window.addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); cursor.style.opacity = 1; }, { passive: true });
  document.addEventListener('mouseleave', () => cursor.style.opacity = 0);
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { label.textContent = el.dataset.cursor; cursor.classList.add('is-big'); });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-big'));
  });
  document.querySelectorAll('a, button, .area, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });

  /* magnetic buttons */
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * .35);
      yTo((e.clientY - r.top - r.height / 2) * .35);
    });
    el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });

  /* walkthrough: subtle "look around" with the mouse */
  const hx = gsap.quickTo(canvas, 'x', { duration: 1.4, ease: 'power3' });
  const hy = gsap.quickTo(canvas, 'y', { duration: 1.4, ease: 'power3' });
  walk.addEventListener('mousemove', e => {
    hx((e.clientX / window.innerWidth - .5) * -24);
    hy((e.clientY / window.innerHeight - .5) * -14);
  });

  /* areas floating preview */
  const preview = document.querySelector('.area-preview');
  const pImg = preview.querySelector('img');
  const px = gsap.quickTo(preview, 'x', { duration: .6, ease: 'power3' });
  const py = gsap.quickTo(preview, 'y', { duration: .6, ease: 'power3' });
  const pr = gsap.quickTo(preview, 'rotation', { duration: .8, ease: 'power3' });
  let lastX = 0;
  document.querySelectorAll('.area').forEach(a => {
    a.addEventListener('mouseenter', () => {
      pImg.src = a.dataset.img;
      gsap.to(preview, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out' });
    });
    a.addEventListener('mouseleave', () => gsap.to(preview, { opacity: 0, scale: .6, duration: .4, ease: 'power3.in' }));
    a.addEventListener('mousemove', e => {
      px(e.clientX - 160); py(e.clientY - 200);
      pr(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * .6)); lastX = e.clientX;
    });
  });

  /* tilt cards */
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - .5) * -10;
      const ry = ((e.clientX - r.left) / r.width - .5) * 10;
      gsap.to(card, { rotateX: rx, rotateY: ry, transformPerspective: 800, duration: .5, ease: 'power3' });
    });
    card.addEventListener('mouseleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: .8, ease: 'elastic.out(1,.5)' }));
  });
})();
