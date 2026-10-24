(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var menu = $('#menu'), links = $('#links');
  function setMenu(open) {
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.textContent = open ? '✕' : '☰';
  }
  menu.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  $('#year').textContent = new Date().getFullYear();

  if ('IntersectionObserver' in window) {
    var items = document.querySelectorAll('.card, .stat, .timeline li');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });

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
    var d = {
      name: form.name.value.trim(), email: form.email.value.trim(),
      message: form.message.value.trim(), website: form.website.value
    };
    if (!d.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) || d.message.length < 10) {
      return say('Please enter your name, a valid email and a message of at least 10 characters.', false);
    }
    send.disabled = true; say('Sending…', true);
    fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d)
    }).then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
      .then(function (r) {
        if (r.ok) { form.reset(); say('Thanks! Your message was sent.', true); }
        else say(r.b.error || 'Something went wrong. Please try again.', false);
      })
      .catch(function () { say('Network error. Please email me directly instead.', false); })
      .then(function () { send.disabled = false; });
  });
})();
