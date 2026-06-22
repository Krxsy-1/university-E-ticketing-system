# 500 Error: Email Sending Failed - Troubleshooting Guide

## What This Error Means
Your backend server is rejecting the email send request. This is almost always a **Gmail authentication issue**.

## Step-by-Step Fix

### Step 1: Stop the Current Server
In your terminal where `npm start` is running:
```bash
Ctrl+C
```

### Step 2: Delete Your Current `.env` File
```bash
rm .env
```
(or manually delete it from the file explorer)

### Step 3: Follow Gmail Setup EXACTLY

#### 3a. Enable 2-Step Verification
1. Go to https://myaccount.google.com
2. Click **Security** (left sidebar)
3. Find **2-Step Verification**
4. If it's OFF: Click it and turn it ON (follow the prompts)
5. If it's ON: Skip to step 3b

#### 3b. Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. **Device type dropdown**: Select **Mail**
3. **Operating system dropdown**: Select **Windows** (or your OS)
4. Click **GENERATE**
5. Google will show a **16-character password in a blue box**
   - Example: `abcd efgh ijkl mnop` (with spaces)
6. **COPY THE ENTIRE PASSWORD** (including spaces)

### Step 4: Create New `.env` File
In your project folder, create a new file named `.env` (no extension):

**Content:**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASSWORD=paste-your-16-char-password-here
PORT=3000
```

**Example (with real values):**
```
EMAIL_SERVICE=gmail
EMAIL_USER=adaor@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
PORT=3000
```

### Step 5: Restart the Server
```bash
npm start
```

You should see:
```
✅ Email service ready: true
UniTickets server running on http://localhost:3000
```

If you see `❌ Email transporter error:` instead, your credentials are still wrong.

### Step 6: Test the Button
1. Reload your app in the browser
2. Fill in the checkout form
3. Click "Proceed to Payment"
4. Check for success

## Common Problems

### Problem: Email still shows 500 error
**Check:**
1. Did you copy the ENTIRE 16-character password (with spaces)?
2. Is EMAIL_USER your full Gmail address?
3. Did you save the `.env` file?
4. Did you restart the server after saving `.env`?
5. Does the terminal show `✅ Email service ready`?

**Solution:**
- Stop server (Ctrl+C)
- Delete `.env` file completely
- Create it again, very carefully
- Restart server

### Problem: "Username and Password not accepted"
This error in the terminal means:
- Your email password is wrong
- You didn't use an app password (you used your regular Gmail password instead)
- Your 2-Step Verification is not enabled

**Solution:**
- Make sure 2-Step Verification is ON: https://myaccount.google.com/security
- Get a NEW app password: https://myaccount.google.com/apppasswords
- Update `.env` with the new password

### Problem: "Email service ready: false"
Server can't verify your credentials.

**Solution:**
- Check your `.env` file for typos
- Make sure there are no extra spaces before/after your credentials
- Use exactly: `EMAIL_USER=your@gmail.com` (no quotes)

## Testing Steps

After restarting the server, check these in order:

1. **Terminal shows email service ready?**
   ```
   ✅ Email service ready: true
   ```
   If NO → Fix your `.env` credentials

2. **Can you reach the health check?**
   Open browser and go to: http://localhost:3000/api/health
   Should show: `{"status":"ok","timestamp":"..."}`
   If error → Server isn't running

3. **Fill checkout form completely:**
   - Full Name: Your Name
   - Matric: 201109012
   - Department: Computer Science
   - Email: **Use your own Gmail** (to test)

4. **Click Proceed to Payment**
   - Look for blue "Sending ticket..." toast
   - Should change to green "Ticket sent!" in 3-5 seconds
   - Check your Gmail inbox for the ticket email

## Still Having Issues?

**Check terminal output:**
Look in the terminal where you ran `npm start` for error messages:
```
❌ Email send error: ...
   Code: ...
   Response: ...
```

Common error codes:
- `EAUTH` → Authentication failed (check password)
- `ESOCKET` → Can't connect to Gmail servers (check internet)
- `535` → Bad credentials (wrong email/password)

**Double-check your `.env`:**
Open it and verify:
- `EMAIL_SERVICE=gmail` ✓
- `EMAIL_USER=your-real-email@gmail.com` ✓
- `EMAIL_PASSWORD=your-16-char-app-password` ✓
- `PORT=3000` ✓

**Contact Gmail Support:**
If everything is correct but still fails:
- Go to https://support.google.com/mail/?p=BadCredentials
- Follow their steps to unlock your account

---

**Pro Tip:** After getting it working once, keep your `.env` file safe. Add `.env` to `.gitignore` (already done) so your password never leaks on GitHub.
