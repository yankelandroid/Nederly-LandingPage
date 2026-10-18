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
  '.feature-card, .feature-row, .step, .calc, .synagogues-content, .synagogues-visual, .download-card, .section-header, .bottom-card, .faq-entry'
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

// Calculateur de tarifs : coût mensuel Nederly (abonnement + commission) selon les
// enchères par Shabbat, sur 4,33 Shabbatot par mois ; la formule la moins chère ressort.
(function () {
  const range = document.getElementById('calcRange');
  if (!range) return;
  const out = document.getElementById('calcOut');
  const plans = [...document.querySelectorAll('.calc-plan')];
  const founder = document.querySelector('.calc-founder');
  const fmt = (n) => Math.round(n).toLocaleString('fr-FR');
  const cost = (el, perShabbat) => Number(el.dataset.fee) + Number(el.dataset.rate) * perShabbat * 4.33;

  function update() {
    const perShabbat = Number(range.value);
    out.textContent = fmt(perShabbat) + '\u00a0€';
    let best = null;
    plans.forEach((plan) => {
      const c = cost(plan, perShabbat);
      plan.querySelector('.calc-cost span').textContent = fmt(c);
      if (!best || c < best.c) best = { plan, c };
    });
    plans.forEach((plan) => plan.classList.toggle('is-best', plan === best.plan));
    founder.querySelector('.calc-cost span').textContent = fmt(cost(founder, perShabbat));
  }

  range.addEventListener('input', update);
  update();
})();

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

// Démo « Enchères en temps réel » : vous enchérissez (+40 €), le prix roule chiffre
// par chiffre et votre rang passe à 1er ; Moshe R. surenchérit, vous passez 2e et la
// notification arrive ; vous remontez à 320 €, l'enchère se clôture avant Shabbat et
// vous la remportez.
// Hauteur fixe : tout change sur place. En pause hors écran ;
// statique si l'utilisateur limite les animations (le HTML porte l'état final).
(function () {
  const root = document.querySelector('[data-auction-demo]');
  if (!root) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const $ = (sel) => root.querySelector(sel);
  const priceValue = $('.ad-price-value');
  const lead = $('.ad-lead');
  const leadText = $('.ad-lead-text');
  const chips = root.querySelectorAll('.ad-chip');
  const cta = $('.ad-cta');
  const ctaLabel = $('.ad-cta-label');
  const toast = $('.ad-toast');
  const delta = $('.ad-delta');
  const rank = $('.ad-rank');
  const rankLabel = $('.ad-rank-label');
  const status = $('.ad-status');
  const statusText = $('.ad-status-text');
  const bidZone = $('.ad-bid');
  const footerText = $('.ad-footer-text');
  const toastTitle = $('.ad-toast-title');
  const toastBody = $('.ad-toast-body');

  const eur = (n) => n + ' €';

  // --- Compteur à rouleaux (3 chiffres) ---
  const strips = [];
  priceValue.textContent = '';
  for (let i = 0; i < 3; i++) {
    const digit = document.createElement('span');
    digit.className = 'ad-digit';
    const strip = document.createElement('span');
    strip.className = 'ad-digit-strip';
    for (let n = 0; n <= 9; n++) {
      const s = document.createElement('span');
      s.textContent = String(n);
      strip.appendChild(s);
    }
    digit.appendChild(strip);
    priceValue.appendChild(digit);
    strips.push(strip);
  }
  function setPrice(value) {
    String(value).padStart(3, '0').split('').forEach((d, i) => {
      strips[i].style.transitionDelay = i * 70 + 'ms';
      strips[i].style.transform = 'translateY(' + -Number(d) * 10 + '%)';
    });
  }
  // Avant le premier cycle, le compteur montre le même état final que le HTML.
  root.classList.add('no-anim');
  setPrice(320);
  void root.offsetWidth;
  root.classList.remove('no-anim');

  // --- Écart de prix (+40 €, +20 €) qui apparaît puis s'efface ---
  function showDelta(text, tone) {
    delta.textContent = text;
    delta.dataset.tone = tone;
    delta.classList.remove('is-showing');
    void delta.offsetWidth;
    delta.classList.add('is-showing');
  }

  // --- Petits états ---
  function swapText(container, el, text) {
    container.classList.add('is-swapping');
    later(() => {
      el.textContent = text;
      container.classList.remove('is-swapping');
    }, 180);
  }
  function setLead(state, text) {
    lead.dataset.state = state;
    swapText(lead, leadText, text);
  }
  function press(el) {
    el.classList.remove('is-pressed');
    void el.offsetWidth; // relance l'onde même si la classe était déjà là
    el.classList.add('is-pressed');
    later(() => el.classList.remove('is-pressed'), 260);
  }

  // --- Boucle ---
  let timers = [];
  let running = false;
  let inView = false;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
    running = false;
  }

  function reset() {
    root.classList.add('no-anim');
    setPrice(220);
    lead.dataset.state = 'other';
    rank.dataset.state = 'none';
    delete root.dataset.phase;
    rankLabel.textContent = 'Votre rang';
    status.dataset.state = 'open';
    statusText.textContent = 'En cours';
    bidZone.classList.remove('is-ended');
    footerText.textContent = 'Clôture automatique vendredi à 17\u00a0h\u00a042, avant Shabbat';
    toastTitle.textContent = 'Vous avez été surenchéri';
    toastBody.textContent = 'Aliyah Shéni : nouvelle offre de ' + eur(280);
    leadText.textContent = 'Yossef M. est en tête';
    ctaLabel.textContent = 'Enchérir ' + eur(260);
    cta.classList.remove('is-sent', 'is-swapping');
    chips.forEach((c, i) => c.classList.toggle('is-selected', i === 1));
    toast.classList.remove('is-visible');
    delta.classList.remove('is-showing');
    void root.offsetWidth;
    root.classList.remove('no-anim');
  }

  function cycle() {
    running = true;
    root.classList.add('is-resetting');
    later(() => {
      reset();
      root.classList.remove('is-resetting');
    }, 300);

    // Vous choisissez +40 € puis enchérissez 260 €.
    later(() => press(chips[1]), 1500);
    later(() => press(cta), 2300);
    later(() => {
      cta.classList.add('is-sent');
      swapText(cta, ctaLabel, 'Offre envoyée');
      setPrice(260);
      showDelta('+40\u00a0€', 'you');
      setLead('you', 'Vous êtes en tête');
      rank.dataset.state = 'you';
    }, 2450);
    later(() => {
      cta.classList.remove('is-sent');
      swapText(cta, ctaLabel, 'Enchérir ' + eur(300));
    }, 3700);

    // Moshe R. surenchérit : statut et prix, puis la notification.
    later(() => {
      setPrice(280);
      showDelta('+20\u00a0€', 'other');
      setLead('outbid', 'Moshe R. vous a dépassé');
      rank.dataset.state = 'outbid';
      swapText(cta, ctaLabel, 'Enchérir ' + eur(320));
    }, 5600);
    later(() => toast.classList.add('is-visible'), 6100);
    later(() => toast.classList.remove('is-visible'), 8400);

    // Vous remontez à 320 € et repassez en tête.
    later(() => press(cta), 8900);
    later(() => {
      cta.classList.add('is-sent');
      swapText(cta, ctaLabel, 'Offre envoyée');
      setPrice(320);
      showDelta('+40\u00a0€', 'you');
      setLead('you', 'Vous êtes en tête');
      rank.dataset.state = 'you';
    }, 9050);

    // Vendredi 17 h 42 : clôture automatique, vous remportez l'Aliyah.
    later(() => {
      cta.classList.remove('is-sent');
      bidZone.classList.add('is-ended');
      swapText(cta, ctaLabel, 'Enchère terminée');
      status.dataset.state = 'closed';
      swapText(status, statusText, 'Clôturée');
      swapText(footerText.parentElement, footerText, 'Clôturée vendredi à 17\u00a0h\u00a042, avant Shabbat');
    }, 10600);
    later(() => {
      root.dataset.phase = 'won';
      setLead('won', "Vous avez remporté l'Aliyah");
      rank.dataset.state = 'won';
      swapText(rank, rankLabel, 'Remportée');
    }, 11000);
    later(() => {
      toastTitle.textContent = 'Mazal tov ! Aliyah Shéni remportée';
      toastBody.textContent = eur(320) + ' débités · reçu Cerfa envoyé par email';
      toast.classList.add('is-visible');
    }, 11800);
    later(() => toast.classList.remove('is-visible'), 14800);
    later(cycle, 16400);
  }

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inView = entry.isIntersecting;
      if (inView && !running && !document.hidden) cycle();
      else if (!inView && running) stop();
    });
  }, { threshold: 0.35 }).observe(root);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (inView && !running) cycle();
  });
})();

