(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var menu = $('#menu'), links = $('#links');
  function setMenu(open) {
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? '✕' : '☰';
  }
  menu.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  $('#year').textContent = new Date().getFullYear();

  // Scroll effects: progress bar, sticky-nav shadow, hero parallax, back-to-top
  var nav = $('.nav'), bar = $('#progress'), totop = $('#totop'), hero = $('.hero'), tick = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    nav.classList.toggle('scrolled', y > 10);
    totop.classList.toggle('show', y > 600);
    if (!calm && y < 900) hero.style.setProperty('--py', (y * 0.25) + 'px');
    tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }); });
  onScroll();

  function count(el) {
    var end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    if (calm) return;
    var t0 = null;
    (function step(t) {
      t0 = t0 || t;
      var p = Math.min((t - t0) / 1100, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec) + (p < 1 ? '' : suf);
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add('in');
        var c = el.querySelector('[data-count]');
        if (c) count(c);
        setTimeout(function () { el.style.removeProperty('--d'); }, 1200);
        io.unobserve(el);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.grid4, .grid2, .timeline, .ccards, .panel').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (el, i) { el.style.setProperty('--d', (i * 0.09) + 's'); });
    });
    document.querySelectorAll('.card, .stat, .timeline li, .ccards li, .facts li, .prose').forEach(function (el) {
      el.classList.add('reveal'); io.observe(el);
    });
  }
  if ('IntersectionObserver' in window) {
    var map = {};
    links.querySelectorAll('a').forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          Object.keys(map).forEach(function (k) { map[k].classList.remove('on'); });
          map[e.target.id].classList.add('on');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  var form = $('#form'), status = $('#status'), send = $('#send');
  function say(msg, ok) { status.textContent = msg; status.className = 'status ' + (ok ? 'ok' : 'err'); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = { name: form.name.value.trim(), email: form.email.value.trim(), message: form.message.value.trim(), website: form.website.value };
    if (!d.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || d.message.length < 10) {
      return say('Please enter your name, a valid email and a message of at least 10 characters.', false);
    }
    send.disabled = true; say('Sending…', true);
    fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
      .then(function (r) {
        if (r.ok) { form.reset(); say('Thanks! Your message was sent.', true); }
        else say(r.b.error || 'Something went wrong. Please try again.', false);
      })
      .catch(function () { say('Could not send right now. Please email me directly.', false); })
      .then(function () { send.disabled = false; });
  });
})();