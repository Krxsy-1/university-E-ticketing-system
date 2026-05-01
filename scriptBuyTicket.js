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

        function openMailClient(email, subject, body) {
            const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            // Open in new window/tab to avoid navigating away
            window.open(mailto, '_blank');
        }

        function handleProceed() {
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
            const total = unit * quantity;
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

            // Generate ticket and download
            const ticketHtml = generateTicketHTML(purchase);
            downloadFile(`uniticket-${id}.html`, ticketHtml, 'text/html');

            // Prepare mail body (concise) and open mail client
            const subject = `Your tickets for ${title}`;
            const body = `Hi ${buyer},\n\nThanks for your purchase.\n\nOrder: ${quantity} x ${title}\nTotal: ₦${total.toLocaleString()}\nOrder ID: ${id}\n\nA printable ticket has been downloaded to your device. You can attach it to this email if you'd like to keep a copy in your inbox.\n\nRegards,\nUniTickets`;
            openMailClient(email, subject, body);

            // Notify user
            if (window.showSuccess) showSuccess('Purchase successful', `A ticket download was started and an email draft was opened to ${email}`);
            else alert(`Purchase successful. Ticket download started and email draft opened for ${email}`);

            // Redirect after short delay
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1400);
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