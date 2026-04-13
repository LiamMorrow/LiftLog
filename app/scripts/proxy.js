const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({ target: 'http://localhost:8081' });

proxy.on('error', (err, req, res) => {
  if (err.code === 'ECONNREFUSED') {
    res.writeHead(502);
    res.end('Expo not ready yet, refresh in a moment...');
  } else {
    res.writeHead(500);
    res.end(err.message);
  }
});

http
  .createServer((req, res) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    proxy.web(req, res);
  })
  .listen(8082, () => console.log('Proxy on http://localhost:8082'));
