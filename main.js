/* ===== Sriya Rane — interactions (lightweight, no dependencies) ===== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- current year ---- */
  document.querySelectorAll('.yr').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- mobile menu ---- */
  var toggle = document.getElementById('navtoggle');
  var links = document.getElementById('navlinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  /* ---- scroll progress bar + nav scrolled state (one rAF-throttled handler) ---- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  var nav = document.querySelector('nav');
  var ticking = false;

  function onScroll() {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? st / h : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', st > 12);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---- staggered reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    // give each reveal a stagger delay based on its position among reveal siblings
    var groups = new Map();
    reveals.forEach(function (el) {
      var p = el.parentElement;
      var n = groups.get(p) || 0;
      groups.set(p, n + 1);
      el.style.transitionDelay = Math.min(n * 80, 480) + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
          if (en.target.hasAttribute('data-count')) countUp(en.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });

    // ensure stat numbers that aren't .reveal still animate when seen
    document.querySelectorAll('[data-count]').forEach(function (el) {
      if (!el.classList.contains('reveal')) io.observe(el);
    });
  }

  /* ---- count-up for stat numbers ---- */
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
    var dur = 1400, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- subtle hero portrait parallax (pointer only, transform-only) ---- */
  var portrait = document.querySelector('.portrait-ring');
  if (portrait && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    var hero = document.querySelector('.hero');
    (hero || document).addEventListener('mousemove', function (e) {
      var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      var dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
      portrait.style.transform = 'translate(' + (dx * 9).toFixed(2) + 'px,' +
        (dy * 9).toFixed(2) + 'px)';
    }, { passive: true });
    (hero || document).addEventListener('mouseleave', function () {
      portrait.style.transform = '';
    });
  }
})();
