/* ═══════════════════════════════════════════
   ALI JEWELER'S — LUXE FX
   GSAP scroll animations · 360° viewer · AR Try-On
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1) GSAP SCROLL ANIMATIONS (luxurious, slow)
     ───────────────────────────────────────── */
  function initGsap() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Neutralize old CSS reveal so GSAP owns the motion.
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '';
      el.style.transform = '';
      el.classList.remove('visible'); // pre-empt the legacy observer
    });

    const ease = 'power3.out';
    const dur = 1.3;

    // Generic gentle reveal — fade in + slide up
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 60, filter: 'blur(6px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: dur,
          ease: ease,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Stagger children of grids
    const grids = [
      { sel: '.products-grid', child: '.product-card', stagger: 0.12 },
      { sel: '.cat-grid', child: '.cat-card', stagger: 0.14 },
      { sel: '.trust-grid', child: '.trust-item', stagger: 0.1 },
      { sel: '.reviews-grid', child: '.review-card', stagger: 0.12 },
      { sel: '.ig-grid', child: '.ig-item', stagger: 0.08 },
    ];
    grids.forEach(({ sel, child, stagger }) => {
      document.querySelectorAll(sel).forEach((parent) => {
        const items = parent.querySelectorAll(child);
        if (!items.length) return;
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 50 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            ease: ease,
            stagger: stagger,
            scrollTrigger: { trigger: parent, start: 'top 82%' },
          }
        );
      });
    });

    // Section heading tags get a delicate fade + letter-spacing tighten
    gsap.utils.toArray('.section-tag').forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, letterSpacing: '0.7em' },
        {
          autoAlpha: 1,
          letterSpacing: '0.35em',
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        }
      );
    });

    // Parallax on promo banner & hero (subtle)
    document.querySelectorAll('.promo-bg, .story-img img').forEach((el) => {
      gsap.fromTo(
        el,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('section, .promo-banner') || el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    });

    // Refresh after fonts/images may have shifted layout
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ─────────────────────────────────────────
     2) INJECT 360° + AR BUTTONS INTO PRODUCT CARDS
     ───────────────────────────────────────── */
  function injectProductActions() {
    const icon360 =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><ellipse cx="12" cy="12" rx="10" ry="4"></ellipse><path d="M2 12c0 2.5 4.5 4 10 4"></path><polyline points="6 8 4 6 6 4"></polyline></svg>';
    const iconAR =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><circle cx="12" cy="13" r="3.2"></circle><path d="M9 9.5l1-1.5h4l1 1.5"></path></svg>';

    document.querySelectorAll('.product-card').forEach((card) => {
      const wrap = card.querySelector('.product-img-wrap');
      if (!wrap || wrap.querySelector('.luxe-actions')) return;

      const title = card.querySelector('.product-title, .serif')?.textContent?.trim() || 'Featured Piece';
      const mainImg = wrap.querySelector('.product-img-main')?.getAttribute('src') || '';
      const hoverImg = wrap.querySelector('.product-img-hover')?.getAttribute('src') || mainImg;

      const actions = document.createElement('div');
      actions.className = 'luxe-actions';
      actions.innerHTML = `
        <button type="button" class="luxe-action-btn" data-action="360"
                data-title="${title.replace(/"/g, '&quot;')}"
                data-img="${mainImg}" data-img2="${hoverImg}"
                aria-label="View in 360°">
          ${icon360}<span>360° View</span>
        </button>
        <button type="button" class="luxe-action-btn" data-action="ar"
                data-title="${title.replace(/"/g, '&quot;')}"
                data-img="${mainImg}"
                aria-label="Virtual Try-On">
          ${iconAR}<span>Try On (AR)</span>
        </button>
      `;
      // Insert above the quick-view bar
      wrap.appendChild(actions);

      actions.addEventListener('click', (e) => {
        const btn = e.target.closest('.luxe-action-btn');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        const action = btn.dataset.action;
        const payload = {
          title: btn.dataset.title,
          img: btn.dataset.img,
          img2: btn.dataset.img2,
        };
        if (action === '360') open360(payload);
        else if (action === 'ar') openAR(payload);
      });
    });
  }

  /* ─────────────────────────────────────────
     3) 360° VIEWER MODAL
     ───────────────────────────────────────── */
  const $modal360 = () => document.getElementById('modal360');
  const $modalAR = () => document.getElementById('modalAR');

  let rot360 = 0;
  let drag360 = { active: false, startX: 0, startRot: 0 };
  let auto360 = null;

  function open360({ title, img, img2 }) {
    const m = $modal360();
    if (!m) return;
    const stage = m.querySelector('.v360-stage img');
    const stage2 = m.querySelector('.v360-stage img.alt');
    const titleEl = m.querySelector('.v360-title');
    const counter = m.querySelector('.v360-counter');

    titleEl.textContent = title;
    stage.src = img;
    stage2.src = img2 || img;
    rot360 = 0;
    applyRotation();

    m.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Auto-rotate intro for first 2.4s
    clearInterval(auto360);
    let t = 0;
    auto360 = setInterval(() => {
      t += 1;
      rot360 = (rot360 + 4) % 360;
      applyRotation();
      if (t >= 90) clearInterval(auto360);
    }, 25);

    function applyRotation() {
      const r = rot360;
      // 3D tilt for the jewel + alt blend for variety
      stage.style.transform = `perspective(1100px) rotateY(${r}deg)`;
      stage2.style.transform = `perspective(1100px) rotateY(${r + 180}deg)`;
      const blend = Math.abs(((r + 90) % 360) - 180) / 180; // 0..1..0
      stage.style.opacity = (1 - blend).toFixed(3);
      stage2.style.opacity = blend.toFixed(3);
      counter.textContent = String(Math.round(r)).padStart(3, '0') + '°';
      // light shimmer following rotation
      const shimmer = m.querySelector('.v360-shimmer');
      if (shimmer) shimmer.style.transform = `translateX(${(r % 360) / 360 * 180 - 90}%)`;
    }
    m._applyRotation = applyRotation;
  }

  function setRotation(deg) {
    rot360 = ((deg % 360) + 360) % 360;
    const m = $modal360();
    if (m && m._applyRotation) m._applyRotation();
  }

  function close360() {
    const m = $modal360();
    if (!m) return;
    clearInterval(auto360);
    m.classList.remove('open');
    document.body.style.overflow = '';
  }

  function bind360() {
    const m = $modal360();
    if (!m) return;

    m.querySelector('.modal-close').addEventListener('click', close360);
    m.querySelector('.modal-backdrop').addEventListener('click', close360);
    m.querySelector('[data-rot="left"]').addEventListener('click', () => {
      clearInterval(auto360);
      setRotation(rot360 - 30);
    });
    m.querySelector('[data-rot="right"]').addEventListener('click', () => {
      clearInterval(auto360);
      setRotation(rot360 + 30);
    });
    m.querySelector('[data-rot="auto"]').addEventListener('click', () => {
      if (auto360) { clearInterval(auto360); auto360 = null; }
      else {
        auto360 = setInterval(() => { rot360 = (rot360 + 2) % 360; if (m._applyRotation) m._applyRotation(); }, 30);
      }
    });

    const slider = m.querySelector('.v360-slider');
    slider.addEventListener('input', (e) => { clearInterval(auto360); auto360 = null; setRotation(parseFloat(e.target.value)); });

    const stage = m.querySelector('.v360-stage');
    const dragStart = (x) => { drag360.active = true; drag360.startX = x; drag360.startRot = rot360; clearInterval(auto360); auto360 = null; stage.classList.add('dragging'); };
    const dragMove = (x) => { if (!drag360.active) return; const dx = x - drag360.startX; setRotation(drag360.startRot + dx * 0.9); slider.value = rot360; };
    const dragEnd = () => { drag360.active = false; stage.classList.remove('dragging'); };

    stage.addEventListener('mousedown', (e) => dragStart(e.clientX));
    window.addEventListener('mousemove', (e) => dragMove(e.clientX));
    window.addEventListener('mouseup', dragEnd);
    stage.addEventListener('touchstart', (e) => dragStart(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', (e) => dragMove(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend', dragEnd);
  }

  /* ─────────────────────────────────────────
     4) VIRTUAL TRY-ON (AR) — simulated webcam
     ───────────────────────────────────────── */
  let arStream = null;

  function openAR({ title, img }) {
    const m = $modalAR();
    if (!m) return;
    const titleEl = m.querySelector('.ar-title');
    const overlay = m.querySelector('.ar-jewel');
    const status = m.querySelector('.ar-status');
    const video = m.querySelector('video');
    const fallback = m.querySelector('.ar-fallback');

    titleEl.textContent = title;
    overlay.src = img;

    m.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Reset UI
    status.textContent = 'Requesting camera access…';
    video.style.display = 'none';
    fallback.style.display = 'flex';

    // Try real webcam with fallback
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user', width: 720, height: 720 }, audio: false })
        .then((stream) => {
          arStream = stream;
          video.srcObject = stream;
          video.play().catch(() => {});
          video.style.display = 'block';
          fallback.style.display = 'none';
          status.textContent = 'Live · Move your head to position the piece';
        })
        .catch(() => {
          status.textContent = 'Camera unavailable — using demo mode';
        });
    } else {
      status.textContent = 'Camera unavailable — using demo mode';
    }

    // Run the scanning animation
    m.querySelector('.ar-scan').classList.remove('done');
    setTimeout(() => m.querySelector('.ar-scan').classList.add('done'), 1800);
  }

  function closeAR() {
    const m = $modalAR();
    if (!m) return;
    m.classList.remove('open');
    document.body.style.overflow = '';
    if (arStream) {
      arStream.getTracks().forEach((t) => t.stop());
      arStream = null;
    }
    const video = m.querySelector('video');
    if (video) { video.srcObject = null; }
  }

  function bindAR() {
    const m = $modalAR();
    if (!m) return;
    m.querySelector('.modal-close').addEventListener('click', closeAR);
    m.querySelector('.modal-backdrop').addEventListener('click', closeAR);

    // Position presets
    m.querySelectorAll('[data-pos]').forEach((btn) => {
      btn.addEventListener('click', () => {
        m.querySelectorAll('[data-pos]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        m.querySelector('.ar-jewel').dataset.pos = btn.dataset.pos;
      });
    });

    // Size adjust
    const sizeSlider = m.querySelector('.ar-size');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', () => {
        m.querySelector('.ar-jewel').style.setProperty('--ar-size', sizeSlider.value + 'px');
      });
    }

    // Snapshot (simulated capture)
    m.querySelector('[data-capture]')?.addEventListener('click', () => {
      const flash = m.querySelector('.ar-flash');
      flash.classList.add('fire');
      setTimeout(() => flash.classList.remove('fire'), 600);
    });
  }

  /* ─────────────────────────────────────────
     5) Global Esc handler
     ───────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if ($modal360()?.classList.contains('open')) close360();
    if ($modalAR()?.classList.contains('open')) closeAR();
  });

  /* ─────────────────────────────────────────
     INIT
     ───────────────────────────────────────── */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(() => {
    injectProductActions();
    bind360();
    bindAR();
    // GSAP may not have parsed yet if loaded after this; queue via load event too
    if (typeof gsap !== 'undefined') initGsap();
    else window.addEventListener('load', initGsap);
  });
})();
