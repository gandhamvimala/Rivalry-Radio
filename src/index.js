// Rivalry Radio — Cloudflare Worker
// Routes:
//   GET  /            -> HTML page
//   POST /api/script  -> { sideA, sideB, tone } -> JSON debate script (Gemini)
//   POST /api/speak   -> { text, speaker }      -> audio/mpeg (ElevenLabs)
//
// Secrets (set with `wrangler secret put NAME`):
//   GEMINI_KEY, ELEVENLABS_KEY
//
// Optional KV binding "USAGE" enables a daily generation cap (see wrangler.toml).

import { PAGE_HTML } from "./page.js";

// ---------- config ----------

const GEMINI_MODEL = "gemini-3.5-flash";// adjust if needed
const MAX_SIDE_LEN = 60;
const MAX_LINE_LEN = 300;   // per spoken line sent to ElevenLabs
const MAX_LINES = 12;
const DAILY_CAP = 50;       // script generations per day (only enforced if KV bound)
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQ = 30;    // per IP per window, per isolate (best-effort)

// Verify these in your ElevenLabs dashboard (Voices -> copy voice ID).
// These are ElevenLabs premade voices; swap freely.
const VOICES = {
  HOST:  "hpp4J3VqNfWAUOO0d1Us", // Bella - professional, warm (Rex... or rather, a female host)
  FAN_A: "PASTE_YOUR_PICK_HERE", // Nubee / Witty / James (Max)
  FAN_B: "pFZP5JQG7iQjIQuC4Bku", // Lily - velvety British (Poppy)
};

// ---------- tiny per-isolate rate limiter (best-effort; add a Cloudflare
// dashboard rate-limiting rule on /api/* for real protection) ----------
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) ?? { start: now, count: 0 };
  if (now - rec.start > RATE_WINDOW_MS) { rec.start = now; rec.count = 0; }
  rec.count++;
  hits.set(ip, rec);
  return rec.count > RATE_MAX_REQ;
}

// ---------- helpers ----------

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

function buildPrompt(sideA, sideB, tone) {
  return `You are a comedy writer for "Rivalry Radio", a fake call-in radio show where two superfans debate a rivalry. Write a short debate script.

THE RIVALRY: ${sideA} vs ${sideB}
TONE: ${tone}

RULES:
RULES:
- Exactly 3 speakers: HOST, FAN_A, FAN_B. On air they have names: the HOST is Rex, a smooth late-night radio veteran. FAN_A is Max, devoted to ${sideA}, brash and overconfident. FAN_B is Poppy, devoted to ${sideB}, calm, cutting, devastatingly polite. They address each other by name in the dialogue. The "speaker" field in the JSON must still be exactly HOST, FAN_A, or FAN_B.
- Structure: HOST opens with a 1-2 sentence intro welcoming listeners and introducing Max and Poppy, then FAN_A and FAN_B alternate. HOST may interject once in the middle. HOST closes with one line.
- 10 to 12 lines total. Each line is 1-2 sentences, max 30 words. These will be spoken aloud, so write for the ear: contractions, interruptions, rhetorical jabs, no bullet points, no stage directions.
- The fans should escalate: start reasonable, end absurd. Specific details beat generic trash talk. If you don't know real facts about the rivalry, invent oddly specific personal anecdotes instead.
- The fans never insult each other personally in a mean way. They attack the rival thing, not the rival person. Keep it PG-13.
- If the rivalry involves real people, keep claims obviously comedic or factual — no fabricated scandals or offensive content.
- Write for expressive voice acting: use exclamation marks, ellipses for dramatic pauses, an occasional ALL CAPS word for emphasis, and dashes for interruptions. Max sounds genuinely worked up; Poppy stays composed but lands sharper blows. Rex stays smooth and amused by contrast.
- The HOST's closing line should refuse to pick a winner in a funny way.

OUTPUT FORMAT:
Respond with ONLY a valid JSON array, no markdown fences, no preamble:
[{"speaker":"HOST","line":"..."},{"speaker":"FAN_A","line":"..."}]`;
}

function parseScript(raw) {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const arr = JSON.parse(cleaned); // throws on garbage -> caller retries
  if (!Array.isArray(arr) || arr.length < 4) throw new Error("bad shape");
  const valid = new Set(["HOST", "FAN_A", "FAN_B"]);
  const script = arr
    .filter((l) => l && valid.has(l.speaker) && typeof l.line === "string")
    .map((l) => ({ speaker: l.speaker, line: l.line.slice(0, MAX_LINE_LEN) }))
    .slice(0, MAX_LINES);
  if (script.length < 4) throw new Error("too few valid lines");
  return script;
}

async function callGemini(env, prompt, temperature) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: 4000,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("");
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

async function checkDailyCap(env) {
  if (!env.USAGE) return true; // KV not bound -> cap disabled
  const key = `gen:${new Date().toISOString().slice(0, 10)}`;
  const count = parseInt((await env.USAGE.get(key)) ?? "0", 10);
  if (count >= DAILY_CAP) return false;
  await env.USAGE.put(key, String(count + 1), { expirationTtl: 172800 });
  return true;
}

// ---------- route handlers ----------

async function handleScript(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }

  const sideA = String(body.sideA ?? "").trim().slice(0, MAX_SIDE_LEN);
  const sideB = String(body.sideB ?? "").trim().slice(0, MAX_SIDE_LEN);
  const tone = body.tone === "unhinged" ? "unhinged" : "friendly banter";
  if (!sideA || !sideB) return json({ error: "Both sides of the rivalry are required" }, 400);

  if (!(await checkDailyCap(env))) {
    return json({ error: "Daily generation limit reached. The studio is off the air until tomorrow." }, 429);
  }

  const temperature = tone === "unhinged" ? 1.1 : 1.0;
  const prompt = buildPrompt(sideA, sideB, tone);

  // one retry on parse failure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callGemini(env, prompt, temperature);
      return json({ script: parseScript(raw), sideA, sideB, tone });
    } catch (err) {
      if (attempt === 1) return json({ error: `Script generation failed: ${err.message}` }, 502);
    }
  }
}

async function handleSpeak(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }

  const text = String(body.text ?? "").trim().slice(0, MAX_LINE_LEN);
  const voiceId = VOICES[body.speaker];
  if (!text || !voiceId) return json({ error: "Need text and a valid speaker (HOST, FAN_A, FAN_B)" }, 400);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.3, similarity_boost: 0.75, style: 0.6 },
      }),
    }
  );

  if (!res.ok) {
    return json({ error: `ElevenLabs ${res.status}: ${await res.text()}` }, 502);
  }
  // stream audio straight through, don't buffer
  return new Response(res.body, {
    headers: { "content-type": "audio/mpeg", "cache-control": "no-store" },
  });
}

// ---------- entry ----------

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (request.method !== "POST") return json({ error: "POST only" }, 405);
      const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
      if (rateLimited(ip)) return json({ error: "Slow down — too many requests" }, 429);

      if (url.pathname === "/api/script") return handleScript(request, env);
      if (url.pathname === "/api/speak") return handleSpeak(request, env);
      return json({ error: "Not found" }, 404);
    }

    return new Response(PAGE_HTML, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
