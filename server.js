const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const fs = require('fs');
const path = require('path');
const session = require('express-session');

// Simple server-side logger (keep errors visible)
const serverLogger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// Sessions (very small demo setup)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // secure should be true behind HTTPS in production
}));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Email transporter configuration
// For Gmail: prefer using app password and secure SMTP (host smtp.gmail.com, port 465)
// You may also set SMTP_HOST and SMTP_PORT in .env to use a custom server
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASSWORD;
// Some services (like Gmail) display app passwords with spaces when copying from UI.
// Normalize by trimming and removing whitespace so pasted keys still work.
const EMAIL_PASS_CLEAN = EMAIL_PASS ? EMAIL_PASS.trim().replace(/\s+/g, '') : EMAIL_PASS;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;

if (!EMAIL_USER || !EMAIL_PASS_CLEAN) {
  console.error('❌ Missing EMAIL_USER or EMAIL_PASSWORD in environment. Email sending will fail.');
}

let transporterOptions;
if (SMTP_HOST && SMTP_PORT) {
  transporterOptions = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: { user: EMAIL_USER, pass: EMAIL_PASS_CLEAN },
  };
} else if ((EMAIL_SERVICE || '').toLowerCase() === 'gmail' || !EMAIL_SERVICE) {
  // Explicitly use Gmail SMTP with secure option
  transporterOptions = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS_CLEAN },
  };
} else {
  transporterOptions = {
    service: EMAIL_SERVICE,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS_CLEAN },
  };
}

const transporter = nodemailer.createTransport(transporterOptions);

// Verify transporter connection (async)
(async () => {
  try {
    await transporter.verify();
    console.log('✅ Email transporter verified and ready');
  } catch (err) {
    console.error('❌ Email transporter verification failed');
    console.error('   message:', err && err.message);
    console.error('   code:', err && err.code);
    console.error('   response:', err && err.response);
    console.error('   transporter options:', JSON.stringify({ host: transporterOptions.host || null, port: transporterOptions.port || null, service: transporterOptions.service || null }));
    console.error('   Make sure you created an app password (for Gmail) and set EMAIL_USER and EMAIL_PASSWORD in .env');
  }
})();

// helper to check config
function emailConfigStatus() {
  return {
    user: EMAIL_USER ? true : false,
    hasPassword: EMAIL_PASS ? true : false,
    usingCustomSMTP: !!(SMTP_HOST && SMTP_PORT),
    service: EMAIL_SERVICE || null,
    smtpHost: SMTP_HOST || null,
    smtpPort: SMTP_PORT || null,
  };
}

// Simple purchases persistence (JSON file)
const DATA_DIR = path.join(__dirname, 'data');
const PURCHASES_FILE = path.join(DATA_DIR, 'purchases.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PURCHASES_FILE)) fs.writeFileSync(PURCHASES_FILE, '[]');
}

function savePurchase(purchase) {
  ensureDataDir();
  const raw = fs.readFileSync(PURCHASES_FILE, 'utf8');
  const arr = JSON.parse(raw || '[]');
  arr.push(purchase);
  fs.writeFileSync(PURCHASES_FILE, JSON.stringify(arr, null, 2));
}

