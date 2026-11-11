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
| AI Trainer on every page, answering from our own trade data in 17 languages | `api/ask.js`, `js/config.js` |
| Offline mode (installable web app) | `sw.js`, `manifest.webmanifest` |
| SEO: page titles, descriptions, structured data, sitemap, robots.txt, share image | every page, `sitemap.xml`, `robots.txt` |

Visitors never have to give a name, phone number or email. Profiles and plans are stored in their own browser.

## What's new in v2

| Upgrade | What it does | Where |
|---|---|---|
| **AI Trainer (switched on)** | Answers from OUR trade facts first (years, skills, steps, first step, certificates, national programmes), in the visitor's language, and links the right trade pages | `api/ask.js`, `js/app.js` |
| **17 Nigerian languages** | Built in: English, Hausa, Yoruba, Igbo, Pidgin. AI (beta): Fulfulde, Kanuri, Tiv, Ibibio, Efik, Izon, Edo, Nupe, Urhobo, Igala, Idoma, Ebira | `js/i18n.js`, `api/translate.js` |
| **SEO** | Trade pages now match real searches ("How to learn welding in Nigeria"), 15 new category pages, canonical links, dated sitemap | `tools/build.js` |
| **AEO** | Every trade and category page starts with a Quick answer and has 4-6 FAQs with FAQPage labels | `tools/build.js` |
| **GEO** | `llms.txt` fact sheet for AI assistants; robots.txt welcomes AI search bots | `llms.txt`, `robots.txt` |
| **Royal Workshop design** | The students' purple, refined: deep royal bands + hi-vis gold, readable lavender pages; calm motion | `css/style.css` (v2 section) |

## Apprentice Tools (new)

| Tool | What it does | Where |
|---|---|---|
| **A. Apprenticeship Agreement Builder** | Fair written agreement (length, fee, hours, early exit, freedom terms, under-18 protections). A **fairness check** flags unfair or missing terms. Print/PDF, copy, and AI translation into any of the 16 other languages (only the template is sent, never names) | `agreement.html`, `js/tools.js` |
| **B. Skill Passport** | Skills + stages from each trade's data. The apprentice ticks "I can do this"; the master confirms with a PIN. Share a **signed** link + QR: edits after signing are detected | `passport.html`, `api/passport.js` |
| **C. Artisan Profile Card** | WhatsApp-status picture (1080×1350) + mini profile page with QR, WhatsApp/call buttons and Skill Passport badge. **Photo upload is built but locked (coming soon)** | `card.html` |

Everything is saved on the user's phone and included in the dashboard backup code.

## Hosting on Vercel

The site is already on Vercel. To switch on the AI Trainer:
1. Vercel → this project → **Settings → Environment Variables** → add `OPENAI_API_KEY`, and `PASSPORT_SECRET` (any long random password, e.g. 40 random letters and numbers) for signed Skill Passports.
2. **Redeploy**. The "Ask a trainer" button now answers (without the key it says it is not switched on yet).

No build step runs on Vercel: the pages are already built and committed. If the address changes, put it in `tools/site.json`, run `node tools/build.js`, and push.

**Never put the API key in `js/config.js` or any website file.** Website files are public.

## Edit the content

All trades, categories and programmes live in **`js/data.js`**. After editing, run:

```
node tools/build.js     # regenerates every page, the sitemap, robots.txt, llms.txt and the offline cache list
node tools/test.js      # 24 checks: AI Trainer safety, languages, SEO/AEO/GEO (no key needed)
```

## Native speakers: help us improve a language
Open `js/i18n.js`, find the language block (e.g. `yo:` for Yoruba), fix the words and push. To make an AI language "built in", copy the English block, translate it, and change its `how` from `"ai"` to `"hand"`.

## Keep information current

Programme details (SUPA, TVET, 3MTT, NDE, trade tests) change often. They were checked in October 2026. Review `OPPORTUNITIES` in `js/data.js` every few months.
