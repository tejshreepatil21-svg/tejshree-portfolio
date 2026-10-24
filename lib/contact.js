'use strict';
// Shared contact-form logic used by both the Vercel and Netlify functions.
const hits = new Map();
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (s, max) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

function rateLimited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}

async function handleContact({ method, body, ip, origin }) {
  if (method !== 'POST') return { status: 405, body: { error: 'Method not allowed.' } };
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && origin && origin !== allowed) return { status: 403, body: { error: 'Forbidden.' } };
  if (rateLimited(ip || 'unknown')) return { status: 429, body: { error: 'Too many messages. Please try again later.' } };

  const data = body && typeof body === 'object' ? body : {};
  if (data.website) return { status: 200, body: { ok: true } }; // honeypot: pretend success to bots
  const name = clean(data.name, 80), email = clean(data.email, 120);
  const message = String(data.message || '').trim().slice(0, 2000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
    return { status: 400, body: { error: 'Please provide a valid name, email and message.' } };
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) return { status: 500, body: { error: 'Contact service is not configured.' } };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: CONTACT_FROM, to: [CONTACT_TO], reply_to: email,
      subject: 'Portfolio message from ' + name,
      html: '<p><b>' + esc(name) + '</b> (' + esc(email) + ')</p><p>' + esc(message).replace(/\n/g, '<br>') + '</p>'
    })
  });
  if (!res.ok) return { status: 502, body: { error: 'Could not send your message. Please try again later.' } };
  return { status: 200, body: { ok: true } };
}
module.exports = { handleContact };
