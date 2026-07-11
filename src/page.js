// Exported as a string so the whole app deploys as a single Worker.
export const PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rivalry Radio — all rivalries, all night</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0B0D12;
    --panel: rgba(255,255,255,0.04);
    --panel-border: rgba(255,255,255,0.08);
    --line: #262B36;
    --text: #F1F2F6;
    --muted: #8B90A0;
    --side-a: #4DA3FF;
    --side-b: #FF6B4A;
    --onair: #FF3B3F;
    --amber: #F2B84B;
  }
  * { box-sizing: border-box; margin: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: Inter, system-ui, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 34px 16px 80px;
    overflow-x: hidden;
    position: relative;
  }

  /* ambient studio glow */
  body::before, body::after {
    content: "";
    position: fixed;
    width: 60vmax; height: 60vmax;
    border-radius: 50%;
    filter: blur(90px);
    opacity: .14;
    z-index: -1;
    animation: drift 26s ease-in-out infinite alternate;
  }
  body::before { background: var(--side-a); top: -25vmax; left: -20vmax; }
  body::after  { background: var(--side-b); bottom: -28vmax; right: -22vmax; animation-delay: -13s; }
  @keyframes drift {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(6vmax, 4vmax) scale(1.15); }
  }

  .station {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    letter-spacing: .28em;
    color: var(--muted);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--muted);
    transition: background .3s;
  }
  body.playing .live-dot {
    background: var(--onair);
    box-shadow: 0 0 10px var(--onair);
    animation: blink 1.2s ease-in-out infinite;
  }
  @keyframes blink { 50% { opacity: .35; } }

  /* ON AIR sign with equalizer */
  .lamp {
    margin: 22px 0 6px;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 24px;
    border: 1px solid var(--panel-border);
    border-radius: 12px;
    background: var(--panel);
    backdrop-filter: blur(12px);
    transition: all .4s;
  }
  .lamp span {
    font-family: 'Archivo Black', sans-serif;
    font-size: 14px;
    letter-spacing: .32em;
    color: var(--muted);
    transition: color .4s;
  }
  body.playing .lamp {
    border-color: rgba(255,59,63,.6);
    background: rgba(255,59,63,.12);
    box-shadow: 0 0 34px rgba(255,59,63,.35), inset 0 0 18px rgba(255,59,63,.12);
  }
  body.playing .lamp span { color: #fff; text-shadow: 0 0 14px rgba(255,59,63,.8); }

  .eq { display: flex; align-items: flex-end; gap: 3px; height: 18px; }
  .eq i {
    width: 3.5px; border-radius: 2px;
    background: var(--muted);
    height: 4px;
    transition: background .4s;
  }
  body.playing .eq i { background: var(--onair); animation: bounce 1s ease-in-out infinite; }
  .eq i:nth-child(1) { animation-delay: 0s; }
  .eq i:nth-child(2) { animation-delay: .15s; }
  .eq i:nth-child(3) { animation-delay: .3s; }
  .eq i:nth-child(4) { animation-delay: .45s; }
  .eq i:nth-child(5) { animation-delay: .6s; }
  @keyframes bounce { 50% { height: 18px; } }

  h1 {
    font-family: 'Archivo Black', sans-serif;
    font-size: clamp(38px, 8vw, 68px);
    line-height: 1.02;
    text-align: center;
    margin: 14px 0 6px;
    letter-spacing: -.01em;
  }
  h1 .a { color: var(--side-a); text-shadow: 0 0 30px rgba(77,163,255,.35); }
  h1 .b { color: var(--side-b); text-shadow: 0 0 30px rgba(255,107,74,.35); }
  .tagline {
    font-size: 15px;
    color: var(--muted);
    margin-bottom: 30px;
    text-align: center;
  }

  /* input console */
  .console {
    width: min(720px, 100%);
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 18px;
    backdrop-filter: blur(14px);
    padding: 22px;
    box-shadow: 0 20px 60px rgba(0,0,0,.35);
  }
  form {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 12px;
    align-items: center;
  }
  .vs {
    font-family: 'Archivo Black', sans-serif;
    font-size: 18px;
    color: var(--amber);
    text-shadow: 0 0 18px rgba(242,184,75,.5);
  }
  input[type=text] {
    width: 100%;
    background: rgba(0,0,0,.35);
    border: 1.5px solid var(--line);
    border-radius: 10px;
    color: var(--text);
    font: 600 16px Inter, sans-serif;
    padding: 14px;
    text-align: center;
    transition: border-color .25s, box-shadow .25s;
  }
  input::placeholder { color: #565b69; font-weight: 500; }
  #sideA:focus { outline: none; border-color: var(--side-a); box-shadow: 0 0 0 3px rgba(77,163,255,.18); }
  #sideB:focus { outline: none; border-color: var(--side-b); box-shadow: 0 0 0 3px rgba(255,107,74,.18); }

  .controls {
    grid-column: 1 / -1;
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 14px;
  }
  .tone {
    display: flex;
    border: 1.5px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    background: rgba(0,0,0,.3);
  }
  .tone button {
    background: transparent;
    border: 0;
    color: var(--muted);
    padding: 11px 18px;
    cursor: pointer;
    font: inherit;
    transition: all .2s;
  }
  .tone button.on {
    background: rgba(242,184,75,.15);
    color: var(--amber);
    text-shadow: 0 0 10px rgba(242,184,75,.5);
  }
  #go {
    font-family: 'Archivo Black', sans-serif;
    font-size: 15px;
    letter-spacing: .08em;
    background: linear-gradient(135deg, #fff, #d9dbe3);
    color: #0B0D12;
    border: 0;
    border-radius: 10px;
    padding: 13px 30px;
    cursor: pointer;
    transition: transform .15s, box-shadow .25s;
    box-shadow: 0 0 0 rgba(255,255,255,0);
  }
  #go:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(255,255,255,.18); }
  #go:active { transform: translateY(0); }
  #go:disabled { opacity: .4; cursor: wait; transform: none; box-shadow: none; }

  #status {
    margin-top: 20px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: var(--muted);
    min-height: 20px;
    text-align: center;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
  }
  #status.err { color: var(--onair); }
  .spinner {
    width: 14px; height: 14px;
    border: 2px solid var(--line);
    border-top-color: var(--amber);
    border-radius: 50%;
    animation: spin .8s linear infinite;
    display: none;
  }
  body.busy .spinner { display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* transcript */
  #transcript {
    width: min(720px, 100%);
    margin-top: 26px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .row {
    display: grid;
    grid-template-columns: 92px 1fr;
    gap: 14px;
    padding: 16px 18px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-left: 3px solid var(--line);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    opacity: 0;
    transform: translateY(10px);
    animation: rise .45s ease forwards;
    transition: border-color .3s, background .3s, box-shadow .3s, opacity .3s;
  }
  @keyframes rise { to { opacity: .5; transform: translateY(0); } }
  .row.done { opacity: .75; }
  .row.now { opacity: 1; }
  .row.HOST  { border-left-color: var(--amber); }
  .row.FAN_A { border-left-color: var(--side-a); }
  .row.FAN_B { border-left-color: var(--side-b); }
  .row.now.HOST  { background: rgba(242,184,75,.08); box-shadow: 0 0 30px rgba(242,184,75,.12); }
  .row.now.FAN_A { background: rgba(77,163,255,.08); box-shadow: 0 0 30px rgba(77,163,255,.14); }
  .row.now.FAN_B { background: rgba(255,107,74,.08); box-shadow: 0 0 30px rgba(255,107,74,.14); }

  .who {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 2px;
  }
  .who b {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .12em;
  }
  .HOST  .who b { color: var(--amber); }
  .FAN_A .who b { color: var(--side-a); }
  .FAN_B .who b { color: var(--side-b); }

  .speaking { display: flex; gap: 2.5px; align-items: flex-end; height: 10px; visibility: hidden; }
  .speaking i { width: 2.5px; border-radius: 1px; height: 3px; }
  .HOST  .speaking i { background: var(--amber); }
  .FAN_A .speaking i { background: var(--side-a); }
  .FAN_B .speaking i { background: var(--side-b); }
  .row.now .speaking { visibility: visible; }
  .row.now .speaking i { animation: bounce .8s ease-in-out infinite; }
  .row.now .speaking i:nth-child(2) { animation-delay: .12s; }
  .row.now .speaking i:nth-child(3) { animation-delay: .24s; }

  .row p { font-size: 15px; line-height: 1.55; }

  #replay {
    display: none;
    margin-top: 22px;
    background: var(--panel);
    border: 1px solid var(--panel-border);
    color: var(--text);
    border-radius: 10px;
    padding: 12px 26px;
    font: 600 14px Inter, sans-serif;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: border-color .2s, box-shadow .2s;
  }
  #replay:hover { border-color: rgba(255,255,255,.25); box-shadow: 0 6px 22px rgba(0,0,0,.35); }

  footer {
    margin-top: auto;
    padding-top: 48px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    text-align: center;
  }

  @media (max-width: 560px) {
    form { grid-template-columns: 1fr; }
    .vs { text-align: center; }
    .row { grid-template-columns: 1fr; gap: 6px; }
    .who { flex-direction: row; align-items: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    body::before, body::after, .eq i, .speaking i, .live-dot { animation: none !important; }
    .row { animation-duration: .01s; }
  }
</style>
</head>
<body>
  <div class="station"><span class="live-dot"></span>RVR 104.7 FM — ALL RIVALRIES, ALL NIGHT</div>

  <div class="lamp">
    <div class="eq"><i></i><i></i><i></i><i></i><i></i></div>
    <span>ON AIR</span>
    <div class="eq"><i></i><i></i><i></i><i></i><i></i></div>
  </div>

  <h1>Rivalry <span class="a">Ra</span><span class="b">dio</span></h1>
  <p class="tagline">Two AI superfans. One microphone. Zero chill.</p>

  <div class="console">
    <form id="form">
      <input id="sideA" type="text" maxlength="60" placeholder="tabs" autocomplete="off" required>
      <div class="vs">VS</div>
      <input id="sideB" type="text" maxlength="60" placeholder="spaces" autocomplete="off" required>
      <div class="controls">
        <div class="tone" role="group" aria-label="Tone">
          <button type="button" data-tone="friendly banter" class="on">friendly banter</button>
          <button type="button" data-tone="unhinged">unhinged</button>
        </div>
        <button id="go" type="submit">GO LIVE</button>
      </div>
    </form>
  </div>

  <div id="status" role="status"><span class="spinner"></span><span id="statusText"></span></div>
  <div id="transcript"></div>
  <button id="replay">Replay broadcast</button>

  <footer>voices by ElevenLabs · scripts by Gemini · built for the DEV Weekend Challenge</footer>

<script>
(function () {
  var form = document.getElementById('form');
  var statusText = document.getElementById('statusText');
  var statusBox = document.getElementById('status');
  var transcript = document.getElementById('transcript');
  var go = document.getElementById('go');
  var replay = document.getElementById('replay');
  var tone = 'friendly banter';
  var blobUrls = [];

  document.querySelectorAll('.tone button').forEach(function (b) {
    b.addEventListener('click', function () {
      tone = b.dataset.tone;
      document.querySelectorAll('.tone button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
    });
  });

  function setStatus(msg, isErr) {
    statusText.textContent = msg || '';
    statusBox.className = isErr ? 'err' : '';
  }
  function setBusy(v) { document.body.classList.toggle('busy', v); }
  function setPlaying(v) { document.body.classList.toggle('playing', v); }

  function renderScript(script) {
    transcript.innerHTML = '';
    return script.map(function (l, idx) {
      var row = document.createElement('div');
      row.className = 'row ' + l.speaker;
      row.style.animationDelay = (idx * 70) + 'ms';
      var who = document.createElement('div');
      who.className = 'who';
      var name = document.createElement('b');
      var NAMES = { HOST: 'ROXY', FAN_A: 'MAX', FAN_B: 'POPPY' };
      name.textContent = NAMES[l.speaker];
      var bars = document.createElement('div');
      bars.className = 'speaking';
      bars.innerHTML = '<i></i><i></i><i></i>';
      who.appendChild(name); who.appendChild(bars);
      var p = document.createElement('p');
      p.textContent = l.line;
      row.appendChild(who); row.appendChild(p);
      transcript.appendChild(row);
      return row;
    });
  }

  function fetchAudio(line) {
    return fetch('/api/speak', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: line.line, speaker: line.speaker })
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw new Error(e.error || 'voice failed'); });
      return r.blob();
    }).then(function (b) {
      var u = URL.createObjectURL(b);
      blobUrls.push(u);
      return u;
    });
  }

  // batches of 3: free tier allows 4 concurrent requests
  function fetchInBatches(lines, size) {
    var results = [];
    var i = 0;
    function nextBatch() {
      if (i >= lines.length) return Promise.resolve(results);
      var batch = lines.slice(i, i + size).map(fetchAudio);
      i += size;
      setStatus('Warming up the voices... ' + Math.min(i, lines.length) + '/' + lines.length);
      return Promise.all(batch).then(function (urls) {
        results = results.concat(urls);
        return nextBatch();
      });
    }
    return nextBatch();
  }

  function playSequence(urls, rows) {
    setPlaying(true);
    var i = 0;
    var audio = new Audio();
    function next() {
      if (i > 0) { rows[i - 1].classList.remove('now'); rows[i - 1].classList.add('done'); }
      if (i >= urls.length) {
        setPlaying(false);
        setStatus('Broadcast complete.');
        replay.style.display = 'inline-block';
        return;
      }
      rows[i].classList.add('now');
      rows[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      audio.src = urls[i];
      i++;
      audio.play().catch(function () { next(); });
    }
    audio.onended = next;
    audio.onerror = next;
    next();
    replay.onclick = function () {
      rows.forEach(function (r) { r.classList.remove('now', 'done'); });
      i = 0;
      setPlaying(true);
      replay.style.display = 'none';
      next();
    };
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var sideA = document.getElementById('sideA').value.trim();
    var sideB = document.getElementById('sideB').value.trim();
    if (!sideA || !sideB) return;

    blobUrls.forEach(URL.revokeObjectURL);
    blobUrls = [];
    replay.style.display = 'none';
    go.disabled = true;
    setBusy(true);
    setPlaying(false);
    setStatus('Writing the script...');
    transcript.innerHTML = '';

    fetch('/api/script', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sideA: sideA, sideB: sideB, tone: tone })
    })
    .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || 'script failed'); return d; }); })
    .then(function (data) {
      var rows = renderScript(data.script);
      return fetchInBatches(data.script, 3).then(function (urls) {
        setStatus('');
        setBusy(false);
        playSequence(urls, rows);
      });
    })
    .catch(function (err) { setStatus(err.message, true); setBusy(false); })
    .finally(function () { go.disabled = false; });
  });
})();
</script>
</body>
</html>`;
