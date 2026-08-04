const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');

const { createApiRouter } = require('./api');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const CLIENT_DIR = path.join(__dirname, '..', 'frontend', 'dist');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'mobile-accessories-dev-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { httpOnly: true, sameSite: 'lax' },
    })
  );

  app.use('/api', createApiRouter());
  app.use(express.static(PUBLIC_DIR));

  const indexHtml = path.join(CLIENT_DIR, 'index.html');
  app.use(express.static(CLIENT_DIR));
  app.get('/*splat', (req, res) => {
    if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
    return res
      .status(503)
      .type('text/plain')
      .send('React frontend is not built yet. Run "npm run build" (or "npm run dev" for the Vite dev server).');
  });

  return app;
}

module.exports = { createApp };
