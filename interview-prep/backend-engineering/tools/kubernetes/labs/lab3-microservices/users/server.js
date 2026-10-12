const http = require('http');
const USERS = { 1: { id: 1, name: 'Ada' }, 2: { id: 2, name: 'Linus' } };

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health') return res.end('{"status":"ok"}');
  const m = req.url.match(/^\/users\/(\d+)$/);
  if (m && USERS[m[1]]) return res.end(JSON.stringify(USERS[m[1]]));
  res.statusCode = 404; res.end('{"error":"not found"}');
});
server.listen(3000, '0.0.0.0', () => console.log('users svc on 3000'));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
