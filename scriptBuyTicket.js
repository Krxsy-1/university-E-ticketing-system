        // Dark mode toggle - synced across pages
        const toggle = document.getElementById("darkToggle");
        const body = document.body;

        function applyTheme(theme) {
            if (theme === "dark") {
                body.classList.add("dark");
                if (toggle) toggle.checked = true;
            } else {
                body.classList.remove("dark");
                if (toggle) toggle.checked = false;
            }
        }

        const savedTheme = localStorage.getItem("unitickets-theme");
        applyTheme(savedTheme || "light");

        if (toggle) {
            toggle.addEventListener("change", () => {
                const newTheme = toggle.checked ? "dark" : "light";
                applyTheme(newTheme);
                localStorage.setItem("unitickets-theme", newTheme);
            });
        }

        // Helper to read query params
        function qs(key) {
            const params = new URLSearchParams(window.location.search);
            return params.get(key) || '';
        }

        // Parse event data from URL
        const titleParam = qs('event');
        const priceParam = qs('price');

        const title = titleParam ? decodeURIComponent(titleParam) : 'Event';
        const price = priceParam ? decodeURIComponent(priceParam) : '';

        // Populate event details
        document.getElementById('eventTitle').innerText = title;
        document.getElementById('summaryEventName').innerText = title;
        document.getElementById('summaryPrice').innerText = price || 'Free';
        
        // Set placeholder dates/times (would come from backend in real app)
        document.getElementById('eventDate').innerText = '15 Mar 2026';
        document.getElementById('eventTime').innerText = '6:00 PM';
        document.getElementById('eventLocation').innerText = 'Main Auditorium';

        // Quantity management
        let quantity = 1;

        function incrementQty() {
            quantity++;
            document.getElementById('qty').value = quantity;
            updateSummary();
        }

        function decrementQty() {
            if (quantity > 1) {
                quantity--;
                document.getElementById('qty').value = quantity;
                updateSummary();
            }
        }

        function parseNumberFromCurrency(str) {
            if (!str) return 0;
            const n = str.replace(/[^0-9\.]/g, '');
            return parseFloat(n) || 0;
        }

        function updateSummary() {
            document.getElementById('summaryQty').innerText = quantity;
            const unit = parseNumberFromCurrency(price);
            const subtotal = unit * quantity;
            const fee = 0;
            const total = subtotal + fee;

            document.getElementById('subtotal').innerText = `₦${subtotal.toLocaleString()}`;
            document.getElementById('totalAmount').innerText = `₦${total.toLocaleString()}`;
        }

        // Initial summary update
        updateSummary();

        // Button handlers
        const proceedBtn = document.getElementById('proceedBtn');
        const proceedBtnSidebar = document.getElementById('proceedBtnSidebar');
        const cancelBtn = document.getElementById('cancelBtn');

        function isValidEmail(email) {
            // Simple RFC-like email check
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function generateTicketHTML(purchase) {
            const { id, title, quantity, total, buyer, matric, dept, email, date } = purchase;
            return `<!doctype html><html><head><meta charset="utf-8"><title>Ticket - ${title}</title>
            <style>body{font-family:Inter,system-ui,Arial,sans-serif;padding:20px;color:#111827} .ticket{max-width:680px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;padding:20px} .header{display:flex;justify-content:space-between;align-items:center} .title{font-weight:700;font-size:20px;color:#4f46e5} .meta{margin-top:12px;font-size:14px;color:#374151} .section{margin-top:18px} .qr{width:120px;height:120px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#9ca3af}</style>
            </head><body><div class="ticket"><div class="header"><div><div class="title">${title}</div><div style="font-size:12px;color:#6b7280">UniTickets</div></div><div><strong>Ticket #${id}</strong></div></div>
            <div class="meta">Date: ${date} • Quantity: ${quantity} • Total: ₦${total.toLocaleString()}</div>
            <div class="section"><strong>Buyer</strong><div style="margin-top:6px">${buyer} • ${matric} • ${dept}</div></div>
            <div class="section"><strong>Contact</strong><div style="margin-top:6px">${email}</div></div>
            <div class="section" style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:12px;color:#9ca3af">Present this ticket at the event entrance.</div><div class="qr">QR</div></div>
            </div></body></html>`;
        }

        function downloadFile(filename, content, mime = 'text/html') {
            const blob = new Blob([content], { type: mime });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        }

        async function sendTicketEmail(purchase) {
            try {
                const response = await fetch('http://localhost:3000/api/send-ticket', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(purchase)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to send ticket');
                }

                const result = await response.json();
                return result;
            } catch (error) {
                console.error('Ticket email error:', error);
                throw error;
            }
        }

        async function handleProceed() {
            const buyer = document.getElementById('buyerName').value.trim();
            const matric = document.getElementById('buyerMatricNumber').value.trim();
            const dept = document.getElementById('buyerDepartment').value.trim();
            const email = document.getElementById('buyerEmail').value.trim();

            if (!buyer) {
                if (window.showWarning) showWarning('Missing name', 'Please enter your full name');
                else alert('Please enter your full name');
                return;
            }
            if (!matric) {
                if (window.showWarning) showWarning('Missing matric', 'Please enter your matric number');
                else alert('Please enter your matric number');
                return;
            }
            if (!dept) {
                if (window.showWarning) showWarning('Missing department', 'Please enter your department');
                else alert('Please enter your department');
                return;
            }
            if (!email || !isValidEmail(email)) {
                if (window.showError) showError('Invalid email', 'Please enter a valid email address');
                else alert('Please enter your email');
                return;
            }

            const unit = parseNumberFromCurrency(price);
            const safeUnit  = isNaN(unit) ? 0 : unit;
            const total = safeUnit * quantity;
            const id = Date.now().toString(36);
            const purchase = {
                id,
                title,
                quantity,
                total,
                buyer,
                matric,
                dept,
                email,
                date: new Date().toLocaleString()
            };

            // Save purchase locally (for history)
            try {
                const existing = JSON.parse(localStorage.getItem('unitickets-purchases') || '[]');
                existing.push(purchase);
                localStorage.setItem('unitickets-purchases', JSON.stringify(existing));
            } catch (err) {
                // ignore storage errors
            }

            // Show loading state
            if (window.showInfo) showInfo('Sending ticket', 'Please wait while we send your ticket to ' + email);

            // Send ticket email via backend
            try {
                await sendTicketEmail(purchase);
                
                // Notify user of success
                if (window.showSuccess) showSuccess('Ticket sent!', `Your ticket has been sent to ${email}`);
                else alert(`Purchase successful. Ticket sent to ${email}`);

                // Redirect after short delay
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
            } catch (error) {
                if (window.showError) showError('Email send failed', 'Please check if the server is running. You can still download your ticket.');
                else alert('Failed to send ticket email. Please try again.');
                console.error(error);
            }
        }

        proceedBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleProceed();
        });

        proceedBtnSidebar.addEventListener('click', (e) => {
            e.preventDefault();
            handleProceed();
        });

        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'dashboard.html';
        });