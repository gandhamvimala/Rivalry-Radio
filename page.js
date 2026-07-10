// Exported as a string so the whole app deploys as a single Worker.
export const PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rivalry Radio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #12141A;
    --panel: #1B1E26;
    --line: #2A2E39;
    --text: #EDEEF2;
    --muted: #8B90A0;
    --side-a: #4DA3FF;
    --side-b: #FF6B4A;
    --onair: #E5484D;
    --amber: #F2B84B;
  }
  * { box-sizing: border-box; margin: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: Inter, system-ui, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 16px 64px;
  }
  .station {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.24em;
    color: var(--muted);
    text-transform: uppercase;
  }
  .lamp {
    margin: 18px 0 8px;
    font-family: 'Archivo Black', sans-serif;
    font-size: 14px;
    letter-spacing: 0.3em;
    padding: 8px 22px;
    border: 2px solid var(--line);
    border-radius: 6px;
    color: var(--muted);
    transition: all .3s;
  }
  .lamp.live {
    color: #fff;
    border-color: var(--onair);
    background: var(--onair);
    box-shadow: 0 0 24px rgba(229,72,77,.55);
    animation: pulse 1.6s ease-in-out infinite;
  }
  @keyframes pulse { 50% { box-shadow: 0 0 40px rgba(229,72,77,.85); } }
  @media (prefers-reduced-motion: reduce) { .lamp.live { animation: none; } }

  h1 {
    font-family: 'Archivo Black', sans-serif;
    font-size: clamp(34px, 7vw, 58px);
    line-height: 1.05;
    text-align: center;
    margin: 6px 0 26px;
  }
  h1 .a { color: var(--side-a); }
  h1 .b { color: var(--side-b); }

  form {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 12px;
    align-items: center;
    width: min(680px, 100%);
  }
  .vs {
    font-family: 'Archivo Black', sans-serif;
    font-size: 20px;
    color: var(--amber);
  }
  input[type=text] {
    width: 100%;
    background: var(--panel);
    border: 2px solid var(--line);
    border-radius: 8px;
    color: var(--text);
    font: 500 16px Inter, sans-serif;
    padding: 13px 14px;
    text-align: center;
  }
  #sideA:focus { outline: none; border-color: var(--side-a); }
  #sideB:focus { outline: none; border-color: var(--side-b); }

  .controls {
    grid-column: 1 / -1;
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .tone {
    display: flex;
    border: 2px solid var(--line);
    border-radius: 8px;
    overflow: hidden;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
  }
  .tone button {
    background: transparent;
    border: 0;
    color: var(--muted);
    padding: 10px 16px;
    cursor: pointer;
    font: inherit;
  }
  .tone button.on { background: var(--panel); color: var(--amber); }
  #go {
    font-family: 'Archivo Black', sans-serif;
    font-size: 15px;
    letter-spacing: .06em;
    background: var(--text);
    color: var(--bg);
    border: 0;
    border-radius: 8px;
    padding: 12px 26px;
    cursor: pointer;
  }
  #go:disabled { opacity: .45; cursor: wait; }

  #status {
    margin-top: 18px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: var(--muted);
    min-height: 18px;
    text-align: center;
  }
  #status.err { color: var(--onair); }

  #transcript {
    width: min(680px, 100%);
    margin-top: 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .row {
    display: grid;
    grid-template-columns: 74px 1fr;
    gap: 12px;
    padding: 12px 14px;
    background: var(--panel);
    border-left: 3px solid var(--line);
    border-radius: 6px;
    opacity: .45;
    transition: opacity .25s, border-color .25s;
  }
  .row.done { opacity: .8; }
  .row.now { opacity: 1; }
  .row.HOST  { border-left-color: var(--amber); }
  .row.FAN_A { border-left-color: var(--side-a); }
  .row.FAN_B { border-left-color: var(--side-b); }
  .who {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: .1em;
    padding-top: 3px;
  }
  .HOST  .who { color: var(--amber); }
  .FAN_A .who { color: var(--side-a); }
  .FAN_B .who { color: var(--side-b); }
  .row p { font-size: 15px; line-height: 1.5; }

  #replay {
    display: none;
    margin-top: 18px;
    background: transparent;
    border: 2px solid var(--line);
    color: var(--text);
    border-radius: 8px;
    padding: 10px 22px;
    font: 600 14px Inter, sans-serif;
    cursor: pointer;
  }
  footer {
    margin-top: auto;
    padding-top: 40px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: var(--muted);
  }
  footer a { color: var(--muted); }
</style>
</head>
<body>
  <div class="station">RVR 104.7 FM &mdash; ALL RIVALRIES, ALL NIGHT</div>
  <div class="lamp" id="lamp">ON AIR</div>
  <h1>Rivalry <span class="a">Ra</span><span class="b">dio</span></h1>

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

  <div id="status" role="status"></div>
  <div id="transcript"></div>
  <button id="replay">Replay broadcast</button>

  <footer>voices by ElevenLabs &middot; scripts by Gemini &middot; built for the DEV Weekend Challenge</footer>

<script>
(function () {
  var form = document.getElementById('form');
  var lamp = document.getElementById('lamp');
  var status = document.getElementById('status');
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
    status.textContent = msg || '';
    status.className = isErr ? 'err' : '';
  }

  function renderScript(script) {
    transcript.innerHTML = '';
    return script.map(function (l) {
      var row = document.createElement('div');
      row.className = 'row ' + l.speaker;
      var who = document.createElement('div');
      who.className = 'who';
      who.textContent = l.speaker === 'HOST' ? 'HOST' : (l.speaker === 'FAN_A' ? 'FAN A' : 'FAN B');
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

  function playSequence(urls, rows) {
    lamp.classList.add('live');
    var i = 0;
    var audio = new Audio();
    function next() {
      if (i > 0) { rows[i - 1].classList.remove('now'); rows[i - 1].classList.add('done'); }
      if (i >= urls.length) {
        lamp.classList.remove('live');
        setStatus('Broadcast complete.');
        replay.style.display = 'inline-block';
        return;
      }
      rows[i].classList.add('now');
      rows[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      audio.src = urls[i];
      i++;
      audio.play().catch(function () { next(); }); // skip a line rather than stall
    }
    audio.onended = next;
    audio.onerror = next;
    next();
    replay.onclick = function () {
      rows.forEach(function (r) { r.classList.remove('now', 'done'); });
      i = 0;
      lamp.classList.add('live');
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
      setStatus('Warming up the voices...');
      // fetch all clips in parallel, keep order
      return Promise.all(data.script.map(fetchAudio)).then(function (urls) {
        setStatus('');
        playSequence(urls, rows);
      });
    })
    .catch(function (err) { setStatus(err.message, true); })
    .finally(function () { go.disabled = false; });
  });
})();
</script>
</body>
</html>`;
