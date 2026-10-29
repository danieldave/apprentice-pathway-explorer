# Apprentice Pathways Explorer

A mobile-friendly website (HTML, CSS and JavaScript only) that helps people in Nigeria explore 99 trades, careers and creative skills, find the ones that suit them, and follow a personal learning plan.

## What's inside

| Feature | Where |
|---|---|
| 99 pathways, each with training path, category, summary, skills training, years required and first step | `js/data.js` → one page per trade in `trade/` |
| Animated scene for every trade (a worker doing the job, matching background), rotating every 5 seconds on the home page | `js/scenes.js` (pure SVG + CSS, about 5 KB per scene, no image files) |
| Pathway Finder quiz with top-5 matches and numbered steps | `planner.html` |
| Learning plan builder (1 month to 3 years) with dated, numbered steps | `planner.html#plan` |
| Dashboard: anonymous profile, saved trades, plan progress tick-boxes, backup code to move devices | `dashboard.html` |
| National programmes, trade tests, help for all 36 states + FCT | `opportunities.html` |
| "Ask a trainer" box (shows **Feature coming soon** until the AI is switched on) | `js/config.js`, `server/ask-openai.js` |
| Offline mode (installable web app) | `sw.js`, `manifest.webmanifest` |
| SEO: page titles, descriptions, structured data, sitemap, robots.txt, share image | every page, `sitemap.xml`, `robots.txt` |

Visitors never have to give a name, phone number or email. Profiles and plans are stored in their own browser.

## Put it online (free)

Any static host works. The easiest:

1. **Netlify Drop**: open https://app.netlify.com/drop and drag this whole folder onto the page. You get a public `https://…netlify.app` link in seconds.
2. **GitHub Pages**: push the folder to a repository, then Settings → Pages → deploy from the main branch.

Offline mode needs HTTPS, which both hosts give you automatically.

### After you have your web address (for Google)

1. Rebuild the pages with your address so canonical links and the sitemap are correct:
   ```
   SITE_URL=https://your-address.netlify.app node tools/build.js
   ```
   (Or open `sitemap.xml` and `robots.txt` and replace `https://www.example.com` with your address.)
2. Upload again, then add the site in Google Search Console and submit `sitemap.xml`.

## Edit the content

All trades, categories and programmes live in **`js/data.js`**. After editing, run:

```
node tools/build.js
```

This regenerates every page, the sitemap and the offline cache list. Node.js 18 or newer is needed only for this step, not for the website itself.

## Switch on the AI trainer later (OpenAI)

The website already has the chat box and the code to call a server. To switch it on:

1. Deploy `server/ask-openai.js` on any Node host (Render, Railway, a VPS…) with these environment variables:
   - `OPENAI_API_KEY` — your key from the OpenAI dashboard
   - `ALLOWED_ORIGIN` — your website address, e.g. `https://your-address.netlify.app`
   - `OPENAI_MODEL` — optional; set it to a current model name from your OpenAI account
2. In `js/config.js` set `enabled: true` and `endpoint` to your server address, e.g. `https://your-server.onrender.com/api/ask`.

**Never put the API key in `js/config.js` or any website file.** Website files are public, and anyone could copy the key and spend your credit.

## Keep information current

Programme details (SUPA, TVET, 3MTT, NDE, trade tests) change often. They were checked in October 2026. Review `OPPORTUNITIES` in `js/data.js` every few months.
