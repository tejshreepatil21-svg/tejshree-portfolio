'use strict';
// Netlify function: POST /api/contact (see redirect in netlify.toml)
const { handleContact } = require('../../lib/contact');
exports.handler = async (event) => {
  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { /* invalid JSON handled below */ }
  try {
    const r = await handleContact({
      method: event.httpMethod, body,
      ip: event.headers['x-nf-client-connection-ip'] || '', origin: event.headers.origin
    });
    return { statusCode: r.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(r.body) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error.' }) };
  }
};
