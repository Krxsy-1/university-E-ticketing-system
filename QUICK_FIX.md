# Quick Fix Checklist for 500 Error

## The Problem
Your backend server can't send emails. Error: `500 (Internal Server Error)`

## Root Cause
Gmail credentials in your `.env` file are incorrect or missing.

## Quick Fix (5 minutes)

### ✅ Do These Steps IN ORDER:

1. **Stop the server**
   ```bash
   Ctrl+C (in the terminal where npm start is running)
   ```

2. **Go get your app password**
   - Visit: https://myaccount.google.com/apppasswords
   - Device: **Mail**
   - OS: **Windows**
   - Click **GENERATE**
   - Copy the 16-character password shown (with spaces)

3. **Delete current `.env` file**
   - Find `.env` in your project folder
   - Delete it

4. **Create new `.env` file with:**
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=paste-your-16-char-password-here
   PORT=3000
   ```

5. **Save the file**

6. **Start server again**
   ```bash
   npm start
   ```

7. **Check terminal output:**
   Should show: `✅ Email service ready: true`
   
   If shows `❌ Email transporter error:` → Go back to step 2 and get a NEW app password

8. **Test the button**
   - Reload browser
   - Fill checkout form
   - Click "Proceed to Payment"
   - Should show green "Ticket sent!" within 5 seconds

---

## If Still Broken

See detailed guide: `GMAIL_SETUP_FIX.md`

Key things to verify:
- [ ] 2-Step Verification is ON at https://myaccount.google.com/security
- [ ] You got an app password (not your regular Gmail password)
- [ ] `.env` file exists in project folder
- [ ] EMAIL_USER is your full email (user@gmail.com)
- [ ] EMAIL_PASSWORD is your 16-char app password
- [ ] You restarted server after creating `.env`
- [ ] Terminal shows "Email service ready: true"

---

**The fix is almost always the `.env` credentials. Follow the steps exactly and it will work.**
