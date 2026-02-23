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
  '.feature-card, .step-card, .pricing-card, .pricing-free-banner, .synagogues-content, .synagogues-visual, .download-card, .section-header, .bottom-card'
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

// Live bid feed — replay animations in loop
(function () {
  const liveFeed = document.querySelector('.live-feed');
  if (!liveFeed) return;

  const bids = liveFeed.querySelectorAll('.live-bid');
  const alert = liveFeed.querySelector('.live-feed-alert');
  const crown = liveFeed.querySelector('.live-bid-crown');

  function replayFeed() {
    // Reset all animations
    bids.forEach(bid => {
      bid.style.animation = 'none';
      bid.offsetHeight; // force reflow
      bid.style.animation = '';
    });
    if (alert) {
      alert.style.animation = 'none';
      alert.offsetHeight;
      alert.style.animation = '';
    }
    if (crown) {
      crown.style.animation = 'none';
      crown.offsetHeight;
      crown.style.animation = '';
    }
  }

  // Replay every 7 seconds (total animation ~4s + 3s pause)
  setInterval(replayFeed, 7000);
})();
