// ============================================
// NEDERLY LANDING PAGE — SCRIPTS
// ============================================

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
  });
});

// Scroll reveal animations
const revealElements = document.querySelectorAll(
  '.feature-card, .step-card, .pricing-card, .pricing-free-banner, .synagogues-content, .synagogues-visual, .download-card, .section-header, .bottom-card, .testimonial-card, .faq-item'
);

revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }
);

revealElements.forEach(el => observer.observe(el));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Pricing billing toggle
let isAnnual = false;

function toggleBilling() {
  isAnnual = !isAnnual;
  const toggle = document.getElementById('billingToggle');
  const monthlyLabel = document.getElementById('toggleMonthly');
  const annualLabel = document.getElementById('toggleAnnual');
  const prices = document.querySelectorAll('.price-amount[data-monthly]');

  toggle.classList.toggle('active', isAnnual);
  monthlyLabel.classList.toggle('toggle-label-active', !isAnnual);
  annualLabel.classList.toggle('toggle-label-active', isAnnual);

  prices.forEach(el => {
    el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
  });

  // Update period labels
  document.querySelectorAll('.price-period').forEach(el => {
    el.textContent = isAnnual ? '/ mois (facturé annuellement)' : '/ mois';
  });
}

// Parcours toggle (How it works — Fidèles / Gabayim)
function switchParcours(target) {
  const tabs = document.querySelectorAll('.parcours-tab');
  const contents = document.querySelectorAll('.parcours-content');

  tabs.forEach(tab => {
    tab.classList.toggle('parcours-tab-active', tab.dataset.parcours === target);
  });

  contents.forEach(content => {
    const id = content.id.replace('parcours-', '');
    content.classList.toggle('parcours-hidden', id !== target);
  });
}

// Founders counter — fetch real-time count (placeholder, defaults to 100 if API not ready)
(function () {
  const counter = document.getElementById('foundersCounter');
  if (!counter) return;

  // TODO: replace with real API call when backend ready
  // fetch('https://api.nederly.io/founders/remaining')
  //   .then(r => r.json())
  //   .then(data => { counter.textContent = data.remaining; });

  // For now, display 100 (no Founder yet — pre-launch)
  counter.textContent = '100';
})();

// Live bid feed — cinematic replay (count-up numbers, timer, sync)
(function () {
  const liveFeed = document.querySelector('.live-feed');
  if (!liveFeed) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Animation timings (ms) — MUST match CSS delays
  const BID_DELAYS = [400, 1700, 3000];
  const ALERT_DELAY = 3600;
  const LOOP_DURATION = 7000;

  const amountElements = liveFeed.querySelectorAll('[data-bid-target]');
  const bids = liveFeed.querySelectorAll('.live-bid');
  const alertEl = liveFeed.querySelector('.live-feed-alert');
  const crown = liveFeed.querySelector('.live-bid-crown');
  const sparkles = liveFeed.querySelectorAll('.sparkle');
  const progressFill = liveFeed.querySelector('.lfp-fill');

  // Format 280 -> "280 €"
  function fmt(n) { return Math.round(n).toString() + ' €'; }

  // Animate a single number from 0 -> target
  function countUp(el, target, duration = 700) {
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = fmt(target * ease(p));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(tick);
  }

  // Reset all pieces and re-trigger their CSS animations
  const animatedEls = [...bids, alertEl, crown, ...sparkles, progressFill].filter(Boolean);

  let scheduledTimers = [];
  function clearTimers() {
    scheduledTimers.forEach(id => clearTimeout(id));
    scheduledTimers = [];
  }

  function replayFeed() {
    clearTimers();

    // Reset numbers to 0
    amountElements.forEach(el => { el.textContent = '0 €'; });

    // Reset CSS animations by briefly stripping them
    animatedEls.forEach(el => {
      el.style.animation = 'none';
      // eslint-disable-next-line no-unused-expressions
      el.offsetHeight; // force reflow
      el.style.animation = '';
    });

    if (prefersReduced) {
      // Static snapshot for reduced-motion users
      amountElements.forEach(el => {
        el.textContent = fmt(parseFloat(el.dataset.bidTarget));
      });
      return;
    }

    // Count up each bid in sync with the CSS delay
    bids.forEach((bid, i) => {
      const amountEl = bid.querySelector('[data-bid-target]');
      if (!amountEl) return;
      const target = parseFloat(amountEl.dataset.bidTarget);
      scheduledTimers.push(setTimeout(() => {
        countUp(amountEl, target, 700);
      }, BID_DELAYS[i] + 150)); // start slightly after the card enters
    });

    // Alert amount count-up
    const alertAmount = liveFeed.querySelector('.live-alert-amount');
    if (alertAmount) {
      const target = parseFloat(alertAmount.dataset.bidTarget);
      scheduledTimers.push(setTimeout(() => {
        countUp(alertAmount, target, 500);
      }, ALERT_DELAY + 150));
    }
  }

  // Live countdown timer HH:MM:SS
  const timerEl = liveFeed.querySelector('.live-timer-value');
  if (timerEl && !prefersReduced) {
    let totalSeconds = 2 * 3600 + 34 * 60 + 12;
    function updateTimer() {
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      const pad = n => String(n).padStart(2, '0');
      timerEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
      totalSeconds = totalSeconds > 0 ? totalSeconds - 1 : 2 * 3600 + 34 * 60 + 12;
    }
    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // Start once visible; replay continuously
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        replayFeed();
      }
    });
  }, { threshold: 0.3 });
  io.observe(liveFeed);

  // Replay on interval
  setInterval(replayFeed, LOOP_DURATION);
})();

