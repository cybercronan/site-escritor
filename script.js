const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  document.documentElement.classList.add('motion-ready');
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupNavbarState();
  setupSplitWords();
  setupRevealEffects();
  setupBookTilt();
});

function setupMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (!mobileMenuBtn || !navLinks) return;

  const setMenuState = (isOpen) => {
    navLinks.classList.toggle('active', isOpen);
    mobileMenuBtn.classList.toggle('is-active', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  };

  mobileMenuBtn.addEventListener('click', () => {
    setMenuState(!navLinks.classList.contains('active'));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });

  document.addEventListener('click', (event) => {
    if (!navLinks.classList.contains('active')) return;
    if (navLinks.contains(event.target) || mobileMenuBtn.contains(event.target)) return;
    setMenuState(false);
  });
}

function setupNavbarState() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let ticking = false;
  const update = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
    ticking = false;
  };

  update();
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
}

function setupSplitWords() {
  const target = document.querySelector('[data-split-words]');
  if (!target) return;

  if (prefersReducedMotion) {
    document.documentElement.classList.add('is-ready');
    return;
  }

  const text = target.textContent.trim();
  const tokens = text.split(/(\s+)/);
  let wordIndex = 0;

  target.setAttribute('aria-label', text);
  target.innerHTML = tokens.map((token) => {
    if (/^\s+$/.test(token)) return token;
    const safeToken = escapeHtml(token);
    const currentIndex = wordIndex;
    wordIndex += 1;
    return `<span class="split-word" style="--word-index: ${currentIndex}"><span>${safeToken}</span></span>`;
  }).join('');
  target.classList.add('has-split');

  window.requestAnimationFrame(() => {
    document.documentElement.classList.add('is-ready');
  });
}

function setupRevealEffects() {
  const items = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!items.length) return;

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((item, index) => {
      item.style.setProperty('--reveal-index', Math.min(index, 5));
    });
  });

  const revealImmediately = () => {
    items.forEach((item) => {
      item.classList.add('is-visible');
      item.style.willChange = 'auto';
    });
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealImmediately();
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      entry.target.addEventListener('transitionend', () => {
        entry.target.style.willChange = 'auto';
      }, { once: true });
      currentObserver.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.16
  });

  items.forEach((item) => observer.observe(item));
}

function setupBookTilt() {
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (prefersReducedMotion || isTouchDevice) return;

  document.querySelectorAll('.book-3d-wrapper').forEach((wrapper) => {
    const book = wrapper.querySelector('.book-3d');
    if (!book) return;

    let rect = null;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const updateTilt = () => {
      if (!rect) rect = wrapper.getBoundingClientRect();

      const x = pointerX - rect.left;
      const y = pointerY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12 - 10;

      book.style.transition = 'transform 120ms ease-out';
      book.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(18px)`;
      frame = 0;
    };

    wrapper.addEventListener('pointerenter', () => {
      rect = wrapper.getBoundingClientRect();
    });

    wrapper.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(updateTilt);
    });

    wrapper.addEventListener('pointerleave', () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      rect = null;
      book.style.transition = 'transform 500ms ease';
      book.style.transform = 'rotateY(-20deg) rotateX(10deg)';
    });
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}
