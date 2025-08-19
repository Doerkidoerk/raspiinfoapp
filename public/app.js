const els = {
temp: document.getElementById('temp'),
cpu: document.getElementById('cpu'),
freq: document.getElementById('freq'),
ram: document.getElementById('ram'),
tempBar: document.getElementById('tempBar'),
cpuBar: document.getElementById('cpuBar'),
freqBar: document.getElementById('freqBar'),
ramBar: document.getElementById('ramBar'),
ramText: document.getElementById('ramText'),
updated: document.getElementById('updated'),
host: document.getElementById('host'),
uptime: document.getElementById('uptime')
};function formatBytes(kb) {
const mb = kb / 1024; const gb = mb / 1024;
return gb >= 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(0)} MB`;
}

function formatUptime(sec) {
const d = Math.floor(sec / 86400);
const h = Math.floor((sec % 86400) / 3600);
const m = Math.floor((sec % 3600) / 60);
return `${d} Tage ${h} h ${m} min`;
}

function tempClass(t) {
if (t >= 75) return 'hot';
if (t >= 60) return 'warm';
return 'cool';
}
async function tick() {
try {
const res = await fetch('/api/stats', { cache: 'no-store' });
const s = await res.json();

document.body.classList.remove('hot','warm','cool');
document.body.classList.add(tempClass(s.tempC));

els.temp.textContent = s.tempC.toFixed(1);
els.cpu.textContent = s.cpuUsagePct.toFixed(1);
els.freq.textContent = s.cpuFreqMHz.toFixed(0);
els.ram.textContent = s.ramUsedPct.toFixed(1);

els.tempBar.style.width = Math.min(100, (s.tempC / 85) * 100) + '%';
els.cpuBar.style.width = Math.min(100, s.cpuUsagePct) + '%';
// Normalize freq bar to 0..2000 MHz typical Pi 4 range
els.freqBar.style.width = Math.min(100, (s.cpuFreqMHz / 2000) * 100) + '%';
els.ramBar.style.width = Math.min(100, s.ramUsedPct) + '%';

els.ramText.textContent = `${formatBytes(s.ram.usedKB)} von ${formatBytes(s.ram.totalKB)}`;
els.updated.textContent = `Aktualisiert: ${new Date(s.updatedAt).toLocaleTimeString()}`;
els.host.textContent = s.hostname;
els.uptime.textContent = `Uptime: ${formatUptime(s.uptimeSec)}`;} catch (e) {
els.updated.textContent = 'Fehler beim Laden – erneut versuchen…';
console.error(e);
}
}

setInterval(tick, 2000);
window.addEventListener('load', tick);
