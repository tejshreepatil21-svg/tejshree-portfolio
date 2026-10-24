'use strict';
// Vercel serverless function: POST /api/contact
const { handleContact } = require('../lib/contact');
module.exports = async (req, res) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const r = await handleContact({ method: req.method, body: req.body, ip, origin: req.headers.origin });
    res.setHeader('Cache-Control', 'no-store');
    res.status(r.status).json(r.body);
  } catch (e) {
    res.status(500).json({ error: 'Server error.' });
  }
};
