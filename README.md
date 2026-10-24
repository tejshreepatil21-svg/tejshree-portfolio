# Tejshree Patil – Portfolio

Static portfolio site with a secure serverless contact API. Deploys to Vercel or Netlify with no build step.

## Structure
```
index.html              Page markup
assets/css/styles.css   Styles (responsive, dark theme)
assets/js/main.js       Menu, scroll effects, contact form (no inline scripts)
api/contact.js          Vercel function  → POST /api/contact
netlify/functions/      Netlify function → POST /api/contact (via redirect)
lib/contact.js          Shared validation, rate limit, email sending
vercel.json / netlify.toml   Security headers (CSP, HSTS, etc.) and routing
.env.example            Environment variables needed
```

## Deploy
1. Create a free account at [resend.com](https://resend.com), make an API key.
2. Push this folder to GitHub.
3. **Vercel:** Import the repo → add the variables from `.env.example` → Deploy.
   **Netlify:** Add new site from Git → add the same variables → Deploy.
4. Open your site and send a test message from the contact form.

## Security
- Strict Content-Security-Policy (no inline scripts), HSTS, no-sniff, frame blocking
- Server-side validation, HTML-escaped emails, honeypot field, rate limit (5 per 10 min per IP)
- Secrets live only in environment variables; `.env` is git-ignored

The in-memory rate limit resets on cold starts; for heavy traffic, add a shared store such as Upstash Redis.
