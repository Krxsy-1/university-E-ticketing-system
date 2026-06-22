# Troubleshooting: "Proceed to Payment" Button Not Working

## Quick Checklist

### Step 1: Backend Server
- [ ] Is Node.js backend running?
  ```bash
  npm start
  ```
  You should see: `UniTickets server running on http://localhost:3000`

### Step 2: Browser Console Check
1. Open browser DevTools: **F12** (Windows) or **Cmd+Option+J** (Mac)
2. Go to **Console** tab
3. Look for any red error messages
4. Paste these commands and check outputs:
   ```javascript
   // Should show the button element
   document.getElementById('proceedBtn')
   
   // Should show the sidebar button
   document.getElementById('proceedBtnSidebar')
   
   // Should show form input
   document.getElementById('buyerName')
   ```

### Step 3: Form Validation
Before clicking "Proceed to Payment", ensure ALL fields are filled:
- [ ] Full Name (required)
- [ ] Matric Number (required)
- [ ] Department (required)
- [ ] Email Address (required, must be valid format: `user@example.com`)

### Step 4: Test the Button
1. Fill in all form fields with valid data
2. Click "Proceed to Payment" button
3. Check console for messages:
   - You should see: `Sending ticket...` (blue info toast)
   - Then: `Ticket sent!` (green success toast)
   - Or error if server not running

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Button doesn't respond | Backend not running | Run `npm start` |
| "Email send failed" toast | Server can't send email | Check Gmail credentials in `.env` |
| "Ticket sent" but no email arrives | Invalid email or spam folder | Check spam folder, verify email format |
| "Missing name/matric/dept/email" | Form field empty | Fill all required fields before clicking |
| Button disappears after click | Long delay due to email send | Wait 3-5 seconds for redirect |

### Form Field IDs (for debugging)
```javascript
// In browser console, test these exist:
document.getElementById('buyerName').value          // Should show your name
document.getElementById('buyerMatricNumber').value  // Should show matric #
document.getElementById('buyerDepartment').value    // Should show dept
document.getElementById('buyerEmail').value         // Should show email
```

### Network Check (for API calls)
1. Open DevTools → **Network** tab
2. Click "Proceed to Payment"
3. Look for a POST request to `localhost:3000/api/send-ticket`
4. Click it and check:
   - **Status**: Should be `200` (success) or `500` (if error)
   - **Response**: Should show `{"success": true, "message": "..."}`

### Final Reset Steps
If nothing works:
1. **Clear browser cache**: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. **Restart backend**: Stop terminal with Ctrl+C, then run `npm start` again
3. **Refresh page**: Ctrl+R or Cmd+R
4. **Try again**: Fill form and click button

---

**Still stuck?** Check the terminal where you ran `npm start` for error messages from the backend.
