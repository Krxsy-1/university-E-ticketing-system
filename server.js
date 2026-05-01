const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Email transporter configuration
// For Gmail: use app password (not regular password)
// For other services: update these settings
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email service ready:', success);
  }
});

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
      text: `Ticket for ${title}\nOrder ID: ${id}\nTotal: ₦${safeTotal}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Ticket sent successfully to ' + purchase.email 
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ 
      error: 'Failed to send ticket email',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`UniTickets server running on http://localhost:${PORT}`);
});