// ============================================================
// Utilitaires
// ============================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Back-to-top button ----------
(function () {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Retour en haut');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
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

// ---------- Enhanced staggered reveal observer (override with direction detection) ----------
(function () {
  // Add stagger class to grid parents whose direct children are reveal items
  const staggerParents = [
    '.steps-line',
    '.calc-plans',
    '.bottom-cards-grid',
    '.faq-grid',
    '.founders-perks'
  ];
  staggerParents.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.classList.add('stagger'));
  });
})();


// Launch waitlist — the store buttons used to be dead links; the section now
// captures an email through the same contact API the contact page uses.
(function () {
  const WAITLIST_ENDPOINT = 'https://api.nederly.io/api/contact';

  const form = document.getElementById('waitlistForm');
  const feedback = document.getElementById('waitlistFeedback');
  if (!form || !feedback) return;

  const input = document.getElementById('waitlistEmail');
  const button = form.querySelector('[type="submit"]');
  const buttonLabel = button ? button.textContent : '';

  function setFeedback(message, state) {
    feedback.textContent = message;
    feedback.classList.remove('is-error', 'is-success');
    if (state) feedback.classList.add(state);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setFeedback('', null);

    const email = (input.value || '').trim();
    if (!email || !input.checkValidity()) {
      setFeedback('Merci de saisir une adresse email valide.', 'is-error');
      input.focus();
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = 'Envoi…';
    }

    try {
      const response = await fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Liste',
          lastName: 'attente',
          email: email,
          subject: 'autre',
          message: "Inscription à la liste d'attente du lancement des applications mobiles.",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      form.style.display = 'none';
      setFeedback('C\'est noté : vous serez prévenu dès la mise en ligne.', 'is-success');
    } catch (error) {
      setFeedback(
        "Impossible d'enregistrer votre email pour le moment. Écrivez-nous à contact@nederly.io.",
        'is-error'
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = buttonLabel;
      }
    }
  });
})();
