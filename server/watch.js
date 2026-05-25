const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

let pingInterval = null;
let running      = false;
let monitorStart = null;
let checks       = 0;
const logs       = [];

function pad(n, w = 2) { return String(n).padStart(w, '0'); }

function tick() {
  const now = new Date();
  document.getElementById('time-main').textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById('time-ms').textContent =
    `.${pad(now.getMilliseconds(), 3)}`;
  document.getElementById('date-row').textContent =
    `${DAYS[now.getDay()]} ${pad(now.getDate())} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  if (monitorStart) {
    const e = Math.floor((Date.now() - monitorStart) / 1000);
    document.getElementById('m-uptime').textContent =
      `${pad(Math.floor(e / 60))}:${pad(e % 60)}`;
  }
}
setInterval(tick, 50);
tick();

function addLog(msg, type = '') {
  logs.push({ msg, type });
  if (logs.length > 5) logs.shift();
  document.getElementById('log-strip').innerHTML =
    logs.map(l => `<div class="log-line ${l.type}">${l.msg}</div>`).join('');
}

function setStatus(state, text) {
  document.getElementById('status-pill').className = `status-pill ${state}`;
  document.getElementById('status-text').textContent = text;
}

async function doPing() {
  const url = document.getElementById('url-input').value.trim();
  if (!url) return;
  const t0 = performance.now();
  const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
  try {
    const res  = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    const data = await res.json().catch(() => ({}));
    const ms   = Math.round(performance.now() - t0);
    checks++;
    document.getElementById('m-checks').textContent = checks;
    const latEl = document.getElementById('m-latency');
    latEl.textContent = `${ms} ms`;
    latEl.className   = ms < 400 ? 'metric-val' : ms < 1200 ? 'metric-val warn' : 'metric-val danger';
    if (data.uptime !== undefined) {
      document.getElementById('m-srv-uptime').textContent = `${data.uptime}s`;
    }
    if (res.ok) {
      setStatus('alive', 'ALIVE');
      addLog(`[${ts}] ${res.status} OK — ${ms}ms`, 'ok');
    } else {
      setStatus('dead', `HTTP ${res.status}`);
      addLog(`[${ts}] HTTP ${res.status} — ${ms}ms`, 'err');
    }
  } catch (e) {
    checks++;
    document.getElementById('m-checks').textContent = checks;
    const label = e.name === 'TimeoutError' ? 'TIMEOUT' : 'OFFLINE';
    setStatus('dead', label);
    addLog(`[${ts}] ${label}: ${(e.message || 'no response').slice(0, 48)}`, 'err');
    document.getElementById('m-latency').textContent = '--- ms';
    document.getElementById('m-latency').className   = 'metric-val danger';
  }
}

function togglePing() {
  const btn = document.getElementById('toggle-btn');
  if (!running) {
    running = true;
    monitorStart = Date.now();
    checks = 0;
    document.getElementById('m-checks').textContent   = '0';
    document.getElementById('url-input').disabled     = true;
    btn.textContent = 'STOP';
    btn.className   = 'ping-btn stop';
    setStatus('', 'PINGING');
    doPing();
    pingInterval = setInterval(doPing, 5000);
  } else {
    running = false;
    monitorStart = null;
    clearInterval(pingInterval);
    document.getElementById('url-input').disabled       = false;
    document.getElementById('m-uptime').textContent     = '--:--';
    document.getElementById('m-srv-uptime').textContent = '---s';
    btn.textContent = 'START';
    btn.className   = 'ping-btn';
    setStatus('', 'IDLE');
    addLog('[--:--:--] monitoring stopped', '');
  }
}

document.getElementById('toggle-btn').addEventListener('click', togglePing);