function readPurchases() {
  ensureDataDir();
  const raw = fs.readFileSync(PURCHASES_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}

// Simple admin check middleware (demo only)
function requireAdmin(req, res, next) {
  // example: session flag
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Generate HTML email ticket
function generateTicketEmail(purchase) {
  const { 
    id = "N/A",
    title = "Event",
    quantity = 1,
    total = 0,
    buyer = "Guest",
    matric = "N/A",
    dept = "N/A",
    email, 
    date = new Date(). toLocaleString()
 } = purchase;

 const safeTotal = Number(total) || 0;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5, #ec4899); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.95; }
        .ticket { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; background: #f9fafb; }
        .section { margin: 16px 0; }
        .label { font-weight: 600; color: #4f46e5; font-size: 12px; text-transform: uppercase; }
        .value { font-size: 16px; color: #111827; margin-top: 6px; }
        .meta { display: flex; justify-content: space-between; gap: 20px; }
        .meta-item { flex: 1; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
        .total { font-size: 24px; font-weight: 700; color: #4f46e5; text-align: right; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Your Ticket is Ready!</h1>
          <p>UniTickets - Campus Events, Simplified</p>
        </div>

        <p>Hi ${buyer},</p>
        <p>Thank you for your purchase! Your ticket for <strong>${title}</strong> is confirmed and ready to use.</p>

        <div class="ticket">
          <div class="section">
            <div class="label">Event</div>
            <div class="value">${title}</div>
          </div>

          <div class="meta">
            <div class="meta-item">
              <div class="label">Quantity</div>
              <div class="value">${quantity}</div>
            </div>
            <div class="meta-item">
              <div class="label">Order ID</div>
              <div class="value">#${id}</div>
            </div>
          </div>

          <div class="meta">
            <div class="meta-item">
              <div class="label">Matric Number</div>
              <div class="value">${matric}</div>
            </div>
            <div class="meta-item">
              <div class="label">Department</div>
              <div class="value">${dept}</div>
            </div>
          </div>

          <div class="section">
            <div class="label">Purchase Date</div>
            <div class="value">${date}</div>
          </div>

          <div class="section" style="text-align: right; border-top: 2px solid #e5e7eb; padding-top: 16px; margin-top: 16px;">
            <div class="label">Total Amount</div>
            <div class="total">₦${safeTotal.toLocaleString()}</div>
          </div>
        </div>

        <p><strong>Important:</strong> Present this email confirmation or screenshot at the event entrance. Keep this email safe.</p>

        <div class="footer">
          <p>Questions? Contact us at support@unitickets.edu</p>
          <p>&copy; 2026 UniTickets. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// POST endpoint to send ticket email
app.post('/api/send-ticket', async (req, res) => {
  try {
    const purchase = req.body;
    
    if (!purchase.email || !purchase.title || !purchase.buyer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const emailHtml = generateTicketEmail(purchase);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@unitickets.edu',
      to: purchase.email,
      subject: `Your UniTickets Confirmation - ${purchase.title}`,
      html: emailHtml,
      text: `Ticket for ${purchase.title}\nOrder ID: ${purchase.id}\nTotal: ₦${purchase.total}`,
    };

    const info = await transporter.sendMail(mailOptions);

    // persist purchase (best-effort)
    try { savePurchase(Object.assign({}, purchase, { sentAt: new Date().toISOString(), mailInfo: info })); } catch (e) { serverLogger.warn('Failed to save purchase:', e && e.message); }

    res.json({ 
      success: true, 
      message: 'Ticket sent successfully to ' + purchase.email,
      info
    });
  } catch (error) {
    serverLogger.error('❌ Email send error:', error && error.message);
    serverLogger.error('   Code:', error && error.code);
    serverLogger.error('   Response:', error && error.response);
    res.status(500).json({ 
      error: 'Failed to send ticket email',
      details: error && error.message,
      code: error && error.code
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), emailConfig: emailConfigStatus() });
});

// Debug endpoint: attempt to send a quick test email to ?to=you@domain
app.get('/api/test-email', async (req, res) => {
  const to = req.query.to;
  if (!to) return res.status(400).json({ error: 'Missing `to` query parameter' });

  const mailOptions = {
    from: EMAIL_USER || 'noreply@unitickets.edu',
    to,
    subject: 'UniTickets - Test email',
    text: 'This is a test email from UniTickets server. If you received this, SMTP is working.'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, info });
  } catch (err) {
    serverLogger.error('Test email send failed:', err && err.message);
    res.status(500).json({ success: false, error: err && err.message, code: err && err.code, response: err && err.response });
  }
});

// purchases endpoints
app.post('/api/purchase', (req, res) => {
  const p = req.body;
  if (!p || !p.id) return res.status(400).json({ error: 'Missing purchase data' });
  try { savePurchase(Object.assign({}, p, { recordedAt: new Date().toISOString() })); } catch (e) { serverLogger.error('Failed to save purchase:', e && e.message); return res.status(500).json({ error: 'Failed to save' }); }
  res.json({ success: true });
});

app.get('/api/purchases', requireAdmin, (req, res) => {
  try { const arr = readPurchases(); res.json({ success: true, purchases: arr }); } catch (e) { serverLogger.error('Failed to read purchases:', e && e.message); res.status(500).json({ error: 'Failed to read' }); }
});

// simple admin login for demo (sets session flag) - POST /api/admin-login { email, password }
app.post('/api/admin-login', (req, res) => {
  const { email, password } = req.body || {};
  if (email === 'admin@university.edu' && password === 'admin1234') { req.session.isAdmin = true; return res.json({ success: true }); }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`UniTickets server running on http://localhost:${PORT}`);
});
