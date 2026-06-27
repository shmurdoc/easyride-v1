const http = require('http');

const METRO_PORT = 8084;
const PROXY_PORT = 8081;

const server = http.createServer((req, res) => {
  const fwdHeaders = { ...req.headers };
  delete fwdHeaders['host'];
  delete fwdHeaders['connection'];

  const options = {
    hostname: 'localhost',
    port: METRO_PORT,
    path: req.url,
    method: req.method,
    headers: fwdHeaders,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const status = proxyRes.statusCode;
    const respHeaders = { ...proxyRes.headers };
    delete respHeaders['transfer-encoding'];
    delete respHeaders['connection'];

    const chunks = [];
    proxyRes.on('data', (c) => chunks.push(c));
    proxyRes.on('end', () => {
      const body = Buffer.concat(chunks);
      respHeaders['content-length'] = body.length;
      res.writeHead(status, respHeaders);
      res.end(body);
    });
    proxyRes.on('error', (e) => {
      if (!res.headersSent) {
        res.writeHead(502);
        res.end('proxy response error: ' + e.message);
      }
    });
  });

  proxyReq.on('error', (e) => {
    if (!res.headersSent) {
      res.writeHead(502);
      res.end('proxy request error: ' + e.message);
    }
  });

  req.on('error', () => proxyReq.destroy());
  req.pipe(proxyReq);
});

server.on('error', (e) => {
  console.error('Server error:', e.message);
  process.exit(1);
});

server.listen(PROXY_PORT, () => {
  console.log('Proxy on :8081 -> Metro on :8084');
});
