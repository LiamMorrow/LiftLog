// proxy-server.js

/**
 * HTTPS Proxy Server for Expo Development
 *
 * This proxy server enables serving Expo over HTTPS on localhost with the necessary
 * Cross-Origin policies to support SharedArrayBuffer for SQLite operations.
 *
 * SETUP INSTRUCTIONS:
 *
 * 1. Generate a self-signed certificate for localhost:
 *    Run the following command in your terminal from the app directory:
 *
 *    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost-key.pem -out localhost-cert.pem
 *
 *    (When prompted, enter "localhost" for Common Name, other fields can be left blank)
 *
 * 2. Trust the certificate in your system:
 *    - macOS: Open Keychain Access, drag localhost-cert.pem into System keychain,
 *             double-click it, expand Trust, and set to "Always Trust"
 *    - Windows: Import localhost-cert.pem into Trusted Root Certification Authorities
 *    - Linux: Add to /usr/local/share/ca-certificates/ and run update-ca-certificates
 *
 * 3. Start your Expo development server:
 *    npx expo start
 *
 * 4. Run this proxy server:
 *    node proxy-server.js
 *
 * 5. Access your app at https://localhost:8443
 *
 * The proxy adds Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers
 * required for SharedArrayBuffer support, which enables SQLite to run in the browser.
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const https = require('https');

const app = express();

// Set the required security headers for SharedArrayBuffer
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// Proxy to Expo Metro Bundler (default port is 19000 or 8081)
app.use(
    '/',
    createProxyMiddleware({
        target: 'http://localhost:8081', // Adjust if your Expo server is running on a different port
        changeOrigin: true,
        ws: true, // Support WebSocket connections
    })
);

// Create the HTTPS server
const options = {
    key: fs.readFileSync('localhost-key.pem'),  // path to your private key
    cert: fs.readFileSync('localhost-cert.pem'),  // path to your certificate
};

https.createServer(options, app).listen(8443, () => {
    console.log('Proxy server is running at https://localhost:8443');
});
