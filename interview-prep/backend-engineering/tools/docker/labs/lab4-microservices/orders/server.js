const http = require('http');
const USERS_URL = process.env.USERS_URL || 'http://users:3000'; // service-name DNS, never localhost

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health') return res.end('{"status":"ok"}');

  const m = req.url.match(/^\/orders\/(\d+)$/);
  if (!m) { res.statusCode = 404; return res.end('{"error":"not found"}'); }

  // Service-to-service call across the Docker network
  http.get(`${USERS_URL}/users/${m[1]}`, (r) => {
    let body = '';
    r.on('data', (c) => (body += c));
    r.on('end', () => res.end(JSON.stringify({ orderId: m[1], item: 'keyboard', user: JSON.parse(body) })));
  }).on('error', (e) => { res.statusCode = 502; res.end(JSON.stringify({ error: 'users service unreachable', detail: e.message })); });
});
server.listen(3000, '0.0.0.0', () => console.log('orders svc on 3000'));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