// ============================================================
// v3 — MODERN UI ENHANCEMENTS
// ============================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Scroll progress bar ----------
(function () {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  let ticking = false;
  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
})();

// ---------- Back-to-top button ----------
(function () {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Retour en haut');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(btn);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  let ticking = false;
  function update() {
    btn.classList.toggle('visible', window.scrollY > 600);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();

// ---------- Hero H1 word-split for staggered reveal ----------
(function () {
  const h1 = document.querySelector('.hero h1');
  if (!h1 || prefersReducedMotion) return;

  // Split text nodes into <span class="word"> tokens while preserving <br> and existing spans
  const tokenize = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      const parts = node.textContent.split(/(\s+)/);
      parts.forEach(part => {
        if (part.trim() === '') {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') return;
      if (node.classList && node.classList.contains('text-gold-hero')) {
        // wrap the whole gold phrase as one animated word
        node.classList.add('word');
        return;
      }
      Array.from(node.childNodes).forEach(tokenize);
    }
  };
  Array.from(h1.childNodes).forEach(tokenize);

  // Re-index nth-child delays (all .word siblings of h1 should animate)
  const words = h1.querySelectorAll('.word');
  words.forEach((w, i) => {
    w.style.animationDelay = (0.1 + i * 0.12) + 's';
  });
})();

// ---------- Enhanced staggered reveal observer (override with direction detection) ----------
(function () {
  // Add stagger class to grid parents whose direct children are reveal items
  const staggerParents = [
    '.features-grid',
    '.steps-grid',
    '.testimonials-grid',
    '.pricing-grid',
    '.bottom-cards-grid',
    '.faq-list',
    '.founders-perks'
  ];
  staggerParents.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.classList.add('stagger'));
  });
})();

// ---------- Hero mouse-follow glow + subtle parallax ----------
(function () {
  const hero = document.querySelector('.hero');
  if (!hero || prefersReducedMotion) return;

  const glow1 = hero.querySelector('.hero-glow-1');
  const glow2 = hero.querySelector('.hero-glow-2');

  let rafId = null;
  let targetX = 50, targetY = 30;
  let currentX = 50, currentY = 30;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    targetX = ((e.clientX - rect.left) / rect.width) * 100;
    targetY = ((e.clientY - rect.top) / rect.height) * 100;
    if (!rafId) rafId = requestAnimationFrame(animate);
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 50;
    targetY = 30;
  });

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    hero.style.setProperty('--mx', currentX + '%');
    hero.style.setProperty('--my', currentY + '%');

    if (glow1) {
      const dx = (currentX - 50) * 0.3;
      const dy = (currentY - 50) * 0.3;
      glow1.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }
    if (glow2) {
      const dx = (currentX - 50) * -0.2;
      const dy = (currentY - 50) * -0.2;
      glow2.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }

    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }
})();

