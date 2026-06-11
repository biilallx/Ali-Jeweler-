/* ═══════════════════════════════════════════
   ALI JEWELER'S — App JavaScript
   ═══════════════════════════════════════════ */

/* ── Announcement Ticker ─────────────────── */
const announcements = [
  'Free Shipping on All Orders Across Pakistan',
  'Secure International Payments Accepted',
  'Handcrafted in Karachi · Since 1980',
  'WhatsApp Us for Custom Bridal Orders',
];
let aIdx = 0;
const ticker = document.getElementById('announceTicker');
function showAnnouncement() {
  if (!ticker) return;
  ticker.style.opacity = '0';
  ticker.style.transform = 'translateY(8px)';
  setTimeout(() => {
    ticker.textContent = announcements[aIdx];
    ticker.style.transition = 'all 0.5s cubic-bezier(0.22,1,0.36,1)';
    ticker.style.opacity = '1';
    ticker.style.transform = 'translateY(0)';
  }, 250);
  aIdx = (aIdx + 1) % announcements.length;
}
showAnnouncement();
setInterval(showAnnouncement, 3800);

/* ── Sticky Header ───────────────────────── */
const header = document.getElementById('siteHeader');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  if (header) {
    header.classList.toggle('scrolled', sy > 60);
    header.classList.toggle('header-hidden', sy > lastScroll && sy > 200);
  }
  lastScroll = sy;
}, { passive: true });

/* ── Mobile Drawer ───────────────────────── */
function toggleDrawer() {
  document.getElementById('mobileDrawer')?.classList.toggle('open');
  document.getElementById('drawerOverlay')?.classList.toggle('open');
  document.body.style.overflow = document.getElementById('mobileDrawer')?.classList.contains('open') ? 'hidden' : '';
}

/* ── Search Bar ──────────────────────────── */
function toggleSearch() {
  const sb = document.getElementById('searchBar');
  if (!sb) return;
  sb.classList.toggle('open');
  if (sb.classList.contains('open')) {
    setTimeout(() => document.getElementById('searchInput')?.focus(), 150);
  }
}

/* ── Hero Slider ─────────────────────────── */
const heroData = [
  { heading: 'The Royal', italic: 'Bridal Collection', sub: 'Handcrafted for your most precious moments — where heritage meets elegance.' },
  { heading: 'Timeless', italic: 'Elegance Redefined', sub: 'Four decades of mastery. One moment of perfection.' },
  { heading: 'Jewels That', italic: 'Celebrate Love', sub: 'Find the piece that tells your story and sparkles forever.' },
];
let heroSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');
const heroHeading = document.getElementById('heroHeading');
const heroSub = document.getElementById('heroSub');

function heroSetSlide(n) {
  if (!slides.length) return;
  slides[heroSlide]?.classList.remove('active');
  dots[heroSlide]?.classList.remove('active');
  heroSlide = ((n % slides.length) + slides.length) % slides.length;
  slides[heroSlide]?.classList.add('active');
  dots[heroSlide]?.classList.add('active');
  const d = heroData[heroSlide];
  if (heroHeading) {
    heroHeading.style.opacity = '0';
    heroHeading.style.transform = 'translateY(20px)';
    setTimeout(() => {
      heroHeading.innerHTML = d.heading + '<br><em class="gold-shimmer">' + d.italic + '</em>';
      heroHeading.style.transition = 'all 0.7s cubic-bezier(0.22,1,0.36,1)';
      heroHeading.style.opacity = '1';
      heroHeading.style.transform = 'translateY(0)';
    }, 300);
  }
  if (heroSub) {
    heroSub.style.opacity = '0';
    setTimeout(() => {
      heroSub.textContent = d.sub;
      heroSub.style.transition = 'opacity 0.6s ease 0.15s';
      heroSub.style.opacity = '1';
    }, 350);
  }
}
function heroGo(dir) { heroSetSlide(heroSlide + dir); }
let heroInterval = setInterval(() => heroGo(1), 5500);

/* Pause on hover */
document.getElementById('heroSection')?.addEventListener('mouseenter', () => clearInterval(heroInterval));
document.getElementById('heroSection')?.addEventListener('mouseleave', () => {
  heroInterval = setInterval(() => heroGo(1), 5500);
});

/* ── Scroll Reveal ───────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const delay = parseFloat(e.target.style.animationDelay || e.target.dataset.delay || 0) * 1000;
      setTimeout(() => e.target.classList.add('visible'), delay);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Parallax ────────────────────────────── */
function updateParallax() {
  const vh = window.innerHeight;
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const section = el.parentElement;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const strength = parseFloat(el.dataset.parallax) || 15;
    const rel = (rect.top - vh) / (rect.height + vh);
    el.style.transform = 'translateY(' + (rel * strength) + '%)';
  });
}
window.addEventListener('scroll', updateParallax, { passive: true });
updateParallax();

/* ── Product Filters ─────────────────────── */
function filterTab(btn, cat) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card, i) => {
    const show = cat === 'All' || card.dataset.cat === cat;
    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    if (show) {
      card.style.display = 'flex';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 40);
    } else {
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
      setTimeout(() => { card.style.display = 'none'; }, 350);
    }
  });
}

/* ── Wishlist Toggle ─────────────────────── */
function toggleWishlist(btn) {
  const icon = btn.querySelector('.heart-icon');
  if (!icon) return;
  const active = icon.getAttribute('fill') === '#C5A55A';
  icon.setAttribute('fill', active ? 'none' : '#C5A55A');
  icon.setAttribute('stroke', active ? '#999' : '#C5A55A');
  /* Pulse animation */
  btn.style.transform = 'scale(1.25)';
  setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
}

/* ── Newsletter ──────────────────────────── */
function submitNewsletter(e) {
  e.preventDefault();
  const form = document.getElementById('newsletterForm');
  const success = document.getElementById('newsletterSuccess');
  if (form) form.style.display = 'none';
  if (success) success.style.display = 'block';
}

/* ── WhatsApp FAB ────────────────────────── */
setTimeout(() => {
  const fab = document.getElementById('whatsappFab');
  if (fab) {
    fab.style.opacity = '1';
    fab.style.transform = 'scale(1)';
  }
}, 2500);

/* ── Responsive check ────────────────────── */
function applyResponsive() {
  const isMobile = window.innerWidth < 768;
  const nav = document.getElementById('desktopNav');
  const menuBtn = document.querySelector('.menu-btn');
  if (nav) nav.style.display = isMobile ? 'none' : 'flex';
  if (menuBtn) menuBtn.style.display = isMobile ? 'flex' : 'none';
}
window.addEventListener('resize', applyResponsive);
applyResponsive();

/* ── Smooth counter animation ────────────── */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current.toLocaleString() + (el.dataset.suffix || '');
    }, 30);
  });
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounters();
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
const statsSection = document.getElementById('statsSection');
if (statsSection) counterObserver.observe(statsSection);
