import fs from 'fs';
);
const kb = k => Number(String(lines[k]).replace(/ kB$/, ''));
const total = kb('MemTotal');
// MemAvailable approximates free + reclaimable cache
const available = kb('MemAvailable');
const used = total - available;
return { totalKB: total, usedKB: used, usedPct: total ? (used / total) * 100 : NaN };
}

function readCpuTimes() {
// Read aggregated CPU line from /proc/stat
const first = fs.readFileSync('/proc/stat', 'utf8').split('\n').find(l => l.startsWith('cpu '));
const parts = first.split(/\s+/).slice(1).map(Number);
const [user, nice, system, idle, iowait, irq, softirq, steal] = parts;
const idleAll = idle + iowait;
const nonIdle = user + nice + system + irq + softirq + steal;
const total = idleAll + nonIdle;
return { idleAll, total };
}

let prevTimes = readCpuTimes();
let sample = {
tempC: NaN,
cpuFreqMHz: NaN,
cpuUsagePct: NaN,
ramUsedPct: NaN,
ram: { totalKB: 0, usedKB: 0 },
updatedAt: new Date().toISOString(),
hostname: os.hostname(),
uptimeSec: os.uptime()
};

function refresh() {
// Temperature (millidegC on Pi)
const rawTemp = readNumber(paths.temp);
const tempC = Number.isFinite(rawTemp) ? rawTemp / 1000 : NaN;

// CPU frequency (kHz)
const rawFreq = readNumber(paths.freq);
const cpuFreqMHz = Number.isFinite(rawFreq) ? rawFreq / 1000 : NaN;

// CPU usage via delta of /proc/stat
const nowTimes = readCpuTimes();
const totald = nowTimes.total - prevTimes.total;
const idled = nowTimes.idleAll - prevTimes.idleAll;
const cpuUsagePct = totald > 0 ? ((totald - idled) / totald) * 100 : sample.cpuUsagePct;
prevTimes = nowTimes;

// Memory
const mem = readMem();

sample = {
tempC: Number(tempC.toFixed(1)),
cpuFreqMHz: Number(cpuFreqMHz.toFixed(0)),
cpuUsagePct: Number(cpuUsagePct.toFixed(1)),
ramUsedPct: Number(mem.usedPct.toFixed(1)),
ram: { totalKB: mem.totalKB, usedKB: mem.usedKB },
updatedAt: new Date().toISOString(),
hostname: os.hostname(),
uptimeSec: os.uptime()
};
}

// Refresh every 1s
setInterval(refresh, 1000);
refresh();

app.get('/api/stats', (_req, res) => {
res.set('Cache-Control', 'no-store');
res.json(sample);
});

app.listen(PORT, () => {
console.log(`pi-stats listening on http://localhost:${PORT}`);
});
