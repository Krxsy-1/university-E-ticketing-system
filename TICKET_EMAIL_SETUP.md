# UniTickets - Direct Email Ticket Sending Setup

This guide will help you set up the backend email service to send tickets directly to user inboxes.

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Gmail account** (or another email service with SMTP support)

## Setup Steps

### 1. Install Backend Dependencies

Navigate to the project folder and run:

```bash
npm install
```

This will install Express, Nodemailer, CORS, and dotenv.

### 2. Configure Email Service

#### **Option A: Using Gmail (Recommended for Testing)**

1. Go to your Google Account: https://myaccount.google.com
2. Select **Security** from the left menu
3. Enable **2-Step Verification** (if not already enabled)
4. Search for **"App passwords"** in the Security settings
5. Select **Mail** and **Windows (or your device)**
6. Google will generate a 16-character app password
7. Copy this password

#### **Option B: Using Another Email Service**

Update the `.env` file with your provider's SMTP settings:
- Gmail: `smtp.gmail.com`
- Outlook: `smtp-mail.outlook.com`
- Yahoo: `smtp.mail.yahoo.com`

### 3. Create `.env` File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your credentials:

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
PORT=3000
```

**⚠️ Important:** Never commit `.env` to version control (it's already in `.gitignore`)

### 4. Start the Backend Server

Run the server:

```bash
npm start
```

Or for development (with auto-reload):

```bash
npm run dev
```

You should see:
```
UniTickets server running on http://localhost:3000
Email service ready: true
```

### 5. Test the System

1. Open the app in your browser (e.g., `http://localhost:8080` or your dev server)
2. Login as a student
3. Go to an event and click "Buy Ticket"
4. Fill in all fields with a **valid email address** (use your own email to test)
5. Click "Proceed"
6. You should receive the ticket email in seconds

## How It Works

1. **User fills out the purchase form** with their email
2. **Frontend sends purchase data to backend** via POST to `/api/send-ticket`
3. **Backend generates an HTML email** with ticket details
4. **Nodemailer sends the email** directly to the user's inbox
5. **Success notification** is shown to the user
6. **User is redirected** back to the dashboard

## Troubleshooting

### "Failed to send ticket email"

**Problem:** Backend not running
- **Solution:** Make sure the server is running with `npm start`

**Problem:** Invalid Gmail credentials
- **Solution:** Verify you're using an app password (not your regular password)
- Go back to https://myaccount.google.com/apppasswords and regenerate

**Problem:** CORS error
- **Solution:** Ensure the backend is running on `http://localhost:3000`
- Check that CORS is enabled in `server.js`

### Email not arriving

**Problem:** Email is in spam folder
- **Solution:** Mark the email as "Not spam" to improve delivery
- Consider using a custom domain email instead of Gmail for production

**Problem:** "Less secure app access" blocked
- **Solution:** Use an app password (see Setup Step 2 Option A)

## Production Deployment

For production, you'll need to:

1. **Deploy the backend** (Heroku, Railway, AWS, etc.)
2. **Update the API endpoint** in `scriptBuyTicket.js`:
   ```javascript
   const response = await fetch('https://your-production-domain.com/api/send-ticket', {
   ```
3. **Use environment variables** for email credentials on your hosting platform
4. **Enable HTTPS** and proper CORS settings for your domain

## File Structure

```
universityETicketingSystem/
├── server.js                 # Backend API (email sending)
├── package.json              # Node.js dependencies
├── .env.example              # Environment template
├── .env                       # Your credentials (NOT in git)
├── scriptBuyTicket.js        # Frontend (updated with API call)
├── dashboard.html            # Student dashboard
├── buyTicket.html            # Ticket purchase page
└── ...other files
```

## API Endpoint Reference

### POST `/api/send-ticket`

**Request body:**
```json
{
  "id": "abc123",
  "title": "Tech Conference 2026",
  "quantity": 2,
  "total": 5000,
  "buyer": "John Doe",
  "matric": "201109012",
  "dept": "Computer Science",
  "email": "john@example.com",
  "date": "5/1/2026, 2:30:00 PM"
}
```

**Success response (200):**
```json
{
  "success": true,
  "message": "Ticket sent successfully to john@example.com"
}
```

**Error response (400/500):**
```json
{
  "error": "Failed to send ticket email",
  "details": "error message here"
}
```

---

**Need help?** Check the console logs in the terminal where the server is running for detailed error messages.
