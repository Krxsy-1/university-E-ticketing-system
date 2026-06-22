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

        if (window.logger && window.logger.log) window.logger.log('Button elements found:', { proceedBtn: !!proceedBtn, proceedBtnSidebar: !!proceedBtnSidebar, cancelBtn: !!cancelBtn });

        function isValidEmail(email) {
            // Simple RFC-like email check
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

                function generateTicketHTML(purchase) {
                        const { id, title, quantity, total, buyer, matric, dept, email, date } = purchase;
                        return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Ticket - ${title}</title>
                        <meta name="viewport" content="width=device-width,initial-scale=1" />
                        <style>
                                :root {
                                    --bg: #f5f6fb;
                                    --bg-elevated: #fff;
                                    --text-main: #111827;
                                    --text-muted: #6b7280;
                                    --accent: #4f46e5;
                                    --border-subtle: #e5e7eb;
                                    --radius-lg: 18px;
                                }
                                body.dark {
                                    --bg: #050816;
                                    --bg-elevated: #0b1020;
                                    --text-main: #e5e7eb;
                                    --text-muted: #9ca3af;
                                    --accent: #6366f1;
                                    --border-subtle: #1f2933;
                                }
                                body {
                                    background: radial-gradient(circle at top left, #e0e7ff 0, var(--bg) 40%, var(--bg) 100%);
                                    color: var(--text-main);
                                    font-family: Inter, system-ui, Arial, sans-serif;
                                    padding: 20px;
                                    margin: 0;
                                    transition: background 0.3s;
                                }
                                body.dark {
                                    background: radial-gradient(circle at top left, #111827 0, #020617 40%, #020617 100%);
                                }
                                .ticket {
                                    max-width: 680px;
                                    margin: 0 auto;
                                    border: 1px solid var(--border-subtle);
                                    border-radius: 12px;
                                    background: var(--bg-elevated);
                                    padding: 24px 20px;
                                    box-shadow: 0 8px 32px rgba(15,23,42,0.08);
                                }
                                .header {
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                }
                                .title {
                                    font-weight: 700;
                                    font-size: 22px;
                                    color: var(--accent);
                                }
                                .meta {
                                    margin-top: 12px;
                                    font-size: 15px;
                                    color: var(--text-muted);
                                }
                                .section {
                                    margin-top: 18px;
                                }
                                .qr {
                                    width: 120px;
                                    height: 120px;
                                    background: var(--bg-soft, #f3f4f6);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border-radius: 8px;
                                    color: #9ca3af;
                                    font-size: 32px;
                                    border: 1px dashed var(--border-subtle);
                                }
                                @media (max-width: 600px) {
                                    .ticket { padding: 12px 4px; }
                                    .header { flex-direction: column; align-items: flex-start; gap: 8px; }
                                }
                        </style>
                        <script>
                            // Apply dark mode if user's system or localStorage prefers it
                            (function() {
                                const mql = window.matchMedia('(prefers-color-scheme: dark)');
                                const saved = localStorage.getItem('unitickets-theme');
                                if (saved === 'dark' || (!saved && mql.matches)) {
                                    document.body.classList.add('dark');
                                }
                            })();
                        </script>
                        </head><body><div class="ticket"><div class="header"><div><div class="title">${title}</div><div style="font-size:12px;color:var(--text-muted)">UniTickets</div></div><div><strong>Ticket #${id}</strong></div></div>
                        <div class="meta">Date: ${date} • Quantity: ${quantity} • Total: ₦${total.toLocaleString()}</div>
                        <div class="section"><strong>Buyer</strong><div style="margin-top:6px">${buyer} • ${matric} • ${dept}</div></div>
                        <div class="section"><strong>Contact</strong><div style="margin-top:6px">${email}</div></div>
                        <div class="section"><div style="font-size:12px;color:var(--text-muted)">Present this ticket at the event entrance.</div></div>
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
                if (window.logger && window.logger.error) window.logger.error('Ticket email error:', error);
                throw error;
            }
        }

        async function handleProceed() {
            if (window.logger && window.logger.log) window.logger.log('handleProceed() called');
            const buyer = document.getElementById('buyerName').value.trim();
            const matric = document.getElementById('buyerMatricNumber').value.trim();
            const dept = document.getElementById('buyerDepartment').value.trim();
            const email = document.getElementById('buyerEmail').value.trim();

            if (window.logger && window.logger.log) window.logger.log('Form values:', { buyer, matric, dept, email });

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
                // Save latest purchase for ticket page
                localStorage.setItem('unitickets-latest-purchase', JSON.stringify(purchase));
            } catch (err) {
                // ignore storage errors
            }

            // Show loading state
            if (window.showInfo) showInfo('Sending ticket', 'Please wait while we send your ticket to ' + email);

            // Send ticket email via backend
            let emailSuccess = false;
            try {
                await sendTicketEmail(purchase);
                emailSuccess = true;
                // Notify user of success
                if (window.showSuccess) showSuccess('Ticket sent!', `Your ticket has been sent to ${email}`);
                else alert(`Purchase successful. Ticket sent to ${email}`);
            } catch (error) {
                if (window.showError) showError('Email send failed', 'Please check if the server is running. You can still download your ticket.');
                else alert('Failed to send ticket email. Please try again.');
                if (window.logger && window.logger.error) window.logger.error(error);
            }

            // Redirect to ticket.html to show the ticket
            window.location.href = 'ticket.html';
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

        // Hide Download Ticket button on load
        document.addEventListener('DOMContentLoaded', function() {
            const downloadBtn = document.getElementById('downloadTicketBtn');
            if (downloadBtn) downloadBtn.style.display = 'none';
        });