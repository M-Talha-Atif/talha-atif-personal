// Tiny app to demonstrate ConfigMap/Secret injection, probes and load balancing. No dependencies.
const http = require('http');
const os = require('os');

const START_DELAY = Number(process.env.STARTUP_DELAY_MS || 5000);
let ready = false;
setTimeout(() => { ready = true; console.log('ready'); }, START_DELAY);

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') { res.end('alive'); return; }                    // liveness
  if (req.url === '/readyz') {                                                  // readiness
    res.statusCode = ready ? 200 : 503; res.end(ready ? 'ready' : 'starting'); return;
  }
  if (req.url === '/unready') { ready = false; res.end('now NOT ready'); return; }
  if (req.url === '/crash') { res.end('bye'); setTimeout(() => process.exit(1), 100); return; }
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    pod: os.hostname(),                                    // changes per pod → proves load balancing
    greeting: process.env.APP_GREETING || '(unset)',       // from ConfigMap
    apiKeyConfigured: Boolean(process.env.API_KEY),        // from Secret (never print secrets)
  }));
});
server.listen(3000, '0.0.0.0', () => console.log('listening on 3000'));
process.on('SIGTERM', () => { console.log('SIGTERM'); server.close(() => process.exit(0)); });
