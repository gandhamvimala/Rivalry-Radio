# Rivalry Radio

A fake call-in radio show where two AI superfans debate any rivalry you type in.
Scripts by Gemini, voices by ElevenLabs, served entirely from one Cloudflare Worker.

Built for the DEV Weekend Challenge: Passion Edition.

## Setup (~10 minutes)

```bash
npm install -g wrangler        # or use npx wrangler everywhere
wrangler login

# secrets (never in code, never in the client)
wrangler secret put GEMINI_KEY        # from aistudio.google.com
wrangler secret put ELEVENLABS_KEY    # from elevenlabs.io dashboard

wrangler dev       # local at http://localhost:8787
wrangler deploy    # live at https://rivalry-radio.<your-subdomain>.workers.dev
```

## Before deploying

1. **Voice IDs** — open `src/index.js`, verify/replace the three IDs in `VOICES`
   with ones from your ElevenLabs dashboard (Voices → copy ID). You want:
   HOST = smooth announcer, FAN_A = energetic, FAN_B = gravelly.
2. **Gemini model** — `GEMINI_MODEL` in `src/index.js`; adjust if your key
   doesn't have access to the default.
3. **Daily cap (recommended before sharing the link)** —
   `npx wrangler kv namespace create USAGE`, paste the id into `wrangler.toml`,
   uncomment the block, redeploy. Without it the cap is silently skipped.
4. **Rate limiting** — the in-code limiter is best-effort (per-isolate).
   For real protection add a Cloudflare rate-limiting rule on `/api/*`
   in the dashboard (Security → WAF → Rate limiting rules).

## How it works

- `GET /` serves the page (inline HTML from `src/page.js`)
- `POST /api/script` → Gemini writes a 10–12 line, 3-speaker debate as strict
  JSON (one retry on parse failure, markdown fences stripped defensively)
- `POST /api/speak` → maps speaker → ElevenLabs voice server-side, streams
  the mp3 straight through to the browser
- The frontend fetches all clips in parallel, then plays them sequentially,
  highlighting the current transcript line — no FFmpeg, no server storage

## Notes

- ElevenLabs free tier: ~10k credits/month. A 12-line broadcast uses roughly
  1–1.5k characters, so budget accordingly during testing.
- Input is capped at 60 chars/side, 12 lines, 300 chars/line before it ever
  reaches an API.
