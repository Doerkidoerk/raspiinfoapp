import assert from 'assert';
import { spawn } from 'child_process';

const PORT = 3100;

const server = spawn('node', ['server.js'], {
  env: { ...process.env, PORT: PORT },
  stdio: 'inherit',
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

try {
  await sleep(500);
  const res = await fetch(`http://localhost:${PORT}/api/stats`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok('tempC' in json);
  console.log('API responded with tempC:', json.tempC);
  console.log('Test passed');
} finally {
  server.kill();
  await new Promise(resolve => server.on('exit', resolve));
}