// ---------- 3D tilt on hero phones ----------
(function () {
  const visual = document.querySelector('.hero-visual');
  if (!visual || prefersReducedMotion) return;
  // Skip tilt on touch-primary devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const MAX_TILT = 8;
  let rafId = null;
  let targetRx = 0, targetRy = 0;
  let curRx = 0, curRy = 0;

  visual.addEventListener('mouseenter', () => visual.classList.add('tilting'));
  visual.addEventListener('mousemove', (e) => {
    const rect = visual.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetRy = nx * MAX_TILT * 2;
    targetRx = -ny * MAX_TILT * 2;
    if (!rafId) rafId = requestAnimationFrame(animate);
  });
  visual.addEventListener('mouseleave', () => {
    targetRx = 0;
    targetRy = 0;
    if (!rafId) rafId = requestAnimationFrame(animate);
  });

  function animate() {
    curRx += (targetRx - curRx) * 0.12;
    curRy += (targetRy - curRy) * 0.12;
    visual.style.setProperty('--rx', curRx.toFixed(2) + 'deg');
    visual.style.setProperty('--ry', curRy.toFixed(2) + 'deg');

    if (Math.abs(targetRx - curRx) > 0.05 || Math.abs(targetRy - curRy) > 0.05) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
      if (Math.abs(curRx) < 0.1 && Math.abs(curRy) < 0.1) {
        visual.classList.remove('tilting');
      }
    }
  }
})();

// ---------- Feature & testimonial card spotlight (mouse position as CSS var) ----------
(function () {
  if (prefersReducedMotion) return;
  const cards = document.querySelectorAll('.feature-card, .testimonial-card, .step-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();

// ---------- Magnetic effect on primary CTAs ----------
(function () {
  if (prefersReducedMotion) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const magnets = document.querySelectorAll('.btn-hero, .btn-founders, .nav-cta');
  magnets.forEach(btn => {
    const STRENGTH = 14;
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      btn.style.transform = `translate3d(${x * STRENGTH}px, ${y * STRENGTH - 2}px, 0)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

// ---------- Count-up numbers on reveal ----------
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.countSuffix || '';
    const duration = 1600;
    const start = performance.now();
    const isInt = Number.isInteger(target);

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = target * easeOut(progress);
      el.textContent = (isInt ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = (isInt ? target : target.toFixed(1)) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        if (prefersReducedMotion) {
          const t = parseFloat(entry.target.dataset.count);
          const s = entry.target.dataset.countSuffix || '';
          entry.target.textContent = (Number.isInteger(t) ? t : t.toFixed(1)) + s;
        } else {
          animateCount(entry.target);
        }
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(el => io.observe(el));
})();

// ---------- Hero: subtle animated starfield (gold dust particles) ----------
(function () {
  const canvas = document.getElementById('heroStars');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, stars = [];
  const STAR_COUNT = 70;
  let rafId = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  function makeStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      s.x += s.vx;
      s.y += s.vy;
      s.twinkle += 0.03;
      if (s.x < 0) s.x = width;
      if (s.x > width) s.x = 0;
      if (s.y < 0) s.y = height;
      if (s.y > height) s.y = 0;
      const alpha = s.a * (0.55 + 0.45 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 169, 98, ${alpha.toFixed(3)})`;
      ctx.fill();
    }
    rafId = requestAnimationFrame(draw);
  }

  function start() {
    resize();
    makeStars();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(draw);
  }

  start();
  window.addEventListener('resize', () => {
    // Debounce reflow
    cancelAnimationFrame(rafId);
    setTimeout(start, 100);
  }, { passive: true });

  // Pause when hero leaves viewport for perf
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!rafId) rafId = requestAnimationFrame(draw);
      } else {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    });
  }, { threshold: 0 });
  io.observe(canvas);
})();

// ---------- Testimonials: duplicate marquee content for seamless loop ----------
(function () {
  document.querySelectorAll('.marquee-track').forEach(track => {
    // Clone children once so translateY(-50%) loops seamlessly
    const originals = Array.from(track.children);
    originals.forEach(node => {
      const clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });
})();

// ---------- FAQ smooth expand on click (enhances existing toggle) ----------
(function () {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      // Ensure one-at-a-time accordion feel (optional polish)
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      // No close-others behavior to preserve current UX — just ripple the chevron
      if (!wasOpen && !prefersReducedMotion) {
        btn.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }],
          { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
      }
    });
  });
})();
