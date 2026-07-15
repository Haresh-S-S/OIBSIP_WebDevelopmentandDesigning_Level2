// =========================================================
// MS DHONI TRIBUTE — INTERACTIONS
// Vanilla JS only: scroll progress, navbar state, reveal
// animations (Intersection Observer), staggered timeline/
// card entrances, back-to-top, hero parallax, ripple.
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  };

  /* ---------- Navbar background on scroll ---------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    updateProgress();
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top ---------- */
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Smooth scroll for in-page anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Scroll reveal via IntersectionObserver ---------- */
  const revealTargets = document.querySelectorAll('.fade-up');

  // Assign a subtle stagger delay to items that share a parent grid/list
  const groupSelectors = ['.achievements-grid', '.legacy-grid', '.timeline'];
  groupSelectors.forEach(sel => {
    const group = document.querySelector(sel);
    if (!group) return;
    const items = group.querySelectorAll('.fade-up');
    items.forEach((el, i) => {
      el.style.setProperty('--delay', `${(i % 4) * 0.08}s`);
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Hero text entrance (in case CSS animation delay needs JS trigger) ---------- */
  document.querySelectorAll('.reveal-text').forEach((el, i) => {
    el.style.animation = `heroFadeIn 1s cubic-bezier(.22,1,.36,1) forwards`;
    el.style.animationDelay = `${0.6 + i * 0.2}s`;
  });

  // Inject the keyframes used above (kept in JS since it's tied to reveal-text timing logic)
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes heroFadeIn { from { opacity: 0; transform: translateY(14px);} to { opacity: 1; transform: translateY(0);} }
  `;
  document.head.appendChild(styleTag);

  /* ---------- Subtle hero parallax on mouse move (desktop only) ---------- */
  const heroImg = document.getElementById('heroImg');
  const hero = document.getElementById('hero');
  if (window.matchMedia('(pointer: fine)').matches && heroImg) {
    hero.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 14;
      const y = (e.clientY / innerHeight - 0.5) * 14;
      heroImg.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
    });
    hero.addEventListener('mouseleave', () => {
      heroImg.style.transform = 'scale(1.08) translate(0,0)';
    });
  }

  /* ---------- Ripple effect on interactive CTA / buttons ---------- */
  const rippleTargets = document.querySelectorAll('.scroll-cta, .back-to-top');
  rippleTargets.forEach(el => {
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

});
